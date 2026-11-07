import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class InsightsScreen extends StatefulWidget {
  const InsightsScreen({Key? key}) : super(key: key);

  @override
  State<InsightsScreen> createState() => _InsightsScreenState();
}

class _InsightsScreenState extends State<InsightsScreen> {
  int _riskProbability = 48;
  String _riskCategory = 'Moderate';
  bool _isLoading = false;

  void _estimateRisk() async {
    setState(() => _isLoading = true);
    final results = await ApiService.predictRisk(
      transportType: 'car',
      durationMinutes: 45,
      seatingPosition: 'back',
      ventilation: 'ac_fresh',
      screenReadingMinutes: 15,
      expectedRoughness: 3,
      userSensitivityScore: 60,
    );
    setState(() {
      _riskProbability = results['selected_probability'] ?? 50;
      _riskCategory = results['risk_category'] ?? 'Moderate';
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      appBar: AppBar(
        title: const Text('Motion Insights', style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ML Prediction Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('EXPERIMENTAL MOTION RISK', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.secondaryText)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: AppColors.paleSage, borderRadius: BorderRadius.circular(8)),
                          child: Text('$_riskCategory Risk', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.deepForestGreen)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text('$_riskProbability%', style: const TextStyle(fontSize: 38, fontWeight: FontWeight.bold, fontFamily: 'Manrope', color: AppColors.charcoal)),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: _riskProbability / 100.0,
                        backgroundColor: AppColors.paleSage,
                        color: AppColors.deepForestGreen,
                        minHeight: 6,
                      ),
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _estimateRisk,
                      child: _isLoading ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Run ML Risk Estimation'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            // Experimental transparency disclaimer
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.paleSage.withOpacity(0.5),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.warmGrey),
              ),
              child: const Text(
                'Disclaimer: MotionEase risk estimates are experimental machine learning models trained on motion dynamics and are not medically validated.',
                style: TextStyle(fontSize: 11, color: AppColors.secondaryText, height: 1.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
