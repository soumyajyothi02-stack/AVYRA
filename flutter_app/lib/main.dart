import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/sensor_service.dart';
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => FlutterSensorService()..startListening()),
      ],
      child: const MotionEaseApp(),
    ),
  );
}

class MotionEaseApp extends StatelessWidget {
  const MotionEaseApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MotionEase',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const HomeScreen(),
    );
  }
}
