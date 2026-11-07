import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/sensor_service.dart';
import '../theme/app_theme.dart';
import 'instant_relief_screen.dart';

class TravelModeScreen extends StatefulWidget {
  const TravelModeScreen({Key? key}) : super(key: key);

  @override
  State<TravelModeScreen> createState() => _TravelModeScreenState();
}

class _TravelModeScreenState extends State<TravelModeScreen> {
  bool _cuesEnabled = true;
  bool _isPaused = false;
  int _seconds = 0;

  @override
  Widget build(BuildContext context) {
    final sensor = Provider.of<FlutterSensorService>(context);
    final double rollOffset = -sensor.roll * 2.0;
    final double pitchOffset = sensor.pitch * 1.5;

    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        title: const Text('Travel Mode', style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(_cuesEnabled ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: AppColors.charcoal),
            onPressed: () => setState(() => _cuesEnabled = !_cuesEnabled),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Visual Focus Horizon
          if (_cuesEnabled)
            Center(
              child: Transform.translate(
                offset: Offset(0, pitchOffset),
                child: Transform.rotate(
                  angle: -sensor.roll * 0.02,
                  child: Container(
                    width: double.infinity,
                    height: 1.5,
                    color: AppColors.primarySage.withOpacity(0.6),
                  ),
                ),
              ),
            ),

          // Peripheral Motion Dots
          if (_cuesEnabled) ...[
            Positioned(left: 14 + rollOffset * 0.4, top: 180 + pitchOffset, child: _buildDot()),
            Positioned(left: 14 + rollOffset * 0.4, top: 340 + pitchOffset, child: _buildDot()),
            Positioned(left: 14 + rollOffset * 0.4, top: 500 + pitchOffset, child: _buildDot()),
            Positioned(right: 14 - rollOffset * 0.4, top: 180 + pitchOffset, child: _buildDot()),
            Positioned(right: 14 - rollOffset * 0.4, top: 340 + pitchOffset, child: _buildDot()),
            Positioned(right: 14 - rollOffset * 0.4, top: 500 + pitchOffset, child: _buildDot()),
          ],

          // Main Content
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Live Sensor Metrics
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('DEVICE MOTION SENSORS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.secondaryText)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(color: AppColors.paleSage, borderRadius: BorderRadius.circular(6)),
                              child: const Text('Live Sync', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.deepForestGreen)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildMetric('Pitch', '${sensor.pitch.toStringAsFixed(1)}°'),
                            _buildMetric('Roll', '${sensor.roll.toStringAsFixed(1)}°'),
                            _buildMetric('Lateral X', '${sensor.accelX.toStringAsFixed(1)} m/s²'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                // Medical disclaimer note
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.paleSage.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.warmGrey),
                  ),
                  child: const Text(
                    'Note: Sensor readings measure device physics only and do not medically diagnose vestibular conditions.',
                    style: TextStyle(fontSize: 11, color: AppColors.secondaryText, height: 1.3),
                  ),
                ),
                const Spacer(),
                ElevatedButton.icon(
                  icon: const Icon(Icons.air, size: 18),
                  label: const Text('Open Instant Relief'),
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const InstantReliefScreen()));
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot() {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        color: AppColors.deepForestGreen,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.paleSage, width: 1),
      ),
    );
  }

  Widget _buildMetric(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Manrope', color: AppColors.charcoal)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: AppColors.secondaryText)),
      ],
    );
  }
}
