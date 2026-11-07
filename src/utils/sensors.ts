import { SensorReading } from '../types';

type SensorCallback = (reading: SensorReading) => void;

class SensorService {
  private listeners: Set<SensorCallback> = new Set();
  private isListening = false;
  private isSimulating = false;
  private simulationInterval: number | null = null;
  private simTime = 0;
  private simMode: SensorReading['motionState'] = 'curved_road';
  private permissionState: 'granted' | 'prompt' | 'denied' | 'unsupported' = 'prompt';
  private hasReceivedHardwareEvent = false;

  // Low-pass filter previous states for smoothing noisy accelerometers
  private filteredAccelX = 0;
  private filteredAccelY = 0;
  private filteredAccelZ = 9.8;
  private filteredPitch = 0;
  private filteredRoll = 0;

  private currentReading: SensorReading = {
    accelX: 0,
    accelY: 0,
    accelZ: 9.8,
    pitch: 0,
    roll: 0,
    yaw: 0,
    roughnessIndex: 12,
    isSimulated: true,
    motionState: 'smooth_cruising',
    totalG: 1.0,
    sourceType: 'simulated',
    permissionStatus: 'prompt',
  };

  constructor() {
    if (typeof window !== 'undefined') {
      if (!('DeviceOrientationEvent' in window) && !('DeviceMotionEvent' in window)) {
        this.permissionState = 'unsupported';
        this.currentReading.permissionStatus = 'unsupported';
      }
    }
  }

  /**
   * Request device motion permissions (required for modern mobile browsers & iOS 13+)
   */
  public async requestSensorPermission(): Promise<boolean> {
    if (typeof window === 'undefined') {
      this.permissionState = 'unsupported';
      return false;
    }

    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientation?.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        this.permissionState = response === 'granted' ? 'granted' : 'denied';
        this.currentReading.permissionStatus = this.permissionState;
        if (response === 'granted') {
          this.start(false);
          return true;
        }
        return false;
      } catch (err) {
        console.warn('Sensor permission error:', err);
        this.permissionState = 'denied';
        this.currentReading.permissionStatus = 'denied';
        return false;
      }
    }

    // Standard Android Chrome / modern HTTPS browsers
    if ('DeviceOrientationEvent' in window) {
      this.permissionState = 'granted';
      this.currentReading.permissionStatus = 'granted';
      this.start(false);
      return true;
    }

    this.permissionState = 'unsupported';
    this.currentReading.permissionStatus = 'unsupported';
    return false;
  }

  public getPermissionStatus(): 'granted' | 'prompt' | 'denied' | 'unsupported' {
    return this.permissionState;
  }

  /**
   * Start listening to hardware sensors or fallback to simulation
   */
  public start(useSimulationOnly = false): void {
    if (this.isListening && !useSimulationOnly && !this.isSimulating) return;
    this.isListening = true;

    if (!useSimulationOnly && typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
      window.addEventListener('devicemotion', this.handleMotion, { passive: true });
    }

    // If explicit simulation or desktop without hardware sensors, start simulation
    if (useSimulationOnly || !('DeviceOrientationEvent' in window)) {
      this.startSimulation(this.simMode);
    } else {
      // If hardware supported, stop any running simulation and wait for live hardware readings
      this.stopSimulation();
      this.currentReading.isSimulated = false;
      this.currentReading.sourceType = 'hardware';
      this.notify();
    }
  }

  /**
   * Stop all sensor listeners to conserve device battery
   */
  public stop(): void {
    this.isListening = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', this.handleOrientation);
      window.removeEventListener('devicemotion', this.handleMotion);
    }
    this.stopSimulation();
  }

  public subscribe(cb: SensorCallback): () => void {
    this.listeners.add(cb);
    cb(this.currentReading);
    return () => this.listeners.delete(cb);
  }

  public setSimulationMode(mode: SensorReading['motionState']): void {
    this.simMode = mode;
    this.currentReading.motionState = mode;
    if (this.isSimulating) {
      this.startSimulation(mode);
    }
  }

  public resetSimulation(): void {
    this.simTime = 0;
    this.filteredAccelX = 0;
    this.filteredAccelY = 0;
    this.filteredAccelZ = 9.8;
    this.filteredPitch = 0;
    this.filteredRoll = 0;
    if (this.isSimulating) {
      this.startSimulation(this.simMode);
    }
  }

  public toggleSimulation(enable?: boolean): boolean {
    const target = enable !== undefined ? enable : !this.isSimulating;
    if (target) {
      this.startSimulation(this.simMode);
    } else {
      this.stopSimulation();
      // Try switching back to hardware
      if ('DeviceOrientationEvent' in window && this.permissionState === 'granted') {
        this.currentReading.isSimulated = false;
        this.currentReading.sourceType = 'hardware';
        this.notify();
      }
    }
    return this.isSimulating;
  }

  public getReading(): SensorReading {
    return this.currentReading;
  }

  private handleOrientation = (e: DeviceOrientationEvent): void => {
    if (e.beta !== null && e.gamma !== null && !this.isSimulating) {
      this.hasReceivedHardwareEvent = true;

      // Center around standard ~45-degree hand-held angle
      const rawPitch = Math.max(-45, Math.min(45, (e.beta || 0) - 45));
      const rawRoll = Math.max(-45, Math.min(45, e.gamma || 0));
      const rawYaw = e.alpha || 0;

      // Low-pass exponential smoothing (alpha = 0.35)
      const alpha = 0.35;
      this.filteredPitch = alpha * rawPitch + (1 - alpha) * this.filteredPitch;
      this.filteredRoll = alpha * rawRoll + (1 - alpha) * this.filteredRoll;

      // Estimate motion roughness from changes
      const deltaRoll = Math.abs(this.filteredRoll - this.currentReading.roll);
      const deltaPitch = Math.abs(this.filteredPitch - this.currentReading.pitch);
      const roughness = Math.min(100, Math.round((deltaRoll + deltaPitch) * 4));

      this.currentReading = {
        ...this.currentReading,
        pitch: parseFloat(this.filteredPitch.toFixed(1)),
        roll: parseFloat(this.filteredRoll.toFixed(1)),
        yaw: parseFloat(rawYaw.toFixed(1)),
        roughnessIndex: roughness,
        isSimulated: false,
        sourceType: 'hardware',
        permissionStatus: 'granted',
        motionState: roughness > 35 ? 'curved_road' : 'smooth_cruising',
      };
      this.notify();
    }
  };

  private handleMotion = (e: DeviceMotionEvent): void => {
    if (e.acceleration && !this.isSimulating) {
      const rawX = e.acceleration.x || 0;
      const rawY = e.acceleration.y || 0;
      const rawZ = e.acceleration.z || 0;

      // Low-pass filter (alpha = 0.25)
      const alpha = 0.25;
      this.filteredAccelX = alpha * rawX + (1 - alpha) * this.filteredAccelX;
      this.filteredAccelY = alpha * rawY + (1 - alpha) * this.filteredAccelY;
      this.filteredAccelZ = alpha * rawZ + (1 - alpha) * this.filteredAccelZ;

      const totalG = Math.sqrt(
        this.filteredAccelX ** 2 + this.filteredAccelY ** 2 + (this.filteredAccelZ + 9.8) ** 2
      ) / 9.8;

      this.currentReading.accelX = parseFloat(this.filteredAccelX.toFixed(2));
      this.currentReading.accelY = parseFloat(this.filteredAccelY.toFixed(2));
      this.currentReading.accelZ = parseFloat(this.filteredAccelZ.toFixed(2));
      this.currentReading.totalG = parseFloat(totalG.toFixed(2));
      this.currentReading.isSimulated = false;
      this.currentReading.sourceType = 'hardware';
      this.notify();
    }
  };

  private startSimulation(mode: SensorReading['motionState']): void {
    this.stopSimulation();
    this.isSimulating = true;
    this.currentReading.isSimulated = true;
    this.currentReading.sourceType = 'simulated';
    this.currentReading.motionState = mode;

    this.simulationInterval = window.setInterval(() => {
      this.simTime += 0.05;
      const t = this.simTime;

      let pitch = 0;
      let roll = 0;
      let accelX = 0;
      let accelY = 0;
      let roughness = 10;

      switch (mode) {
        case 'curved_road':
          // Winding country road: oscillating roll & lateral acceleration
          roll = Math.sin(t * 0.8) * 14 + Math.sin(t * 2.3) * 4;
          pitch = Math.sin(t * 0.4) * 5 + Math.cos(t * 1.5) * 2;
          accelX = -Math.sin(t * 0.8) * 2.2;
          accelY = Math.cos(t * 0.5) * 1.2;
          roughness = 42 + Math.round(Math.abs(Math.sin(t * 4)) * 25);
          break;

        case 'braking':
          // Stop-and-go city traffic: pitching forward and backward
          pitch = Math.sin(t * 1.2) * 16;
          roll = Math.sin(t * 0.3) * 4;
          accelY = -Math.sin(t * 1.2) * 3.5;
          roughness = 55 + Math.round(Math.random() * 20);
          break;

        case 'heavy_swells':
          // Ferry boat swells: slow, deep rhythmic rolling and heave
          roll = Math.sin(t * 0.4) * 22;
          pitch = Math.cos(t * 0.35) * 18;
          accelX = Math.sin(t * 0.4) * 1.8;
          accelY = Math.cos(t * 0.35) * 1.5;
          roughness = 68 + Math.round(Math.abs(Math.sin(t * 0.7)) * 20);
          break;

        case 'turbulence':
          // Airplane turbulence: quick erratic jolts
          roll = (Math.random() - 0.5) * 12 + Math.sin(t * 1.5) * 6;
          pitch = (Math.random() - 0.5) * 10;
          accelX = (Math.random() - 0.5) * 3.0;
          accelY = (Math.random() - 0.5) * 3.2;
          roughness = 75 + Math.round(Math.random() * 22);
          break;

        case 'smooth_cruising':
        default:
          roll = Math.sin(t * 0.5) * 3;
          pitch = Math.cos(t * 0.3) * 2;
          accelX = Math.sin(t * 0.5) * 0.4;
          accelY = 0.2;
          roughness = 12 + Math.round(Math.sin(t) * 4);
          break;
      }

      const totalG = Math.sqrt(accelX ** 2 + accelY ** 2 + 9.8 ** 2) / 9.8;

      this.currentReading = {
        accelX: parseFloat(accelX.toFixed(2)),
        accelY: parseFloat(accelY.toFixed(2)),
        accelZ: 9.8,
        pitch: parseFloat(pitch.toFixed(1)),
        roll: parseFloat(roll.toFixed(1)),
        yaw: parseFloat(((t * 10) % 360).toFixed(1)),
        roughnessIndex: roughness,
        isSimulated: true,
        sourceType: 'simulated',
        motionState: mode,
        totalG: parseFloat(totalG.toFixed(2)),
        permissionStatus: this.permissionState,
      };

      this.notify();
    }, 50); // 20 FPS updates
  }

  private stopSimulation(): void {
    if (this.simulationInterval !== null) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentReading);
    }
  }
}

export const sensorService = new SensorService();
