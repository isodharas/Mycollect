import 'package:flutter/material.dart';

class BinModel {
  final String binId;
  final double fillLevel;
  final double gasPpm;
  final double temperature;
  final double humidity;
  final String priority;
  final double healthRisk;
  final String timestamp;

  BinModel({
    required this.binId,
    required this.fillLevel,
    required this.gasPpm,
    required this.temperature,
    required this.humidity,
    required this.priority,
    required this.healthRisk,
    required this.timestamp,
  });

  factory BinModel.fromJson(Map<String, dynamic> json) {
    return BinModel(
      binId: json['bin_id']?.toString() ?? '',
      fillLevel: double.tryParse(json['fill_level']?.toString() ?? '0') ?? 0,
      gasPpm: double.tryParse(json['gas_ppm']?.toString() ?? '0') ?? 0,
      temperature: double.tryParse(json['temperature']?.toString() ?? '0') ?? 0,
      humidity: double.tryParse(json['humidity']?.toString() ?? '0') ?? 0,
      // API returns 'priority_label' not 'priority' — check both
      priority: json['priority_label']?.toString() ?? 
                json['priority']?.toString() ?? 'LOW',
      healthRisk: double.tryParse(
        (json['health_risk'] ?? json['weighted_score'] ?? '0').toString()
      ) ?? 0,
      timestamp: json['timestamp']?.toString() ?? '',
    );
  }

  Color get priorityColor {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return const Color(0xFFDC2626);
      case 'HIGH':     return const Color(0xFFEA580C);
      case 'MEDIUM':   return const Color(0xFFD97706);
      default:         return const Color(0xFF16A34A);
    }
  }
}
