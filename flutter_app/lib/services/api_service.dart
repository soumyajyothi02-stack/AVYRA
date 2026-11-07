import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use 10.0.2.2 when running inside the Android Studio emulator to reach host localhost:8000
  static const String baseUrl = "http://10.0.2.2:8000/api";

  static Future<Map<String, dynamic>> predictRisk({
    required String transportType,
    required int durationMinutes,
    required String seatingPosition,
    required String ventilation,
    required int screenReadingMinutes,
    required int expectedRoughness,
    required int userSensitivityScore,
  }) async {
    try {
      final response = await http.post(
        Uri.parse("$baseUrl/ml/predict"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "transport_type": transportType,
          "duration_minutes": durationMinutes,
          "seating_position": seatingPosition,
          "ventilation": ventilation,
          "screen_reading_minutes": screenReadingMinutes,
          "expected_roughness": expectedRoughness,
          "user_sensitivity_score": userSensitivityScore,
        }),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {
      // Offline fallback
    }

    // Default offline estimation
    return {
      "selected_probability": 55,
      "risk_category": "Moderate",
      "confidence_interval": [45, 65],
      "key_risk_factors": [
        {"factor": "Offline estimation active", "impact": "Standard baseline", "is_positive": true}
      ],
      "recommended_mitigations": [
        "Focus on distant horizon",
        "Enable Visual Stabilization Cues",
        "Apply cool air to forehead"
      ]
    };
  }
}
