import 'package:shared_preferences/shared_preferences.dart';

class LangService {
  static const _keyLang = 'lang';
  static bool isSinhala = false;

  static Future<void> setLanguage(bool sinhala) async {
    isSinhala = sinhala;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyLang, sinhala);
  }

  static Future<void> loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    isSinhala = prefs.getBool(_keyLang) ?? false;
  }

  static String t(String english, String sinhala) {
    return isSinhala ? sinhala : english;
  }
}
