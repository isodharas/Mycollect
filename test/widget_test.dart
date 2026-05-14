import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mycollect_mobile/services/lang_service.dart';
import 'package:mycollect_mobile/models/bin_model.dart';
import 'package:mycollect_mobile/config/api_config.dart';

void main() {

  // ── Group 1: Health Risk Formula (8 tests) ──────────────────────────────
  group('Health Risk Formula', () {
    double calcScore(double gas, double fill) =>
        (gas / 1000 * 100 * 0.70) + (fill * 0.30);

    test('high gas and fill returns 54.0', () => expect(calcScore(600, 40), closeTo(54.0, 0.001)));
    test('low gas and fill returns 11.6', () => expect(calcScore(80, 20), closeTo(11.6, 0.001)));
    test('max inputs returns 100.0', () => expect(calcScore(1000, 100), closeTo(100.0, 0.001)));
    test('gas only — weight is 70%', () => expect(calcScore(1000, 0), closeTo(70.0, 0.001)));
    test('fill only — weight is 30%', () => expect(calcScore(0, 100), closeTo(30.0, 0.001)));
    test('zero inputs returns 0.0', () => expect(calcScore(0, 0), closeTo(0.0, 0.001)));
    test('gas=500 fill=50 returns 50.0', () => expect(calcScore(500, 50), closeTo(50.0, 0.001)));
    test('gas=300 fill=60 returns 39.0', () => expect(calcScore(300, 60), closeTo(39.0, 0.001)));
  });

  // ── Group 2: Priority Classification (10 tests) ─────────────────────────
  group('Priority Classification', () {
    String classify(double gas, double fill) {
      if (gas > 500) return 'CRITICAL';
      if (gas > 300) return 'HIGH';
      if (gas > 100 || fill > 50) return 'MEDIUM';
      return 'LOW';
    }

    test('gas=520 is CRITICAL', () => expect(classify(520, 30), 'CRITICAL'));
    test('gas=501 boundary is CRITICAL', () => expect(classify(501, 10), 'CRITICAL'));
    test('gas=1000 max is CRITICAL', () => expect(classify(1000, 100), 'CRITICAL'));
    test('gas=350 is HIGH', () => expect(classify(350, 20), 'HIGH'));
    test('gas=301 boundary is HIGH', () => expect(classify(301, 0), 'HIGH'));
    test('gas=150 is MEDIUM', () => expect(classify(150, 20), 'MEDIUM'));
    test('fill=75 low gas is MEDIUM', () => expect(classify(50, 75), 'MEDIUM'));
    test('gas=101 boundary is MEDIUM', () => expect(classify(101, 0), 'MEDIUM'));
    test('gas=80 fill=30 is LOW', () => expect(classify(80, 30), 'LOW'));
    test('gas=0 fill=0 is LOW', () => expect(classify(0, 0), 'LOW'));
  });

  // ── Group 3: Fill Level Calculation (8 tests) ───────────────────────────
  group('Fill Level Calculation', () {
    double calcFill(double height, double dist) =>
        ((height - dist) / height * 100).clamp(0.0, 100.0);

    test('empty bin is 0%', () => expect(calcFill(100, 100), closeTo(0.0, 0.001)));
    test('full bin is 100%', () => expect(calcFill(100, 0), closeTo(100.0, 0.001)));
    test('half full is 50%', () => expect(calcFill(100, 50), closeTo(50.0, 0.001)));
    test('dist > height clamps to 0%', () => expect(calcFill(100, 120), closeTo(0.0, 0.001)));
    test('40cm bin at 24cm is 40%', () => expect(calcFill(40, 24), closeTo(40.0, 0.001)));
    test('30cm bin at 9cm is 70%', () => expect(calcFill(30, 9), closeTo(70.0, 0.001)));
    test('negative dist clamps to 100%', () => expect(calcFill(100, -10), closeTo(100.0, 0.001)));
    test('25cm bin at 25cm is 0%', () => expect(calcFill(25, 25), closeTo(0.0, 0.001)));
  });

  // ── Group 4: LangService (10 tests) ─────────────────────────────────────
  group('LangService', () {
    tearDown(() => LangService.isSinhala = false);

    test('returns English when false', () { LangService.isSinhala = false; expect(LangService.t('Hello', 'හෙලෝ'), 'Hello'); });
    test('returns Sinhala when true', () { LangService.isSinhala = true; expect(LangService.t('Hello', 'හෙලෝ'), 'හෙලෝ'); });
    test('CRITICAL label English', () { LangService.isSinhala = false; expect(LangService.t('CRITICAL', 'අවදානම්'), 'CRITICAL'); });
    test('CRITICAL label Sinhala', () { LangService.isSinhala = true; expect(LangService.t('CRITICAL', 'අවදානම්'), 'අවදානම්'); });
    test('Mark as Collected English', () { LangService.isSinhala = false; expect(LangService.t('Mark as Collected', 'එකතු කරන ලදි'), 'Mark as Collected'); });
    test('Mark as Collected Sinhala', () { LangService.isSinhala = true; expect(LangService.t('Mark as Collected', 'එකතු කරන ලදි'), 'එකතු කරන ලදි'); });
    test('HIGH label English', () { LangService.isSinhala = false; expect(LangService.t('HIGH', 'ඉහළ'), 'HIGH'); });
    test('HIGH label Sinhala', () { LangService.isSinhala = true; expect(LangService.t('HIGH', 'ඉහළ'), 'ඉහළ'); });
    test('empty string returns empty English', () { LangService.isSinhala = false; expect(LangService.t('', ''), ''); });
    test('same string both languages', () { LangService.isSinhala = true; expect(LangService.t('BIN_001', 'BIN_001'), 'BIN_001'); });
  });

  // ── Group 5: BinModel.fromJson (18 tests) ───────────────────────────────
  group('BinModel.fromJson', () {
    test('parses binId correctly', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '75', 'gas_ppm': '650', 'temperature': '30', 'humidity': '80', 'priority_label': 'CRITICAL', 'health_risk': '61.5', 'timestamp': '2026-05-14T00:00:00Z'});
      expect(b.binId, 'BIN_001');
    });
    test('parses fillLevel as double', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '75.5', 'gas_ppm': '0', 'temperature': '0', 'humidity': '0', 'priority_label': 'LOW', 'health_risk': '0', 'timestamp': ''});
      expect(b.fillLevel, closeTo(75.5, 0.001));
    });
    test('parses gasPpm as double', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_002', 'fill_level': '0', 'gas_ppm': '650.0', 'temperature': '0', 'humidity': '0', 'priority_label': 'CRITICAL', 'health_risk': '0', 'timestamp': ''});
      expect(b.gasPpm, closeTo(650.0, 0.001));
    });
    test('parses temperature as double', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '0', 'gas_ppm': '0', 'temperature': '31.5', 'humidity': '0', 'priority_label': 'LOW', 'health_risk': '0', 'timestamp': ''});
      expect(b.temperature, closeTo(31.5, 0.001));
    });
    test('parses humidity as double', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '0', 'gas_ppm': '0', 'temperature': '0', 'humidity': '78.0', 'priority_label': 'LOW', 'health_risk': '0', 'timestamp': ''});
      expect(b.humidity, closeTo(78.0, 0.001));
    });
    test('parses priority label correctly', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '0', 'gas_ppm': '0', 'temperature': '0', 'humidity': '0', 'priority_label': 'HIGH', 'health_risk': '0', 'timestamp': ''});
      expect(b.priority, 'HIGH');
    });
    test('parses healthRisk as double', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '0', 'gas_ppm': '0', 'temperature': '0', 'humidity': '0', 'priority_label': 'LOW', 'health_risk': '61.5', 'timestamp': ''});
      expect(b.healthRisk, closeTo(61.5, 0.001));
    });
    test('parses timestamp string', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '0', 'gas_ppm': '0', 'temperature': '0', 'humidity': '0', 'priority_label': 'LOW', 'health_risk': '0', 'timestamp': '2026-05-14T00:00:00Z'});
      expect(b.timestamp, '2026-05-14T00:00:00Z');
    });
    test('null bin_id defaults to empty string', () {
      final b = BinModel.fromJson({'bin_id': null, 'fill_level': '0', 'gas_ppm': '0', 'temperature': '0', 'humidity': '0', 'priority_label': 'LOW', 'health_risk': '0', 'timestamp': ''});
      expect(b.binId, '');
    });
    test('null fill_level defaults to 0', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': null, 'gas_ppm': '0', 'temperature': '0', 'humidity': '0', 'priority_label': 'LOW', 'health_risk': '0', 'timestamp': ''});
      expect(b.fillLevel, 0.0);
    });
    test('null gas_ppm defaults to 0', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '0', 'gas_ppm': null, 'temperature': '0', 'humidity': '0', 'priority_label': 'LOW', 'health_risk': '0', 'timestamp': ''});
      expect(b.gasPpm, 0.0);
    });
    test('null priority_label defaults to LOW', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '0', 'gas_ppm': '0', 'temperature': '0', 'humidity': '0', 'priority_label': null, 'health_risk': '0', 'timestamp': ''});
      expect(b.priority, 'LOW');
    });
    test('invalid fill_level string defaults to 0', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': 'abc', 'gas_ppm': '0', 'temperature': '0', 'humidity': '0', 'priority_label': 'LOW', 'health_risk': '0', 'timestamp': ''});
      expect(b.fillLevel, 0.0);
    });
    test('integer gas_ppm value parses correctly', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '0', 'gas_ppm': 400, 'temperature': '0', 'humidity': '0', 'priority_label': 'HIGH', 'health_risk': '0', 'timestamp': ''});
      expect(b.gasPpm, closeTo(400.0, 0.001));
    });
    test('BIN_005 physical unit parses correctly', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_005', 'fill_level': '60', 'gas_ppm': '320', 'temperature': '29', 'humidity': '75', 'priority_label': 'HIGH', 'health_risk': '40.4', 'timestamp': '2026-05-14T06:00:00Z'});
      expect(b.binId, 'BIN_005');
      expect(b.priority, 'HIGH');
      expect(b.fillLevel, closeTo(60.0, 0.001));
    });
    test('MEDIUM priority parsed correctly', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_003', 'fill_level': '55', 'gas_ppm': '120', 'temperature': '28', 'humidity': '70', 'priority_label': 'MEDIUM', 'health_risk': '25.0', 'timestamp': ''});
      expect(b.priority, 'MEDIUM');
    });
    test('all fields populated for BIN_001 demo data', () {
      final b = BinModel.fromJson({'bin_id': 'BIN_001', 'fill_level': '75', 'gas_ppm': '650', 'temperature': '30', 'humidity': '80', 'priority_label': 'CRITICAL', 'health_risk': '61.5', 'timestamp': '2026-05-14T00:00:00Z'});
      expect(b.binId, 'BIN_001');
      expect(b.gasPpm, closeTo(650.0, 0.001));
      expect(b.fillLevel, closeTo(75.0, 0.001));
      expect(b.priority, 'CRITICAL');
      expect(b.healthRisk, closeTo(61.5, 0.001));
    });
    test('empty json map uses all defaults', () {
      final b = BinModel.fromJson({});
      expect(b.binId, '');
      expect(b.fillLevel, 0.0);
      expect(b.gasPpm, 0.0);
      expect(b.priority, 'LOW');
    });
  });

  // ── Group 6: BinModel.priorityColor (5 tests) ───────────────────────────
  group('BinModel priorityColor', () {
    BinModel make(String p) => BinModel(binId: 'X', fillLevel: 0, gasPpm: 0, temperature: 0, humidity: 0, priority: p, healthRisk: 0, timestamp: '');

    test('CRITICAL returns red', () => expect(make('CRITICAL').priorityColor, const Color(0xFFDC2626)));
    test('HIGH returns orange', () => expect(make('HIGH').priorityColor, const Color(0xFFEA580C)));
    test('MEDIUM returns amber', () => expect(make('MEDIUM').priorityColor, const Color(0xFFD97706)));
    test('LOW returns green', () => expect(make('LOW').priorityColor, const Color(0xFF4ADE80)));
    test('unknown priority returns green (default)', () => expect(make('UNKNOWN').priorityColor, const Color(0xFF4ADE80)));
  });

  // ── Group 7: ApiConfig (4 tests) ────────────────────────────────────────
  group('ApiConfig', () {
    test('baseUrl points to ap-southeast-2', () => expect(ApiConfig.baseUrl, contains('ap-southeast-2')));
    test('baseUrl ends with /prod', () => expect(ApiConfig.baseUrl, endsWith('/prod')));
    test('region is ap-southeast-2', () => expect(ApiConfig.region, 'ap-southeast-2'));
    test('baseUrl is not empty', () => expect(ApiConfig.baseUrl, isNotEmpty));
  });

}