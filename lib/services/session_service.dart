import 'package:shared_preferences/shared_preferences.dart';

class SessionService {
  static const _keyUserName = 'userName';
  static const _keyPhone = 'phone';
  static const _keyIsRatepayer = 'isRatepayer';
  static const _keyStreet = 'street';
  static const _keyRegNumber = 'regNumber';
  static const _keyRole = 'role';
  static const _keyIsLoggedIn = 'isLoggedIn';

  static Future<void> saveCitizenSession({
    required String userName,
    required String phone,
    required bool isRatepayer,
    required String street,
    required String registrationNumber,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserName, userName);
    await prefs.setString(_keyPhone, phone);
    await prefs.setBool(_keyIsRatepayer, isRatepayer);
    await prefs.setString(_keyStreet, street);
    await prefs.setString(_keyRegNumber, registrationNumber);
    await prefs.setString(_keyRole, 'citizen');
    await prefs.setBool(_keyIsLoggedIn, true);
  }

  static Future<void> saveWorkerSession(String workerId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserName, workerId);
    await prefs.setString(_keyRole, 'worker');
    await prefs.setBool(_keyIsLoggedIn, true);
  }

  static Future<Map<String, dynamic>?> getSession() async {
    final prefs = await SharedPreferences.getInstance();
    final isLoggedIn = prefs.getBool(_keyIsLoggedIn) ?? false;
    if (!isLoggedIn) return null;
    return {
      'role': prefs.getString(_keyRole) ?? '',
      'userName': prefs.getString(_keyUserName) ?? '',
      'phone': prefs.getString(_keyPhone) ?? '',
      'isRatepayer': prefs.getBool(_keyIsRatepayer) ?? false,
      'street': prefs.getString(_keyStreet) ?? '',
      'registrationNumber': prefs.getString(_keyRegNumber) ?? '',
    };
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
