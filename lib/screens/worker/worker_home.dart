import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../services/lang_service.dart';
import 'dart:async';
import 'dart:ui';
import 'package:google_fonts/google_fonts.dart';
import '../role_selection_screen.dart';
import '../../services/session_service.dart';
import '../../services/api_service.dart';
import '../../models/bin_model.dart';

const Map<String, String> _binLocations = {
  'BIN_001': 'Homagama North Market',
  'BIN_002': 'Malapalla Junction',
  'BIN_003': 'Pitipana Town',
  'BIN_004': 'Thalangama Road',
  'BIN_005': 'NSBM Green University',
  'BIN_009': 'Homagama Town',
};

const Color _darkGreen = Color(0xFF1B4332);
const Color _midGreen = Color(0xFF2D6A4F);
const Color _lightGreen = Color(0xFF52B788);
const Color _criticalRed = Color(0xFFB91C1C);
const Color _highOrange = Color(0xFFEA580C);
const Color _mediumYellow = Color(0xFFD97706);
const Color _safeGreen = Color(0xFF16A34A);
const String _adminPhone = '0705239901';

class WorkerHome extends StatefulWidget {
  const WorkerHome({super.key});
  @override
  State<WorkerHome> createState() => _WorkerHomeState();
}

class _WorkerHomeState extends State<WorkerHome> {
  List<BinModel> _allBins = [];
  List<BinModel> _urgentBins = [];
  bool _isLoading = true;
  String? _error;
  Timer? _timer;
  Set<String> _collectedBins = {};

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
    try {
      final rawBins = await ApiService.getAllBins();
      final bins = rawBins.map((b) => BinModel.fromJson(b as Map<String, dynamic>)).toList();
      bins.sort((a, b) => b.healthRisk.compareTo(a.healthRisk));
      final urgent = bins.where((b) =>
      b.priority.toUpperCase() == 'CRITICAL' ||
          b.priority.toUpperCase() == 'HIGH'
      ).toList();
      if (mounted) setState(() { _allBins = bins; _urgentBins = urgent; _isLoading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _markCollected(String binId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(LangService.t('Mark as Collected?', 'එකතු කළ බව සනාථ කරන්න?'),
            style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: Text(LangService.t('Confirm that $binId has been emptied.', '$binId හිස් කළ බව තහවුරු කරන්න.'),
            style: GoogleFonts.poppins(fontSize: 13)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false),
              child: Text(LangService.t('Cancel', 'අවලංගු'), style: GoogleFonts.poppins(color: Colors.grey))),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: _midGreen, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: Text(LangService.t('Confirm', 'තහවුරු කරන්න'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await ApiService.collectBin(binId);
      setState(() => _collectedBins.add(binId));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(LangService.t('$binId marked as collected!', '$binId එකතු කළ බව සනාථ කෙරිණි!'),
              style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          backgroundColor: _safeGreen,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
        ));
      }
      await _loadBins();
    }
  }

  void _callAdmin() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: const Color(0xFFFFE4E4),
        title: Row(children: [
          const Icon(Icons.emergency_rounded, color: _criticalRed, size: 28),
          const SizedBox(width: 10),
          Text(LangService.t('Emergency Call', 'හදිසි ඇමතුම'),
              style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: _criticalRed)),
        ]),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text(LangService.t('Call Admin Officer?', 'පරිපාලක නිලධාරියාට ඇමතීමද?'),
              style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(_adminPhone, style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w800, color: _criticalRed)),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx),
              child: Text(LangService.t('Cancel', 'අවලංගු'), style: GoogleFonts.poppins(color: Colors.grey))),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(ctx);
              Clipboard.setData(const ClipboardData(text: _adminPhone));
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text(LangService.t('Number copied! $_adminPhone', 'අංකය පිටපත් කෙරිණි! $_adminPhone'),
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                backgroundColor: _criticalRed,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                margin: const EdgeInsets.all(16),
              ));
            },
            icon: const Icon(Icons.call_rounded),
            label: Text(LangService.t('Call Now', 'දැන් ඇමතීම'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
            style: ElevatedButton.styleFrom(backgroundColor: _criticalRed, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
          ),
        ],
      ),
    );
  }

  Color _priorityColor(String priority) {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return _criticalRed;
      case 'HIGH': return _highOrange;
      case 'MEDIUM': return _mediumYellow;
      default: return _safeGreen;
    }
  }

  @override
  Widget build(BuildContext context) {
    final critical = _allBins.where((b) => b.priority.toUpperCase() == 'CRITICAL').length;
    final high = _allBins.where((b) => b.priority.toUpperCase() == 'HIGH').length;
    final safe = _allBins.where((b) => b.priority.toUpperCase() == 'LOW' || b.priority.toUpperCase() == 'MEDIUM').length;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1B4332), Color(0xFF2D6A4F), Color(0xFF52B788)],
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(children: [
            // TOP BAR
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              child: Row(children: [
                GestureDetector(
                  onTap: () async {
                    await SessionService.clearSession();
                    if (!context.mounted) return;
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const RoleSelectionScreen()));
                  },
                  child: Container(
                    width: 38, height: 38,
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(LangService.t("Today's Route", 'අද මාර්ගය'),
                      style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                  Text(LangService.t('Homagama Municipal Council', 'හෝමාගම මහ නගර සභා'),
                      style: GoogleFonts.poppins(fontSize: 11, color: Colors.white70)),
                ])),
                // Emergency button
                GestureDetector(
                  onTap: _callAdmin,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: _criticalRed,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [BoxShadow(color: _criticalRed.withValues(alpha: 0.4), blurRadius: 8, offset: const Offset(0, 3))],
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.emergency_rounded, color: Colors.white, size: 16),
                      const SizedBox(width: 4),
                      Text(LangService.t('SOS', 'හදිසි'), style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
                    ]),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _loadBins,
                  child: Container(
                    width: 38, height: 38,
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                  ),
                ),
              ]),
            ),

            // CONTENT
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                child: Container(
                  color: const Color(0xFFEBF5EB),
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator(color: _midGreen))
                      : RefreshIndicator(
                    onRefresh: _loadBins,
                    color: _midGreen,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

                        // STAT CARDS
                        Row(children: [
                          _WorkerStatCard(value: '$critical', label: LangService.t('Critical', 'අවදානම්'), color: _criticalRed, icon: Icons.warning_rounded),
                          const SizedBox(width: 10),
                          _WorkerStatCard(value: '$high', label: LangService.t('High', 'ඉහළ'), color: _highOrange, icon: Icons.error_outline_rounded),
                          const SizedBox(width: 10),
                          _WorkerStatCard(value: '$safe', label: LangService.t('Safe', 'ආරක්ෂිත'), color: _safeGreen, icon: Icons.check_circle_outline_rounded),
                        ]),
                        const SizedBox(height: 20),

                        // FUEL TIP
                        if (_urgentBins.isNotEmpty)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: BackdropFilter(
                              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                margin: const EdgeInsets.only(bottom: 20),
                                decoration: BoxDecoration(
                                  color: _midGreen.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: _midGreen.withValues(alpha: 0.3)),
                                ),
                                child: Row(children: [
                                  Container(width: 36, height: 36, decoration: BoxDecoration(color: _midGreen.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                                      child: const Icon(Icons.local_gas_station_rounded, color: _midGreen, size: 18)),
                                  const SizedBox(width: 10),
                                  Expanded(child: Text(
                                    LangService.t(
                                      'Collect ${_urgentBins.length} priority bins today. Skip $safe safe bins to save fuel.',
                                      'අද ${_urgentBins.length} ප්‍රමුඛ කූඩ එකතු කරන්න. ඉන්ධන ඉතිරිය සඳහා $safe ආරක්ෂිත කූඩ මඟ හරින්න.',
                                    ),
                                    style: GoogleFonts.poppins(fontSize: 12, color: _darkGreen, fontWeight: FontWeight.w600),
                                  )),
                                ]),
                              ),
                            ),
                          ),

                        // COLLECTION ROUTE
                        if (_urgentBins.isNotEmpty) ...[
                          Row(children: [
                            const Icon(Icons.route_rounded, color: _darkGreen, size: 18),
                            const SizedBox(width: 6),
                            Text(LangService.t('Collection Route — ${_urgentBins.length} Stops', 'එකතු කිරීමේ මාර්ගය — ${_urgentBins.length} නැවතුම්'),
                                style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w800, color: _darkGreen)),
                          ]),
                          const SizedBox(height: 10),
                          ..._urgentBins.asMap().entries.map((e) {
                            final idx = e.key;
                            final bin = e.value;
                            final color = _priorityColor(bin.priority);
                            final location = _binLocations[bin.binId] ?? 'Homagama';
                            final isCollected = _collectedBins.contains(bin.binId);
                            return ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: BackdropFilter(
                                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  decoration: BoxDecoration(
                                    color: isCollected ? _safeGreen.withValues(alpha: 0.1) : Colors.white.withValues(alpha: 0.85),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border(left: BorderSide(color: isCollected ? _safeGreen : color, width: 4)),
                                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(children: [
                                      Row(children: [
                                        Container(
                                          width: 36, height: 36,
                                          decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
                                          child: Center(child: Text('${idx + 1}', style: GoogleFonts.poppins(color: color, fontWeight: FontWeight.w800, fontSize: 14))),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                          Row(children: [
                                            Text(bin.binId, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w800, color: const Color(0xFF1a1a1a))),
                                            const SizedBox(width: 8),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                                              child: Text(bin.priority.toUpperCase(), style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w800, color: color)),
                                            ),
                                            if (isCollected) ...[
                                              const SizedBox(width: 8),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                                decoration: BoxDecoration(color: _safeGreen.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                                                child: Text(LangService.t('COLLECTED', 'එකතු කළා'), style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w800, color: _safeGreen)),
                                              ),
                                            ],
                                          ]),
                                          const SizedBox(height: 2),
                                          Row(children: [
                                            const Icon(Icons.location_on_rounded, size: 12, color: Colors.grey),
                                            const SizedBox(width: 3),
                                            Text(location, style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey)),
                                          ]),
                                          const SizedBox(height: 8),
                                          Row(children: [
                                            _MetricChip(icon: Icons.air_rounded, label: '${bin.gasPpm.toStringAsFixed(0)} PPM', color: color),
                                            const SizedBox(width: 8),
                                            _MetricChip(icon: Icons.water_drop_rounded, label: '${bin.fillLevel.toStringAsFixed(0)}%', color: _midGreen),
                                            const SizedBox(width: 8),
                                            _MetricChip(icon: Icons.health_and_safety_rounded, label: 'Risk ${bin.healthRisk.toStringAsFixed(1)}', color: color),
                                          ]),
                                        ])),
                                      ]),
                                      if (!isCollected) ...[
                                        const SizedBox(height: 12),
                                        SizedBox(
                                          width: double.infinity,
                                          child: ElevatedButton.icon(
                                            onPressed: () => _markCollected(bin.binId),
                                            icon: const Icon(Icons.check_circle_rounded, size: 16),
                                            label: Text(LangService.t('Mark as Collected', 'එකතු කළ බව සනාථ කරන්න'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13)),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: _midGreen,
                                              foregroundColor: Colors.white,
                                              padding: const EdgeInsets.symmetric(vertical: 10),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                              elevation: 0,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ]),
                                  ),
                                ),
                              ),
                            );
                          }),
                        ] else ...[
                          Center(child: Padding(
                            padding: const EdgeInsets.all(40),
                            child: Column(children: [
                              const Icon(Icons.check_circle_rounded, color: _safeGreen, size: 64),
                              const SizedBox(height: 16),
                              Text(LangService.t('All Bins Are Safe!', 'සියලු කසල බඳුන ආරක්ෂිතයි!'),
                                  style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w800, color: _darkGreen)),
                              const SizedBox(height: 8),
                              Text(LangService.t('No collection needed today.\nAll bins are within safe levels.', 'අද එකතු කිරීමක් අවශ්‍ය නැත.\nසියලු කූඩ ආරක්ෂිත මට්ටමේ ඇත.'),
                                  style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey), textAlign: TextAlign.center),
                            ]),
                          )),
                        ],

                        // SAFETY REMINDERS
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(18),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                            child: Container(
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.80),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.6), width: 1.5),
                              ),
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Row(children: [
                                  Container(width: 32, height: 32, decoration: BoxDecoration(color: _criticalRed.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                                      child: const Icon(Icons.health_and_safety_rounded, color: _criticalRed, size: 18)),
                                  const SizedBox(width: 10),
                                  Text(LangService.t('Safety Reminders', 'ආරක්ෂා මතක් කිරීම්'),
                                      style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w800, color: _darkGreen)),
                                ]),
                                const SizedBox(height: 12),
                                _SafetyTip(icon: Icons.masks_rounded, color: _highOrange,
                                    text: LangService.t('Wear mask near CRITICAL bins (gas > 300 PPM)', 'CRITICAL කූඩ අසල (gas > 300 PPM) මාස්ක් පළඳින්න')),
                                _SafetyTip(icon: Icons.back_hand_rounded, color: _criticalRed,
                                    text: LangService.t('Use gloves when handling full bins', 'පිරුණු කූඩ හැසිරවීමේදී අත්වැසුම් භාවිතා කරන්න')),
                                _SafetyTip(icon: Icons.water_rounded, color: _midGreen,
                                    text: LangService.t('Wash hands after each collection stop', 'සෑම ස්ථානයකට පසු අත් සෝදා ගන්න')),
                                _SafetyTip(icon: Icons.thermostat_rounded, color: _mediumYellow,
                                    text: LangService.t('Stay hydrated — drink water regularly', 'ජලය නිතිපතා බොමින් ශරීරය සජලනය කරගන්න')),
                                _SafetyTip(icon: Icons.warning_rounded, color: _criticalRed,
                                    text: LangService.t('Report any gas leaks or fires immediately', 'ගෑස් කාන්දුවීම් හෝ ගිනිගැනීම් වහාම වාර්තා කරන්න')),
                              ]),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                      ]),
                    ),
                  ),
                ),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

class _WorkerStatCard extends StatelessWidget {
  final String value, label;
  final Color color;
  final IconData icon;
  const _WorkerStatCard({required this.value, required this.label, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.80),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white, width: 1.5),
              boxShadow: [BoxShadow(color: color.withValues(alpha: 0.1), blurRadius: 12, offset: const Offset(0, 4))],
            ),
            child: Column(children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 6),
              Text(value, style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: color)),
              Text(label, style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey)),
            ]),
          ),
        ),
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _MetricChip({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(8)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 4),
        Text(label, style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
      ]),
    );
  }
}

class _SafetyTip extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String text;
  const _SafetyTip({required this.icon, required this.color, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 28, height: 28,
          decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: color, size: 14),
        ),
        const SizedBox(width: 10),
        Expanded(child: Text(text, style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF374151), height: 1.4))),
      ]),
    );
  }
}