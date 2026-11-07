import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:sensors_plus/sensors_plus.dart';

class DeviceSensorReading {
  final double accelX;
  final double accelY;
  final double accelZ;
  final double pitch;
  final double roll;

  DeviceSensorReading({
    required this.accelX,
    required this.accelY,
    required this.accelZ,
    required this.pitch,
    required this.roll,
  });
}

class FlutterSensorService extends ChangeNotifier {
  StreamSubscription<AccelerometerEvent>? _accelSub;
  StreamSubscription<GyroscopeEvent>? _gyroSub;

  double _accelX = 0.0;
  double _accelY = 0.0;
  double _accelZ = 9.8;
  double _pitch = 0.0;
  double _roll = 0.0;

  double get accelX => _accelX;
  double get accelY => _accelY;
  double get accelZ => _accelZ;
  double get pitch => _pitch;
  double get roll => _roll;

  void startListening() {
    _accelSub = accelerometerEventStream().listen((AccelerometerEvent event) {
      _accelX = event.x;
      _accelY = event.y;
      _accelZ = event.z;
      // Derive pitch and roll from gravity vector
      _pitch = event.y * 3.5;
      _roll = -event.x * 3.5;
      notifyListeners();
    });
  }

  void stopListening() {
    _accelSub?.cancel();
    _gyroSub?.cancel();
  }

  @override
  void dispose() {
    stopListening();
    super.dispose();
  }
}
