import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../theme/app_theme.dart';

class InstantReliefScreen extends StatefulWidget {
  const InstantReliefScreen({Key? key}) : super(key: key);

  @override
  State<InstantReliefScreen> createState() => _InstantReliefScreenState();
}

class _InstantReliefScreenState extends State<InstantReliefScreen> {
  final FlutterTts _flutterTts = FlutterTts();
  bool _isSpeaking = false;

  final String _guidance =
      "Take a slow breath. Rest your head firmly back against the headrest. Aim cold air vent toward your forehead. Look toward the distant horizon or softly close your eyes. Inhale gently, exhale slowly.";

  Future<void> _toggleAudioGuide() async {
    if (_isSpeaking) {
      await _flutterTts.stop();
      setState(() => _isSpeaking = false);
    } else {
      setState(() => _isSpeaking = true);
      await _flutterTts.setSpeechRate(0.42);
      await _flutterTts.setPitch(1.0);
      await _flutterTts.speak(_guidance);
      _flutterTts.setCompletionHandler(() {
        setState(() => _isSpeaking = false);
      });
    }
  }

  @override
  void dispose() {
    _flutterTts.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        title: const Text('Instant Relief', style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('AUTONOMIC CALMING PROTOCOL', style: TextStyle(color: AppColors.secondaryText, fontSize: 10, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    const Text('Relax posture & close eyes softly', style: TextStyle(fontFamily: 'Manrope', color: AppColors.charcoal, fontSize: 17, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 14),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.deepForestGreen,
                        foregroundColor: Colors.white,
                      ),
                      icon: Icon(_isSpeaking ? Icons.volume_off : Icons.volume_up, size: 18),
                      label: Text(_isSpeaking ? 'Stop Voice Guidance' : 'Play Spoken Voice Guide (Hands-Free)'),
                      onPressed: _toggleAudioGuide,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            _buildTactileCard(
              title: '1. Headrest Stabilizing Alignment',
              description: 'Rest against seat headrest to stop semicircular canal inner-ear friction.',
              icon: Icons.airline_seat_recline_extra_outlined,
            ),
            const SizedBox(height: 12),
            _buildTactileCard(
              title: '2. P6 Nei Guan Acupressure',
              description: 'Place 3 fingers above your wrist crease and press thumb into the center groove firmly.',
              icon: Icons.pan_tool_outlined,
            ),
            const SizedBox(height: 12),
            _buildTactileCard(
              title: '3. Cool Directed Airflow',
              description: 'Aim AC vent toward your forehead and neck to lower sympathetic nervous activity.',
              icon: Icons.air,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTactileCard({required String title, required String description, required IconData icon}) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.paleSage, borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: AppColors.deepForestGreen, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'Manrope', color: AppColors.charcoal)),
                  const SizedBox(height: 3),
                  Text(description, style: const TextStyle(fontSize: 11, color: AppColors.secondaryText, height: 1.3)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
