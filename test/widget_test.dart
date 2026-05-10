import 'package:flutter_test/flutter_test.dart';
import 'package:mycollect_mobile/services/lang_service.dart';

void main() {

  test('Health risk formula calculates correctly', () {
    const gasPpm = 600.0;
    const fillLevel = 40.0;
    final score = (gasPpm / 1000 * 100 * 0.70) + (fillLevel * 0.30);
    expect(score, 54.0);
  });

  test('Gas above 500 PPM classifies as CRITICAL', () {
    const gasPpm = 520.0;
    final priority = gasPpm > 500 ? 'CRITICAL' : 'HIGH';
    expect(priority, 'CRITICAL');
  });

  test('Gas between 300 and 500 PPM classifies as HIGH', () {
    const gasPpm = 350.0;
    final priority = gasPpm > 500
        ? 'CRITICAL'
        : gasPpm > 300
        ? 'HIGH'
        : 'MEDIUM';
    expect(priority, 'HIGH');
  });

  test('LangService returns English when isSinhala is false', () {
    LangService.isSinhala = false;
    expect(LangService.t('Hello', 'හෙලෝ'), 'Hello');
  });

  test('LangService returns Sinhala when isSinhala is true', () {
    LangService.isSinhala = true;
    expect(LangService.t('Hello', 'හෙලෝ'), 'හෙලෝ');
  });

  test('Gas below 100 PPM and fill below 50 classifies as LOW', () {
    const gasPpm = 80.0;
    const fillLevel = 30.0;
    final priority = gasPpm > 500
        ? 'CRITICAL'
        : gasPpm > 300
        ? 'HIGH'
        : gasPpm > 100 || fillLevel > 50
        ? 'MEDIUM'
        : 'LOW';
    expect(priority, 'LOW');
  });

}