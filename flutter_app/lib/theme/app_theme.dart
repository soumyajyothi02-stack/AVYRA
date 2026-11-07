import 'package:flutter/material.dart';

class AppColors {
  static const Color primarySage = Color(0xFF91A995);
  static const Color deepForestGreen = Color(0xFF34483B);
  static const Color charcoal = Color(0xFF252C28);
  static const Color mainBackground = Color(0xFFF3F4EF);
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color paleSage = Color(0xFFE4EBE2);
  static const Color warmGrey = Color(0xFFD8DCD5);
  static const Color secondaryText = Color(0xFF68746B);
  static const Color error = Color(0xFFB65D5D);
  static const Color warning = Color(0xFFC28B45);
  static const Color success = Color(0xFF557B61);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.mainBackground,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.deepForestGreen,
        primary: AppColors.deepForestGreen,
        secondary: AppColors.primarySage,
        surface: AppColors.cardBackground,
        background: AppColors.mainBackground,
        error: AppColors.error,
      ),
      fontFamily: 'Inter',
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Manrope', color: AppColors.charcoal, fontWeight: FontWeight.bold),
        displayMedium: TextStyle(fontFamily: 'Manrope', color: AppColors.charcoal, fontWeight: FontWeight.bold),
        headlineLarge: TextStyle(fontFamily: 'Manrope', color: AppColors.charcoal, fontWeight: FontWeight.bold),
        headlineMedium: TextStyle(fontFamily: 'Manrope', color: AppColors.charcoal, fontWeight: FontWeight.w700),
        titleLarge: TextStyle(fontFamily: 'Manrope', color: AppColors.charcoal, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(fontFamily: 'Inter', color: AppColors.charcoal),
        bodyMedium: TextStyle(fontFamily: 'Inter', color: AppColors.charcoal),
        bodySmall: TextStyle(fontFamily: 'Inter', color: AppColors.secondaryText),
      ),
      cardTheme: CardTheme(
        color: AppColors.cardBackground,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.warmGrey, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.deepForestGreen,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(
            fontFamily: 'Manrope',
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.cardBackground,
        selectedItemColor: AppColors.deepForestGreen,
        unselectedItemColor: AppColors.secondaryText,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}
