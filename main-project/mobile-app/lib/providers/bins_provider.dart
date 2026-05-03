import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';
import '../models/bin_model.dart';

// Stats provider
final statsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return await ApiService.getStats();
});

// All bins provider
final allBinsProvider = FutureProvider<List<BinModel>>((ref) async {
  final data = await ApiService.getAllBins();
  return data.map((e) => BinModel.fromJson(e as Map<String, dynamic>)).toList();
});

// Critical bins provider
final criticalBinsProvider = FutureProvider<List<BinModel>>((ref) async {
  final data = await ApiService.getBinsByPriority('CRITICAL');
  return data.map((e) => BinModel.fromJson(e as Map<String, dynamic>)).toList();
});
