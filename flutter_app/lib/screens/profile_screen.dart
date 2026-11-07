import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _reduceMotion = false;
  bool _audioChimes = true;
  double _sensitivity = 62.0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        title: const Text('Profile & Settings', style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // User Header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.deepForestGreen,
                      child: const Text('M', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Maya Chen', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, fontFamily: 'Manrope')),
                        SizedBox(height: 2),
                        Text('maya.chen@example.com', style: TextStyle(fontSize: 12, color: AppColors.secondaryText)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Accessibility Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ACCESSIBILITY & MOTION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.secondaryText)),
                    const SizedBox(height: 12),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Reduce Motion', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Disables animated cues and provides static indicators', style: TextStyle(fontSize: 11, color: AppColors.secondaryText)),
                      value: _reduceMotion,
                      activeColor: AppColors.deepForestGreen,
                      onChanged: (val) => setState(() => _reduceMotion = val),
                    ),
                    const Divider(color: AppColors.warmGrey),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Audio Relaxation Bells', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      subtitle: const Text('Gentle 432Hz harmonic chimes during breathing', style: TextStyle(fontSize: 11, color: AppColors.secondaryText)),
                      value: _audioChimes,
                      activeColor: AppColors.deepForestGreen,
                      onChanged: (val) => setState(() => _audioChimes = val),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
