import 'package:flutter/material.dart';
import '../../services/lang_service.dart';
import 'dart:async';
import 'package:google_fonts/google_fonts.dart';
import '../role_selection_screen.dart';
import '../../services/session_service.dart';
import '../../services/api_service.dart';
import '../../models/bin_model.dart';

// ── shared bin location map ───────────────────────────────────────────────
Map<String, String> binLocations(bool isSinhala) => {
  'BIN_001': LangService.t('Homagama North Market',  'හෝමාගම උතුරු වෙළඳපොළ'),
  'BIN_002': LangService.t('Malapalla Junction',     'මාලාපල්ල හන්දිය'),
  'BIN_003': LangService.t('Pitipana Town',          'පිටිපාන නගරය'),
  'BIN_004': LangService.t('Thalangama Road',        'තලංගම පාර'),
  'BIN_005': LangService.t('Kotikawatta Bus Stop',   'කොටිකාවත්ත බස් නැවතුම'),
};

// ── root shell ────────────────────────────────────────────────────────────
class WorkerHome extends StatefulWidget {
  final String workerName;
  final String workerId;
  final String vehicle;
  const WorkerHome({
    super.key,
    this.workerName = 'Worker',
    this.workerId = 'WRK-001',
    this.vehicle = 'Truck #1',
  });
  @override
  State<WorkerHome> createState() => _WorkerHomeState();
}

class _WorkerHomeState extends State<WorkerHome> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F0),
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          _RouteTab(workerName: widget.workerName, vehicle: widget.vehicle),
          _ScheduleTab(workerName: widget.workerName),
          _ProfileTab(
            workerName: widget.workerName,
            workerId: widget.workerId,
            vehicle: widget.vehicle,
            onSignOut: () async {
              await SessionService.clearSession();
              if (!context.mounted) return;
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const RoleSelectionScreen()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    final items = [
      {'icon': Icons.route_rounded,            'label': LangService.t('Route',    'මාර්ගය')},
      {'icon': Icons.calendar_month_rounded,   'label': LangService.t('Schedule', 'කාලසටහන')},
      {'icon': Icons.person_rounded,           'label': LangService.t('Profile',  'පැතිකඩ')},
    ];
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, -2))],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: items.asMap().entries.map((e) {
              final isSelected = _selectedIndex == e.key;
              final item = e.value;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _selectedIndex = e.key),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeInOut,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF2D5A1B).withValues(alpha: 0.10) : Colors.transparent,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(item['icon'] as IconData,
                          color: isSelected ? const Color(0xFF2D5A1B) : Colors.grey.shade400, size: 24),
                      const SizedBox(height: 4),
                      Text(item['label'] as String,
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w400,
                            color: isSelected ? const Color(0xFF2D5A1B) : Colors.grey.shade400,
                          )),
                    ]),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

// ── ROUTE TAB (your original worker_home content, cleaned up) ────────────
class _RouteTab extends StatefulWidget {
  final String workerName;
  final String vehicle;
  const _RouteTab({required this.workerName, required this.vehicle});
  @override
  State<_RouteTab> createState() => _RouteTabState();
}

class _RouteTabState extends State<_RouteTab> {
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
    setState(() { _isLoading = true; _error = null; });
    try {
      final rawBins = await ApiService.getAllBins();
      final bins = rawBins.map((b) => BinModel.fromJson(b as Map<String, dynamic>)).toList();
      bins.sort((a, b) => b.healthRisk.compareTo(a.healthRisk));
      final urgent = bins.where((b) =>
          b.priority.toUpperCase() == 'CRITICAL' ||
          b.priority.toUpperCase() == 'HIGH').toList();
      setState(() { _allBins = bins; _urgentBins = urgent; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _markCollected(String binId) {
    setState(() {
      if (_collectedBins.contains(binId)) {
        _collectedBins.remove(binId);
      } else {
        _collectedBins.add(binId);
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(
        _collectedBins.contains(binId)
            ? LangService.t('$binId marked as collected ✓', '$binId එකතු කරන ලදී ✓')
            : LangService.t('$binId unmarked', '$binId ඉවත් කරන ලදී'),
        style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600),
      ),
      backgroundColor: const Color(0xFF2D5A1B),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(16),
      duration: const Duration(seconds: 2),
    ));
  }

  Color _priorityColor(String priority) {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return const Color(0xFFDC2626);
      case 'HIGH':     return const Color(0xFFEA580C);
      case 'MEDIUM':   return const Color(0xFFD97706);
      default:         return const Color(0xFF16A34A);
    }
  }

  @override
  Widget build(BuildContext context) {
    final locations = binLocations(LangService.isSinhala);
    final critical = _allBins.where((b) => b.priority.toUpperCase() == 'CRITICAL').length;
    final high     = _allBins.where((b) => b.priority.toUpperCase() == 'HIGH').length;
    final safe     = _allBins.where((b) =>
        b.priority.toUpperCase() == 'LOW' || b.priority.toUpperCase() == 'MEDIUM').length;
    final collected = _collectedBins.length;
    final total     = _urgentBins.length;

    return SafeArea(
      child: Column(children: [
        // ── APP BAR ──────────────────────────────────────────────────
        Container(
          color: const Color(0xFF2D5A1B),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          child: Row(children: [
            Container(
              width: 42, height: 42,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  widget.workerName.isNotEmpty ? widget.workerName[0].toUpperCase() : 'W',
                  style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                LangService.t("Today's Route", 'අද මාර්ගය'),
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              Text(
                '${widget.workerName} · ${widget.vehicle}',
                style: GoogleFonts.poppins(fontSize: 10, color: Colors.white70),
              ),
            ])),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, color: Colors.white),
              onPressed: _loadBins,
            ),
          ]),
        ),

        // ── BODY ─────────────────────────────────────────────────────
        Expanded(
          child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF4A8C28)))
            : _error != null
              ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 48),
                  const SizedBox(height: 12),
                  Text('Error loading bins', style: GoogleFonts.poppins(color: Colors.red)),
                  const SizedBox(height: 12),
                  ElevatedButton(onPressed: _loadBins,
                      child: Text(LangService.t('Retry', 'නැවත උත්සාහ කරන්න'))),
                ]))
              : RefreshIndicator(
                  onRefresh: _loadBins,
                  color: const Color(0xFF4A8C28),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

                      // Progress bar
                      if (total > 0) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFF2D5A1B), Color(0xFF4A8C28)]),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Text(LangService.t("Today's Progress", 'අදගේ ප්‍රගතිය'),
                                  style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                              Text('$collected / $total ${LangService.t("bins", "කූඩ")}',
                                  style: GoogleFonts.poppins(color: Colors.white70, fontSize: 12)),
                            ]),
                            const SizedBox(height: 10),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: LinearProgressIndicator(
                                value: total > 0 && collected > 0 ? collected / total : 0.0,
                                backgroundColor: Colors.white.withValues(alpha: 0.2),
                                valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                                minHeight: 10,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              collected == total && total > 0
                                  ? LangService.t('✓ All priority bins collected!', '✓ සියලු ප්‍රමුඛ කූඩ එකතු කරන ලදී!')
                                  : LangService.t('${total - collected} bins remaining', '${total - collected} කූඩ ඉතිරිය'),
                              style: GoogleFonts.poppins(color: Colors.white70, fontSize: 11),
                            ),
                          ]),
                        ),
                      ],

                      // Stats row
                      Row(children: [
                        _StatCard(value: '$critical', label: LangService.t('Critical', 'අවදානම්'), color: const Color(0xFFDC2626), icon: Icons.warning_rounded),
                        const SizedBox(width: 10),
                        _StatCard(value: '$high',     label: LangService.t('High', 'ඉහළ'),        color: const Color(0xFFEA580C), icon: Icons.error_outline_rounded),
                        const SizedBox(width: 10),
                        _StatCard(value: '$safe',     label: LangService.t('Safe', 'ආරක්ෂිත'),   color: const Color(0xFF16A34A), icon: Icons.check_circle_outline_rounded),
                      ]),
                      const SizedBox(height: 16),

                      // Gas warning
                      if (_urgentBins.any((b) => b.gasPpm > 500)) ...[
                        Container(
                          padding: const EdgeInsets.all(14),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEE2E2),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFDC2626).withValues(alpha: 0.4)),
                          ),
                          child: Row(children: [
                            const Icon(Icons.masks_rounded, color: Color(0xFFDC2626), size: 24),
                            const SizedBox(width: 10),
                            Expanded(child: Text(
                              LangService.t('⚠️ High gas levels! Wear PPE before collecting.',
                                  '⚠️ ඉහළ වායු මට්ටම්! කූඩ එකතු කිරීමට පෙර ආරක්ෂිත උපකරණ පළඳින්න.'),
                              style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFFDC2626), fontWeight: FontWeight.w600),
                            )),
                          ]),
                        ),
                      ],

                      // Fuel tip
                      if (_urgentBins.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.all(14),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFF4A8C28).withValues(alpha: 0.3)),
                          ),
                          child: Row(children: [
                            const Icon(Icons.local_gas_station_rounded, color: Color(0xFF2D5A1B), size: 20),
                            const SizedBox(width: 10),
                            Expanded(child: Text(
                              LangService.t(
                                'Collect ${_urgentBins.length} priority bin${_urgentBins.length > 1 ? "s" : ""} today. Skip $safe safe bins to save fuel.',
                                'අද ප්‍රමුඛ කූඩ ${_urgentBins.length}ක් එකතු කරන්න. ඉන්ධන ඉතිරි කිරීමට ආරක්ෂිත කූඩ $safe ක් මඟ හරින්න.',
                              ),
                              style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF2D5A1B), fontWeight: FontWeight.w600),
                            )),
                          ]),
                        ),

                      // Priority bins
                      if (_urgentBins.isNotEmpty) ...[
                        Row(children: [
                          const Icon(Icons.route_rounded, color: Color(0xFF2D5A1B), size: 18),
                          const SizedBox(width: 6),
                          Expanded(child: Text(
                            LangService.t('Collection Route — ${_urgentBins.length} Stops',
                                'එකතු කිරීමේ මාර්ගය — නැවතුම් ${_urgentBins.length}ක්'),
                            style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w800, color: const Color(0xFF2D5A1B)),
                            overflow: TextOverflow.ellipsis,
                          )),
                        ]),
                        const SizedBox(height: 10),
                        ..._urgentBins.asMap().entries.map((e) {
                          final idx = e.key;
                          final bin = e.value;
                          final color = _priorityColor(bin.priority);
                          final location = locations[bin.binId] ?? LangService.t('Homagama', 'හෝමාගම');
                          final isCollected = _collectedBins.contains(bin.binId);
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: isCollected ? const Color(0xFFE8F5E9) : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border(left: BorderSide(color: isCollected ? const Color(0xFF16A34A) : color, width: 4)),
                              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(children: [
                                Container(
                                  width: 36, height: 36,
                                  decoration: BoxDecoration(
                                    color: isCollected ? const Color(0xFF16A34A).withValues(alpha: 0.12) : color.withValues(alpha: 0.12),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(child: isCollected
                                      ? const Icon(Icons.check_rounded, color: Color(0xFF16A34A), size: 18)
                                      : Text('${idx + 1}', style: GoogleFonts.poppins(color: color, fontWeight: FontWeight.w800, fontSize: 14))),
                                ),
                                const SizedBox(width: 12),
                                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Row(children: [
                                    Text(bin.binId, style: GoogleFonts.poppins(
                                        fontSize: 14, fontWeight: FontWeight.w800,
                                        color: isCollected ? Colors.grey : const Color(0xFF1a1a1a))),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: isCollected ? const Color(0xFF16A34A).withValues(alpha: 0.1) : color.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        isCollected ? LangService.t('COLLECTED', 'එකතු කළා') : bin.priority.toUpperCase(),
                                        style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w800,
                                            color: isCollected ? const Color(0xFF16A34A) : color),
                                      ),
                                    ),
                                  ]),
                                  const SizedBox(height: 2),
                                  Row(children: [
                                    const Icon(Icons.location_on_rounded, size: 12, color: Colors.grey),
                                    const SizedBox(width: 3),
                                    Text(location, style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey)),
                                  ]),
                                  if (!isCollected) ...[
                                    const SizedBox(height: 8),
                                    Row(children: [
                                      _MetricChip(icon: Icons.air_rounded,              label: '${bin.gasPpm.toStringAsFixed(0)} PPM', color: color),
                                      const SizedBox(width: 6),
                                      _MetricChip(icon: Icons.water_drop_rounded,       label: '${bin.fillLevel.toStringAsFixed(0)}%',  color: const Color(0xFF4A8C28)),
                                      const SizedBox(width: 6),
                                      _MetricChip(icon: Icons.health_and_safety_rounded, label: bin.healthRisk.toStringAsFixed(1),       color: color),
                                    ]),
                                  ],
                                ])),
                                const SizedBox(width: 8),
                                GestureDetector(
                                  onTap: () => _markCollected(bin.binId),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: isCollected ? const Color(0xFF16A34A) : const Color(0xFF2D5A1B),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                                      Icon(isCollected ? Icons.check_circle_rounded : Icons.check_rounded,
                                          color: Colors.white, size: 18),
                                      const SizedBox(height: 2),
                                      Text(
                                        isCollected ? LangService.t('Done', 'කළා') : LangService.t('Collect', 'එකතු'),
                                        style: GoogleFonts.poppins(fontSize: 9, color: Colors.white, fontWeight: FontWeight.w700),
                                      ),
                                    ]),
                                  ),
                                ),
                              ]),
                            ),
                          );
                        }),
                      ] else ...[
                        Center(child: Padding(
                          padding: const EdgeInsets.all(40),
                          child: Column(children: [
                            const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 64),
                            const SizedBox(height: 16),
                            Text(LangService.t('All Bins Are Safe!', 'සියලු කසල බඳුන ආරක්ෂිතයි!'),
                                style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF2D5A1B)),
                                textAlign: TextAlign.center),
                            const SizedBox(height: 8),
                            Text(LangService.t('No collection needed today.', 'අද එකතු කිරීමක් අවශ්‍ය නැත.'),
                                style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey),
                                textAlign: TextAlign.center),
                          ]),
                        )),
                      ],

                      // Safe bins
                      if (safe > 0) ...[
                        const SizedBox(height: 8),
                        ExpansionTile(
                          tilePadding: EdgeInsets.zero,
                          title: Row(children: [
                            const Icon(Icons.check_circle_outline_rounded, color: Color(0xFF16A34A), size: 18),
                            const SizedBox(width: 6),
                            Expanded(child: Text(
                              LangService.t('$safe Safe Bins', 'ආරක්ෂිත කූඩ $safe ක්'),
                              style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF16A34A)),
                              overflow: TextOverflow.ellipsis,
                            )),
                          ]),
                          children: _allBins.where((b) =>
                              b.priority.toUpperCase() == 'LOW' ||
                              b.priority.toUpperCase() == 'MEDIUM').map((bin) =>
                            Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: Row(children: [
                                Icon(Icons.delete_outline_rounded, color: Colors.grey.shade400, size: 22),
                                const SizedBox(width: 10),
                                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(bin.binId, style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.grey.shade600)),
                                  Text(locations[bin.binId] ?? LangService.t('Homagama', 'හෝමාගම'),
                                      style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey.shade400)),
                                ])),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF16A34A).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(bin.priority.toUpperCase(),
                                      style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w700, color: const Color(0xFF16A34A))),
                                ),
                              ]),
                            ),
                          ).toList(),
                        ),
                      ],
                      const SizedBox(height: 24),
                    ]),
                  ),
                ),
        ),
      ]),
    );
  }
}

// ── SCHEDULE TAB ──────────────────────────────────────────────────────────
class _ScheduleTab extends StatefulWidget {
  final String workerName;
  const _ScheduleTab({required this.workerName});
  @override
  State<_ScheduleTab> createState() => _ScheduleTabState();
}

class _ScheduleTabState extends State<_ScheduleTab> {
  Map<String, dynamic> _schedule = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSchedule();
  }

  Future<void> _loadSchedule() async {
    try {
      final s = await ApiService.getSchedule();
      if (mounted) setState(() { _schedule = s; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _nextCollectionDay() {
    final weekday = DateTime.now().weekday;
    if (weekday <= 1) return LangService.t('Monday', 'සඳුදා');
    if (weekday <= 4) return LangService.t('Thursday', 'බ්‍රහස්පතින්දා');
    return LangService.t('Monday', 'සඳුදා');
  }

  int _daysUntilNext() {
    final weekday = DateTime.now().weekday;
    if (weekday == 1) return 0;
    if (weekday <= 4) return 4 - weekday;
    return 8 - weekday;
  }

  @override
  Widget build(BuildContext context) {
    final daysLeft = _daysUntilNext();
    final nextDay  = _nextCollectionDay();

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _loadSchedule,
        color: const Color(0xFF4A8C28),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(LangService.t('Collection Schedule', 'එකතු කිරීමේ කාලසටහන'),
                style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: const Color(0xFF1A2E1A))),
            const SizedBox(height: 4),
            Text(LangService.t('Homagama Municipal Area', 'හෝමාගම මහ නගර සභා'),
                style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade500)),
            const SizedBox(height: 20),

            if (_loading)
              const Center(child: CircularProgressIndicator(color: Color(0xFF4A8C28)))
            else ...[
              // Next collection hero card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF2D5A1B), Color(0xFF4A8C28)]),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(children: [
                  Container(
                    width: 56, height: 56,
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle),
                    child: const Icon(Icons.local_shipping_rounded, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(LangService.t('Next Collection', 'ඊළඟ එකතු කිරීම'),
                        style: GoogleFonts.poppins(color: Colors.white.withValues(alpha: 0.8), fontSize: 12)),
                    Text(
                      _schedule['monday_date'] ?? nextDay,
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
                    ),
                    Text(
                      _schedule['monday_time'] ?? '8:00 AM – 10:00 AM',
                      style: GoogleFonts.poppins(color: Colors.white.withValues(alpha: 0.9), fontSize: 11),
                    ),
                  ])),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
                    child: Text(
                      daysLeft == 0 ? LangService.t('Today', 'අද') : LangService.t('In $daysLeft days', 'දින $daysLeft කින්'),
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                    ),
                  ),
                ]),
              ),
              const SizedBox(height: 16),

              // Monday
              _ScheduleCard(
                day: LangService.t('Monday', 'සඳුදා'),
                time: _schedule['monday_time'] ?? '8:00 AM – 10:00 AM',
                date: _schedule['monday_date'] ?? '',
                note: _schedule['monday_note'] ?? '',
                isNext: nextDay == LangService.t('Monday', 'සඳුදා'),
              ),
              const SizedBox(height: 10),

              // Thursday
              _ScheduleCard(
                day: LangService.t('Thursday', 'බ්‍රහස්පතින්දා'),
                time: _schedule['thursday_time'] ?? '8:00 AM – 10:00 AM',
                date: _schedule['thursday_date'] ?? '',
                note: _schedule['thursday_note'] ?? '',
                isNext: nextDay == LangService.t('Thursday', 'බ්‍රහස්පතින්දා'),
              ),
              const SizedBox(height: 20),

              // Instructions card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF4A8C28).withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF4A8C28).withValues(alpha: 0.2)),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.info_outline_rounded, color: Color(0xFF2D5A1B), size: 18),
                    const SizedBox(width: 8),
                    Text(LangService.t('Worker Instructions', 'සේවක උපදෙස්'),
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: const Color(0xFF1A2E1A))),
                  ]),
                  const SizedBox(height: 10),
                  _InstructionItem(LangService.t('Collect CRITICAL bins first', 'CRITICAL කූඩ පළමුව එකතු කරන්න')),
                  _InstructionItem(LangService.t('Wear PPE near high gas bins', 'ඉහළ වායු කූඩ අසල PPE පළඳින්න')),
                  _InstructionItem(LangService.t('Mark each bin collected in Route tab', 'Route tab හි සෑම කූඩයක්ම සලකුණු කරන්න')),
                  _InstructionItem(LangService.t('Report issues to supervisor', 'ගැටළු අධීක්ෂකට දන්වන්න')),
                ]),
              ),
            ],
          ]),
        ),
      ),
    );
  }
}

class _ScheduleCard extends StatelessWidget {
  final String day, time, date, note;
  final bool isNext;
  const _ScheduleCard({required this.day, required this.time, required this.date, required this.note, required this.isNext});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isNext ? const Color(0xFF4A8C28).withValues(alpha: 0.06) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isNext ? const Color(0xFF4A8C28).withValues(alpha: 0.4) : Colors.grey.shade200),
      ),
      child: Row(children: [
        Icon(Icons.calendar_today_rounded, color: isNext ? const Color(0xFF4A8C28) : Colors.grey, size: 20),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(day, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14, color: const Color(0xFF1A2E1A))),
          Text(date.isNotEmpty ? '$date · $time' : time,
              style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade500)),
          if (note.isNotEmpty)
            Text('⚠️ $note', style: GoogleFonts.poppins(fontSize: 11, color: const Color(0xFFEA580C), fontWeight: FontWeight.w600)),
        ])),
        if (isNext)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(color: const Color(0xFF4A8C28), borderRadius: BorderRadius.circular(20)),
            child: Text(LangService.t('Next', 'ඊළඟ'),
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
          ),
      ]),
    );
  }
}

class _InstructionItem extends StatelessWidget {
  final String text;
  const _InstructionItem(this.text);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(children: [
        const Icon(Icons.check_circle_rounded, color: Color(0xFF4A8C28), size: 14),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: GoogleFonts.poppins(fontSize: 11, color: const Color(0xFF2D5A1B)))),
      ]),
    );
  }
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────
class _ProfileTab extends StatelessWidget {
  final String workerName;
  final String workerId;
  final String vehicle;
  final VoidCallback onSignOut;
  const _ProfileTab({
    required this.workerName,
    required this.workerId,
    required this.vehicle,
    required this.onSignOut,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          const SizedBox(height: 20),
          // Avatar
          Container(
            width: 80, height: 80,
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFF2D5A1B), Color(0xFF4A8C28)]),
              shape: BoxShape.circle,
            ),
            child: Center(child: Text(
              workerName.isNotEmpty ? workerName[0].toUpperCase() : 'W',
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800),
            )),
          ),
          const SizedBox(height: 12),
          Text(workerName, style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w800, color: const Color(0xFF1A2E1A))),
          const SizedBox(height: 4),
          Text(workerId, style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey.shade500)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF4A8C28).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.local_shipping_rounded, color: Color(0xFF4A8C28), size: 16),
              const SizedBox(width: 6),
              Text(vehicle, style: GoogleFonts.poppins(color: const Color(0xFF4A8C28), fontSize: 12, fontWeight: FontWeight.w600)),
            ]),
          ),
          const SizedBox(height: 24),
          _ProfileItem(icon: Icons.location_city_rounded, label: LangService.t('Municipal Area', 'මහ නගර ප්‍රදේශය'), value: LangService.t('Homagama', 'හෝමාගම')),
          _ProfileItem(icon: Icons.badge_rounded,         label: LangService.t('Worker ID', 'සේවක හැඳුනුම'),       value: workerId),
          _ProfileItem(icon: Icons.local_shipping_rounded, label: LangService.t('Assigned Vehicle', 'පවරා ඇති වාහනය'), value: vehicle),
          _ProfileItem(icon: Icons.schedule_rounded,      label: LangService.t('Shift', 'වැඩ කාලය'),               value: LangService.t('Monday & Thursday · 8:00 AM', 'සඳුදා සහ බ්‍රහස්පතින්දා · 8:00 AM')),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onSignOut,
              icon: const Icon(Icons.logout_rounded, color: Color(0xFFDC2626), size: 18),
              label: Text(LangService.t('Sign Out', 'ඉවත් වන්න'),
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14, color: const Color(0xFFDC2626))),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFDC2626), width: 1.5),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text('MyCollect v1.0 · ${LangService.t("Collection Worker", "එකතු කිරීමේ සේවකයා")}',
              style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey.shade400)),
        ]),
      ),
    );
  }
}

class _ProfileItem extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _ProfileItem({required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)],
      ),
      child: Row(children: [
        Icon(icon, color: const Color(0xFF4A8C28), size: 20),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey.shade500)),
          Text(value, style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF1A2E1A))),
        ])),
      ]),
    );
  }
}

// ── SHARED WIDGETS ────────────────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String value, label;
  final Color color;
  final IconData icon;
  const _StatCard({required this.value, required this.label, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10)],
        ),
        child: Column(children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(value, style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: color)),
          Text(label, style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey), overflow: TextOverflow.ellipsis),
        ]),
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
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(8)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 11, color: color),
        const SizedBox(width: 3),
        Text(label, style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w600, color: color)),
      ]),
    );
  }
}
