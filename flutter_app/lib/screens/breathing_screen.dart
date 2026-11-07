import 'dart:async';
import 'package:flutter/material.dart';
import 'package:vibration/vibration.dart';

class BreathingScreen extends StatefulWidget {
  const BreathingScreen({Key? key}) : super(key: key);

  @override
  State<BreathingScreen> createState() => _BreathingScreenState();
}

class _BreathingScreenState extends State<BreathingScreen> {
  int _secondsLeft = 4;
  String _phase = 'Inhale';
  Timer? _timer;
  int _cycle = 1;

  @override
  void initState() {
    super.initState();
    _start478Breathing();
  }

  void _start478Breathing() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_secondsLeft > 1) {
          _secondsLeft--;
        } else {
          if (_phase == 'Inhale') {
            _phase = 'Hold';
            _secondsLeft = 7;
            Vibration.vibrate(duration: 40);
          } else if (_phase == 'Hold') {
            _phase = 'Exhale';
            _secondsLeft = 8;
            Vibration.vibrate(duration: 80);
          } else {
            _phase = 'Inhale';
            _secondsLeft = 4;
            _cycle++;
            Vibration.vibrate(duration: 50);
          }
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double scale = _phase == 'Inhale' ? 1.3 : _phase == 'Hold' ? 1.25 : 0.85;

    return Scaffold(
      backgroundColor: const Color(0xFFFBFBF9),
      appBar: AppBar(
        title: const Text('4-7-8 Breathing Guide', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedScale(
              scale: scale,
              duration: const Duration(seconds: 3),
              curve: Curves.easeInOut,
              child: Container(
                width: 180,
                height: 180,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [Color(0xFF047857), Color(0xFF0D9488)],
                  ),
                  boxShadow: [
                    BoxShadow(color: Color(0x44047857), blurRadius: 24, spreadRadius: 4),
                  ],
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _phase.toUpperCase(),
                        style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2),
                      ),
                      Text(
                        '$_secondsLeft s',
                        style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 48),
            Text(
              _phase == 'Inhale' ? 'Inhale softly through your nose' : _phase == 'Hold' ? 'Hold breath gently' : 'Exhale slowly through your lips',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text('Cycle $_cycle Completed', style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
