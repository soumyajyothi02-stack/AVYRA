class JourneyModel {
  final String id;
  final String date;
  final String transportType;
  final int durationMinutes;
  final String origin;
  final String destination;
  final int predictedRiskPercent;
  final int actualSeverity;
  final bool usedTravelMode;

  JourneyModel({
    required this.id,
    required this.date,
    required this.transportType,
    required this.durationMinutes,
    required this.origin,
    required this.destination,
    required this.predictedRiskPercent,
    required this.actualSeverity,
    required this.usedTravelMode,
  });

  factory JourneyModel.fromJson(Map<String, dynamic> json) {
    return JourneyModel(
      id: json['id'] ?? '',
      date: json['date'] ?? '',
      transportType: json['transport_type'] ?? 'car',
      durationMinutes: json['duration_minutes'] ?? 30,
      origin: json['origin'] ?? '',
      destination: json['destination'] ?? '',
      predictedRiskPercent: json['predicted_risk_percent'] ?? 50,
      actualSeverity: json['actual_severity'] ?? 0,
      usedTravelMode: json['used_travel_mode'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date,
      'transport_type': transportType,
      'duration_minutes': durationMinutes,
      'origin': origin,
      'destination': destination,
      'predicted_risk_percent': predictedRiskPercent,
      'actual_severity': actualSeverity,
      'used_travel_mode': usedTravelMode,
    };
  }
}
