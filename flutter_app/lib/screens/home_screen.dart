import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'travel_mode_screen.dart';
import 'instant_relief_screen.dart';
import 'insights_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
    HomeDashboardView(),
    TravelModeScreen(),
    InstantReliefScreen(),
    InsightsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (idx) => setState(() => _selectedIndex = idx),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.navigation_outlined), activeIcon: Icon(Icons.navigation), label: 'Travel'),
          BottomNavigationBarItem(icon: Icon(Icons.air_outlined), activeIcon: Icon(Icons.air), label: 'Relief'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart_outlined), activeIcon: Icon(Icons.bar_chart), label: 'Insights'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class HomeDashboardView extends StatelessWidget {
  const HomeDashboardView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.mainBackground,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('MotionEase', style: TextStyle(fontFamily: 'Manrope', color: AppColors.deepForestGreen, fontSize: 13, fontWeight: FontWeight.bold)),
                      SizedBox(height: 2),
                      Text('Good morning, Maya', style: TextStyle(fontFamily: 'Manrope', fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.charcoal)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.paleSage,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text('Moderate', style: TextStyle(color: AppColors.deepForestGreen, fontSize: 11, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text('Move comfortably. Feel better.', style: TextStyle(fontSize: 12, color: AppColors.secondaryText)),
              const SizedBox(height: 20),

              // Prominent Start Travel Mode Button
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.deepForestGreen,
                  padding: const EdgeInsets.all(20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                ),
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const TravelModeScreen()));
                },
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.navigation_rounded, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('Start Travel Mode', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Manrope')),
                          SizedBox(height: 2),
                          Text('Sensors active · Peripheral cues ready', style: TextStyle(color: AppColors.paleSage, fontSize: 11)),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios, color: Colors.white70, size: 14),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Instant Relief Shortcut
              InkWell(
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const InstantReliefScreen()));
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.paleSage,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.warmGrey),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.air, color: AppColors.deepForestGreen, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('Instant Relief', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, fontFamily: 'Manrope', color: AppColors.charcoal)),
                            Text('Guided breathing & P6 acupressure', style: TextStyle(fontSize: 11, color: AppColors.secondaryText)),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: AppColors.secondaryText),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Compact Journey Summary
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('COMPACT JOURNEY SUMMARY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.secondaryText)),
                          Text('Latest: Car', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.deepForestGreen)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Text('Mountain Ridge Route · 45 mins', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'Manrope')),
                      const SizedBox(height: 4),
                      const Text('Severity recorded: 3/10 (Stabilized with visual cues)', style: TextStyle(fontSize: 11, color: AppColors.secondaryText)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
