import 'package:dio/dio.dart';
import '../config/api_config.dart';

class ApiService {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  static Future<List<dynamic>> getAllBins() async {
    try {
      final response = await _dio.get('/bin');
      final data = response.data;
      if (data is Map) return data['bins'] ?? [];
      return [];
    } catch (e) {
      print('getAllBins error: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>> getStats() async {
    try {
      final response = await _dio.get('/dashboard/stats');
      final data = response.data;
      if (data is Map) return Map<String, dynamic>.from(data['stats'] ?? data);
      return {};
    } catch (e) {
      print('getStats error: $e');
      return {};
    }
  }

  static Future<Map<String, dynamic>> getBin(String binId) async {
    try {
      final response = await _dio.get('/bin/$binId');
      final data = response.data;
      if (data is Map) return Map<String, dynamic>.from(data['bin'] ?? data);
      return {};
    } catch (e) {
      print('getBin error: $e');
      return {};
    }
  }

  static Future<List<dynamic>> getBinHistory(String binId) async {
    try {
      final response = await _dio.get('/bin/$binId/history');
      final data = response.data;
      if (data is Map) return data['history'] ?? [];
      return [];
    } catch (e) {
      print('getBinHistory error: $e');
      return [];
    }
  }

  static Future<List<dynamic>> getBinsByPriority(String priority) async {
    try {
      final response = await _dio.get('/bin/priority/$priority');
      final data = response.data;
      if (data is Map) return data['bins'] ?? [];
      return [];
    } catch (e) {
      print('getBinsByPriority error: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>> citizenSignup({
    required String name,
    required String phone,
    required String password,
    required bool isRatepayer,
    String registrationNumber = '',
    String street = '',
    String address = '',
  }) async {
    try {
      final response = await _dio.post('/citizen/signup', data: {
        'name': name,
        'phone': phone,
        'password': password,
        'is_ratepayer': isRatepayer,
        'registration_number': registrationNumber,
        'street': street,
        'address': address,
      });
      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      return {'success': false, 'message': 'Connection error. Try again.'};
    }
  }

  static Future<Map<String, dynamic>> citizenSignin({
    required String phone,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/citizen/signin', data: {
        'phone': phone,
        'password': password,
      });
      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      return {'success': false, 'message': 'Connection error. Try again.'};
    }
  }

  static Future<Map<String, dynamic>> submitReport({
    required String phone,
    required String name,
    required String description,
    required String reportType,
    String binId = 'General',
    String area = 'Homagama',
  }) async {
    try {
      final response = await _dio.post('/report', data: {
        'phone': phone,
        'name': name,
        'description': description,
        'report_type': reportType,
        'bin_id': binId,
        'area': area,
      });
      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      return {'success': false, 'message': 'Connection error. Try again.'};
    }
  }

  static Future<List<dynamic>> getReports() async {
    try {
      final response = await _dio.get('/report');
      final data = response.data;
      if (data is Map) return data['reports'] ?? [];
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> getSchedule() async {
    try {
      final response = await _dio.get('/schedule');
      final data = response.data;
      if (data is Map) return Map<String, dynamic>.from(data['schedule'] ?? {});
      return {};
    } catch (e) {
      return {};
    }
  }

  static Future<bool> collectBin(String binId) async {
    try {
      await _dio.post('/bin-data', data: {
        'bin_id': binId,
        'gas_ppm': 0,
        'fill_level': 0,
        'temperature': 28.0,
        'humidity': 75.0,
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
