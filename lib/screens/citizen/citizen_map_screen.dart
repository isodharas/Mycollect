import 'package:flutter/material.dart';
import '../../services/lang_service.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:async';
import '../../services/api_service.dart';

class CitizenMapScreen extends StatefulWidget {
  const CitizenMapScreen({super.key});

  @override
  State<CitizenMapScreen> createState() => _CitizenMapScreenState();
}

class _CitizenMapScreenState extends State<CitizenMapScreen> {
  List<dynamic> _bins = [];
  bool _loading = true;
  Timer? _timer;
  dynamic _selectedBin;

  // Real coordinates — unchanged
  final Map<String, LatLng> _binCoordinates = {
    'BIN_001': LatLng(6.8749, 80.0014),
    'BIN_002': LatLng(6.8712, 79.9989),
    'BIN_003': LatLng(6.8698, 80.0045),
    'BIN_004': LatLng(6.8765, 80.0028),
    'BIN_005': LatLng(6.8213, 80.0415),
    'BIN_009': LatLng(6.8700, 80.0050),
  };

  // FIX ① – bin location names now go through LangService.t()
  // Previously these were plain English strings returned directly.
  // Now they return the correct language at the moment they are called.
  Map<String, String> get _binLocations => {
    'BIN_001': LangService.t('Homagama North Market',  'හෝමාගම උතුරු වෙළඳපොළ'),
    'BIN_002': LangService.t('Malapalla Junction',     'මාලාපල්ල හන්දිය'),
    'BIN_003': LangService.t('Pitipana Town',          'පිටිපාන නගරය'),
    'BIN_004': LangService.t('Thalangama Road',        'තලංගම පාර'),
    'BIN_005': LangService.t('Kotikawatta Bus Stop',   'කොටිකාවත්ත බස් නැවතුම'),
  };

  // FIX ② – priority label translator
  // The API always returns English ('CRITICAL', 'HIGH', etc.).
  // This helper converts it to the correct display language.
  String _priorityLabel(String priority) {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return LangService.t('CRITICAL', 'අවදානම්');
      case 'HIGH':     return LangService.t('HIGH',     'ඉහළ');
      case 'MEDIUM':   return LangService.t('MEDIUM',   'මධ්‍යම');
      default:         return LangService.t('LOW',      'සාමාන්‍ය');
    }
  }

  // Unchanged colour + icon helpers
  Color _priorityColor(String priority) {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return const Color(0xFFDC2626);
      case 'HIGH':     return const Color(0xFFEA580C);
      case 'MEDIUM':   return const Color(0xFFD97706);
      default:         return const Color(0xFF16A34A);
    }
  }

  IconData _priorityIcon(String priority) {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return Icons.warning_rounded;
      case 'HIGH':     return Icons.error_outline_rounded;
      case 'MEDIUM':   return Icons.info_outline_rounded;
      default:         return Icons.check_circle_outline_rounded;
    }
  }

  // Unchanged lifecycle
  @override
  void initState() {
    super.initState();
    _loadBins();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _loadBins());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadBins() async {
    final bins = await ApiService.getAllBins();
    if (mounted) setState(() { _bins = bins; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(children: [
        // Header — unchanged except already uses LangService
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
          child: Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                LangService.t('Live Bin Map', 'සජීවී කසල බඳුන සිතියම'),
                style: GoogleFonts.poppins(
                    fontSize: 22, fontWeight: FontWeight.w800,
                    color: const Color(0xFF0F172A)),
              ),
              Text(
                LangService.t('Homagama area • Updates every 30s',
                    'හෝමාගම ප්‍රදේශය • සෑම තත්පර 30කට'),
                style: GoogleFonts.poppins(fontSize: 12,
                    color: Colors.grey.shade500),
              ),
            ])),
            // Legend dots — already used LangService, unchanged
            Row(children: [
              _legendDot(const Color(0xFFDC2626),
                  LangService.t('Critical', 'අවදානම්')),
              const SizedBox(width: 8),
              _legendDot(const Color(0xFFEA580C),
                  LangService.t('High', 'ඉහළ')),
              const SizedBox(width: 8),
              _legendDot(const Color(0xFF16A34A),
                  LangService.t('Low', 'සාමාන්‍ය')),
            ]),
          ]),
        ),

        // Map — unchanged
        Expanded(
          flex: 3,
          child: _loading
              ? const Center(
                  child: CircularProgressIndicator(color: Color(0xFF4A8C28)))
              : ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(0)),
                  child: FlutterMap(
                    options: MapOptions(
                      initialCenter: LatLng(6.8500, 80.0200),
                      initialZoom: 13.0,
                      onTap: (_, __) => setState(() => _selectedBin = null),
                    ),
                    children: [
                      TileLayer(
                        urlTemplate:
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.mycollect.app',
                      ),
                      MarkerLayer(
                        markers: _bins.map((bin) {
                          final id       = bin['bin_id'] ?? '';
                          final priority = bin['priority_label'] ?? 'LOW';
                          final coord    = _binCoordinates[id] ??
                              LatLng(6.8728, 80.0014);
                          final color    = _priorityColor(priority);
                          final isSelected = _selectedBin != null &&
                              _selectedBin['bin_id'] == id;

                          return Marker(
                            point: coord,
                            width:  isSelected ? 56 : 44,
                            height: isSelected ? 56 : 44,
                            child: GestureDetector(
                              onTap: () =>
                                  setState(() => _selectedBin = bin),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color: Colors.white,
                                      width: isSelected ? 3 : 2),
                                  boxShadow: [
                                    BoxShadow(
                                      color: color.withValues(alpha: 0.4),
                                      blurRadius: isSelected ? 16 : 8,
                                      spreadRadius: isSelected ? 2 : 0,
                                    ),
                                  ],
                                ),
                                child: Icon(Icons.delete_rounded,
                                    color: Colors.white,
                                    size: isSelected ? 28 : 22),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
        ),

        // Selected bin card OR bin list
        if (_selectedBin != null)
          _buildBinCard(_selectedBin!)
        else
          _buildBinList(),
      ]),
    );
  }

  // ── BIN DETAIL CARD ───────────────────────────────────────────────
  Widget _buildBinCard(dynamic bin) {
    final priority = bin['priority_label'] ?? 'LOW';
    final color    = _priorityColor(priority);
    final id       = bin['bin_id'] ?? '';
    final fill     = (bin['fill_level']  ?? 0).toDouble();
    final gas      = (bin['gas_ppm']     ?? 0).toDouble();
    final health   = (bin['health_risk'] ?? 0).toDouble();

    // FIX ③ – location uses the getter which now returns translated string
    final location = _binLocations[id] ??
        LangService.t('Homagama Area', 'හෝමාගම ප්‍රදේශය');

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(
            color: Colors.black.withValues(alpha: 0.08), blurRadius: 16)],
      ),
      child: Column(children: [
        Row(children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(_priorityIcon(priority), color: color, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(id,
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w800, fontSize: 15,
                      color: const Color(0xFF0F172A))),
              Text(location,
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: Colors.grey.shade500)),
            ],
          )),
          // FIX ④ – priority badge now shows translated label, not raw API value
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _priorityLabel(priority), // ← translated
              style: GoogleFonts.poppins(
                  color: color, fontSize: 11, fontWeight: FontWeight.w800),
            ),
          ),
        ]),
        const SizedBox(height: 14),

        // FIX ⑤ – metric chip labels ('Gas', 'Fill', 'Risk') now translated
        Row(children: [
          _metricChip(
            Icons.air_rounded,
            '${gas.toInt()} PPM',
            LangService.t('Gas', 'වායු'),   // ← was hardcoded 'Gas'
            color,
          ),
          const SizedBox(width: 8),
          _metricChip(
            Icons.water_drop_rounded,
            '${fill.toInt()}%',
            LangService.t('Fill', 'පිරවුම'), // ← was hardcoded 'Fill'
            const Color(0xFF4A8C28),
          ),
          const SizedBox(width: 8),
          _metricChip(
            Icons.health_and_safety_rounded,
            health.toStringAsFixed(1),
            LangService.t('Risk', 'අවදානම'), // ← was hardcoded 'Risk'
            color,
          ),
        ]),

        // FIX ⑥ – warning messages now translated
        if (priority == 'CRITICAL' || priority == 'HIGH') ...[
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(children: [
              Icon(Icons.notifications_active_rounded, color: color, size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  priority == 'CRITICAL'
                      ? LangService.t(
                          'Dangerous gas levels! Avoid this area.',
                          'භයානක වායු මට්ටම්! මෙම ප්‍රදේශය වළකින්න.')
                      : LangService.t(
                          'High gas levels detected. Collection needed soon.',
                          'ඉහළ වායු මට්ටම් හඳුනා ගන්නා ලදී. ඉක්මනින් එකතු කිරීම අවශ්‍යයි.'),
                  style: GoogleFonts.poppins(
                      color: color, fontSize: 11,
                      fontWeight: FontWeight.w600),
                ),
              ),
            ]),
          ),
        ],
      ]),
    );
  }

  // ── HORIZONTAL BIN LIST (shown when no bin is selected) ───────────
  Widget _buildBinList() {
    if (_bins.isEmpty) return const SizedBox();
    return Container(
      height: 100,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(
            LangService.t('Tap a bin on the map for details',
                'විස්තර සඳහා සිතියමේ කසල බඳුනක් තෝරන්න'),
            style: GoogleFonts.poppins(
                fontSize: 11, color: Colors.grey.shade500),
          ),
        ),
        Expanded(
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _bins.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, i) {
              final bin      = _bins[i];
              final priority = bin['priority_label'] ?? 'LOW';
              final color    = _priorityColor(priority);
              return GestureDetector(
                onTap: () => setState(() => _selectedBin = bin),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border:
                        Border.all(color: color.withValues(alpha: 0.3)),
                  ),
                  child: Row(children: [
                    Container(
                      width: 8, height: 8,
                      decoration: BoxDecoration(
                          color: color, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 8),
                    Text(bin['bin_id'] ?? '',
                        style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF0F172A))),
                    const SizedBox(width: 6),
                    // FIX ⑦ – chip priority label in bin list also translated
                    Text(
                      _priorityLabel(priority), // ← was raw 'priority'
                      style: GoogleFonts.poppins(
                          fontSize: 10, color: color,
                          fontWeight: FontWeight.w600),
                    ),
                  ]),
                ),
              );
            },
          ),
        ),
      ]),
    );
  }

  // ── HELPERS ───────────────────────────────────────────────────────
  // label parameter now receives an already-translated string from caller
  Widget _metricChip(
      IconData icon, String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(height: 3),
          Text(value,
              style: GoogleFonts.poppins(
                  fontSize: 13, fontWeight: FontWeight.w700,
                  color: const Color(0xFF0F172A))),
          Text(label,
              style: GoogleFonts.poppins(
                  fontSize: 10, color: Colors.grey.shade500)),
        ]),
      ),
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(children: [
      Container(
        width: 8, height: 8,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      ),
      const SizedBox(width: 3),
      Text(label,
          style: GoogleFonts.poppins(
              fontSize: 9, color: Colors.grey.shade600)),
    ]);
  }
}
