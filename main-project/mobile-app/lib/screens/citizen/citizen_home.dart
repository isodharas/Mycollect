import 'package:flutter/material.dart';
import '../../services/lang_service.dart';
import 'dart:async';
import 'citizen_map_screen.dart';
import '../role_selection_screen.dart';
import '../../services/session_service.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/api_service.dart';

const Color _primaryDark = Color(0xFF2D5A1B);
const Color _primaryMid = Color(0xFF4A8C28);
const Color _primaryLight = Color(0xFF6BA53A);
const Color _bgColor = Color(0xFFF4F6F3);
const Color _darkText = Color(0xFF1A1A2E);
const Color _greyText = Color(0xFF6B7280);
const Color _criticalColor = Color(0xFFDC2626);
const Color _highColor = Color(0xFFEA580C);
const Color _mediumColor = Color(0xFFD97706);
const Color _lowColor = Color(0xFF16A34A);
const Color _accentOrange = Color(0xFFFF6B35);

class CitizenHome extends StatefulWidget {
  final String userName;
  final bool isRatepayer;
  final String street;
  final String phone;
  final String registrationNumber;
  const CitizenHome({
    super.key,
    this.userName = 'Citizen',
    this.isRatepayer = false,
    this.street = '',
    this.phone = '',
    this.registrationNumber = '',
  });
  @override
  State<CitizenHome> createState() => _CitizenHomeState();
}

class _CitizenHomeState extends State<CitizenHome> {
  int _selectedIndex = 0;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgColor,
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          _HomeTab(userName: widget.userName, isRatepayer: widget.isRatepayer, street: widget.street),
          const CitizenMapScreen(),
          _ScheduleTab(isRatepayer: widget.isRatepayer, street: widget.street, userName: widget.userName, phone: widget.phone),
          _ProfileTab(
            userName: widget.userName,
            phone: widget.phone,
            isRatepayer: widget.isRatepayer,
            registrationNumber: widget.registrationNumber,
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
      {'icon': Icons.home_rounded, 'label': LangService.t('Home', 'නිවස')},
      {'icon': Icons.map_rounded, 'label': LangService.t('Map', 'සිතියම')},
      {'icon': Icons.calendar_month_rounded, 'label': LangService.t('Schedule', 'කාලසටහන')},
      {'icon': Icons.person_rounded, 'label': LangService.t('Profile', 'පැතිකඩ')},
    ];
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 20, offset: const Offset(0, -4))],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            children: items.asMap().entries.map((e) {
              final isSelected = _selectedIndex == e.key;
              final item = e.value;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _selectedIndex = e.key),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? _primaryLight.withValues(alpha: 0.12) : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(item['icon'] as IconData, color: isSelected ? _primaryMid : Colors.grey.shade400, size: 22),
                      const SizedBox(height: 4),
                      Text(item['label'] as String, style: GoogleFonts.poppins(
                        fontSize: 9,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w400,
                        color: isSelected ? _primaryMid : Colors.grey.shade400,
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

class _HomeTab extends StatefulWidget {
  final String userName;
  final bool isRatepayer;
  final String street;
  const _HomeTab({required this.userName, required this.isRatepayer, required this.street});
  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  List<dynamic> _bins = [];
  bool _loading = true;
  Timer? _timer;
  Map<String, dynamic> _schedule = {};

  Map<String, String> get _binLocations => {
    'BIN_001': LangService.t('North Market', 'උතුරු වෙළඳපොළ'),
    'BIN_002': LangService.t('Malapalla Junction', 'මාලාපල්ල හන්දිය'),
    'BIN_003': LangService.t('Pitipana Town', 'පිටිපාන නගරය'),
    'BIN_004': LangService.t('Thalangama Road', 'තලංගම පාර'),
    'BIN_005': LangService.t('Kotikawatta Bus Stop', 'කොටිකාවත්ත බස් නැවතුම'),
  };

  @override
  void initState() {
    super.initState();
    _loadBins();
    _loadHomeSchedule();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _loadBins());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadHomeSchedule() async {
    try {
      final s = await ApiService.getSchedule();
      if (mounted) setState(() => _schedule = s);
    } catch (e) {}
  }

  Future<void> _loadBins() async {
    final bins = await ApiService.getAllBins();
    if (mounted) setState(() { _bins = bins; _loading = false; });
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return LangService.t('Good Morning', 'සුභ උදෑසනක්');
    if (hour < 17) return LangService.t('Good Afternoon', 'සුභ දහවලක්');
    return LangService.t('Good Evening', 'සුභ සන්ධ්‍යාවක්');
  }

  Color _priorityColor(String p) {
    switch (p.toUpperCase()) {
      case 'CRITICAL': return _criticalColor;
      case 'HIGH': return _highColor;
      case 'MEDIUM': return _mediumColor;
      default: return _lowColor;
    }
  }

  int get _criticalCount => _bins.where((b) => (b['priority_label'] ?? '').toUpperCase() == 'CRITICAL').length;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _loadBins,
        color: _primaryMid,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [_primaryDark, _primaryMid]),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('${_greeting()},', style: GoogleFonts.poppins(fontSize: 13, color: Colors.white.withValues(alpha: 0.8))),
                    Text(widget.userName, style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
                    const SizedBox(height: 4),
                    Row(children: [
                      const Icon(Icons.location_on_rounded, color: Colors.white70, size: 13),
                      const SizedBox(width: 3),
                      Text(LangService.t('Homagama Municipal Area', 'හෝමාගම මහ නගර සභා'), style: GoogleFonts.poppins(fontSize: 11, color: Colors.white.withValues(alpha: 0.7))),
                    ]),
                  ])),
                  Row(children: [
                    Container(
                      width: 38, height: 38,
                      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), shape: BoxShape.circle),
                      child: const Icon(Icons.notifications_rounded, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      width: 38, height: 38,
                      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle),
                      child: Center(child: Text(
                        widget.userName.isNotEmpty ? widget.userName[0].toUpperCase() : 'C',
                        style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16),
                      )),
                    ),
                  ]),
                ]),
                if (!_loading && _criticalCount > 0) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: _criticalColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _criticalColor.withValues(alpha: 0.4)),
                    ),
                    child: Row(children: [
                      _PulsingDot(),
                      const SizedBox(width: 10),
                      Expanded(child: Text(
                        LangService.t('$_criticalCount Critical Bin${_criticalCount > 1 ? "s" : ""} in Your Area', '$_criticalCount තීරණාත්මක කූඩ ඔබේ ප්‍රදේශයේ'),
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                      )),
                      const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white70, size: 14),
                    ]),
                  ),
                ],
              ]),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  _StatCard(value: _loading ? '-' : '${_bins.length}', label: LangService.t('Total Bins', 'මුළු කසල බඳුන'), icon: Icons.delete_rounded, color: _primaryMid),
                  const SizedBox(width: 10),
                  _StatCard(value: _loading ? '-' : '$_criticalCount', label: LangService.t(LangService.t('Critical', 'අවදානම්'), 'තීරණාත්මක'), icon: Icons.warning_rounded, color: _criticalColor),
                  const SizedBox(width: 10),
                  _StatCard(value: LangService.t('Live', 'සජීවී'), label: LangService.t('System', 'පද්ධතිය'), icon: Icons.wifi_rounded, color: _lowColor, isLive: true),
                ]),
                const SizedBox(height: 24),
                if (widget.isRatepayer)
                  _CollectionCard(street: widget.street, schedule: _schedule)
                else
                  _NearestBinCard(bins: _bins, locations: _binLocations),
                const SizedBox(height: 24),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(LangService.t('Area Bin Status', 'ප්‍රදේශ කසල බඳුන තත්වය'), style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800, color: _darkText)),
                  Text('${_bins.length} ' + LangService.t('bins', 'කසල බඳුන'), style: GoogleFonts.poppins(fontSize: 12, color: _greyText)),
                ]),
                const SizedBox(height: 12),
                if (_loading)
                  const Center(child: CircularProgressIndicator(color: _primaryMid))
                else if (_bins.isEmpty)
                  Center(child: Text(LangService.t('No bins found', 'කසල බඳුන හමු නොවීය'), style: GoogleFonts.poppins(color: _greyText)))
                else
                  SizedBox(
                    height: 160,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _bins.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (context, i) {
                        final bin = _bins[i];
                        final priority = (bin['priority_label'] ?? 'LOW').toUpperCase();
                        final priorityLabel = priority == 'CRITICAL' ? LangService.t('CRITICAL', 'අවදානම්') : priority == 'HIGH' ? LangService.t('HIGH', 'ඉහළ') : priority == 'MEDIUM' ? LangService.t('MEDIUM', 'මධ්‍යම') : LangService.t('LOW', 'අඩු');
                        final color = _priorityColor(priority);
                        final fill = (bin['fill_level'] ?? 0).toDouble();
                        final gas = (bin['gas_ppm'] ?? 0).toDouble();
                        final id = bin['bin_id'] ?? '';
                        return Container(
                          width: 180,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border(left: BorderSide(color: color, width: 4)),
                            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
                          ),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Text(id, style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 13, color: _darkText)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                                child: Text(priorityLabel, style: GoogleFonts.poppins(color: color, fontSize: 8, fontWeight: FontWeight.w800)),
                              ),
                            ]),
                            const SizedBox(height: 4),
                            Text(_binLocations[id] ?? LangService.t('Homagama', 'හෝමාගම'), style: GoogleFonts.poppins(fontSize: 10, color: _greyText)),
                            const Spacer(),
                            Text(LangService.t('Gas: ${gas.toInt()} PPM', 'වායු: ${gas.toInt()} PPM'), style: GoogleFonts.poppins(fontSize: 11, color: _greyText)),
                            const SizedBox(height: 6),
                            Row(children: [
                              Expanded(child: ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: fill / 100,
                                  backgroundColor: Colors.grey.shade100,
                                  valueColor: AlwaysStoppedAnimation<Color>(color),
                                  minHeight: 6,
                                ),
                              )),
                              const SizedBox(width: 8),
                              Text('${fill.toInt()}%', style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
                            ]),
                          ]),
                        );
                      },
                    ),
                  ),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}

class _ScheduleTab extends StatefulWidget {
  final bool isRatepayer;
  final String street;
  final String userName;
  final String phone;
  const _ScheduleTab({required this.isRatepayer, required this.street, required this.userName, this.phone = ''});
  @override
  State<_ScheduleTab> createState() => _ScheduleTabState();
}

class _ScheduleTabState extends State<_ScheduleTab> {
  bool _notifyEnabled = true;
  final _reportController = TextEditingController();
  bool _submitting = false;
  bool _submitted = false;
  List<dynamic> _bins = [];
  bool _loading = true;
  List<dynamic> _myReports = [];
  String _selectedReportType = LangService.t('Missed Collection', 'මඟ හැරුණු එකතු කිරීම');
  Map<String, dynamic> _schedule = {};

  @override
  void initState() {
    super.initState();
    if (!widget.isRatepayer) _loadBins();
    else _loading = false;
    _loadMyReports();
    _loadSchedule();
  }

  Future<void> _loadSchedule() async {
    try {
      final s = await ApiService.getSchedule();
      if (mounted) setState(() => _schedule = s);
    } catch (e) {}
  }

  Future<void> _loadMyReports() async {
    if (widget.phone.isEmpty) return;
    try {
      final allReports = await ApiService.getReports();
      if (mounted) {
        setState(() {
          _myReports = allReports.where((r) => r['phone'] == widget.phone).toList();
        });
      }
    } catch (e) {}
  }

  Future<void> _submitReport() async {
    if (_reportController.text.trim().isEmpty) return;
    setState(() => _submitting = true);
    final result = await ApiService.submitReport(
      phone: widget.phone.isNotEmpty ? widget.phone : '0000000000',
      name: widget.userName,
      description: _reportController.text.trim(),
      reportType: _selectedReportType,
      area: widget.street.isNotEmpty ? widget.street : LangService.t('Homagama', 'හෝමාගම'),
    );
    if (mounted) {
      setState(() => _submitting = false);
      if (result['success'] == true) {
        setState(() { _submitted = true; _reportController.clear(); });
        await _loadMyReports();
      } else {
        setState(() => _submitted = true);
      }
    }
  }

  Future<void> _loadHomeSchedule() async {
    try {
      final s = await ApiService.getSchedule();
      if (mounted) setState(() => _schedule = s);
    } catch (e) {}
  }

  Future<void> _loadBins() async {
    final bins = await ApiService.getAllBins();
    if (mounted) setState(() { _bins = bins; _loading = false; });
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

  Color _priorityColor(String p) {
    switch (p.toUpperCase()) {
      case 'CRITICAL': return _criticalColor;
      case 'HIGH': return _highColor;
      case 'MEDIUM': return _mediumColor;
      default: return _lowColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: widget.isRatepayer ? _buildRatepayerSchedule() : _buildPublicBins(),
      ),
    );
  }

  Widget _buildRatepayerSchedule() {
    final daysLeft = _daysUntilNext();
    final nextDay = _nextCollectionDay();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(LangService.t('Collection Schedule', 'එකතු කිරීමේ කාලසටහන'), style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: _darkText)),
      if (widget.street.isNotEmpty) ...[
        const SizedBox(height: 4),
        Row(children: [
          const Icon(Icons.location_on_rounded, color: _primaryMid, size: 14),
          const SizedBox(width: 4),
          Text(widget.street, style: GoogleFonts.poppins(fontSize: 12, color: _greyText)),
        ]),
      ],
      const SizedBox(height: 20),
      Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [_primaryDark, _primaryMid]),
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
            Text(LangService.t('Next Collection', 'ඊළඟ එකතු කිරීම'), style: GoogleFonts.poppins(color: Colors.white.withValues(alpha: 0.8), fontSize: 12)),
            Text(
              _schedule['monday_date'] ?? nextDay,
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)
            ),
            Text(
              (_schedule['monday_note'] ?? '').isNotEmpty
                ? '⚠️ ${LangService.isSinhala ? 'කල් දමා ඇත' : _schedule['monday_note']}'
                : _schedule['monday_time'] ?? '8:00 AM - 10:00 AM',
              style: GoogleFonts.poppins(color: Colors.white.withValues(alpha: 0.9), fontSize: 11)
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
      _ScheduleItem(
        day: LangService.t('Monday', 'සඳුදා'),
        time: _schedule['monday_date'] ?? '8:00 AM - 10:00 AM',
        isNext: nextDay == LangService.t('Monday', 'සඳුදා'),
        note: _schedule['monday_note'] != null && _schedule['monday_note'].isNotEmpty ? (LangService.isSinhala ? 'කල් දමා ඇත' : _schedule['monday_note']) : '',
      ),
      const SizedBox(height: 10),
      _ScheduleItem(
        day: LangService.t('Thursday', 'බ්‍රහස්පතින්දා'),
        time: _schedule['thursday_date'] ?? '8:00 AM - 10:00 AM',
        isNext: nextDay == LangService.t('Thursday', 'බ්‍රහස්පතින්දා'),
        note: _schedule['thursday_note'] != null && _schedule['thursday_note'].isNotEmpty ? (LangService.isSinhala ? 'කල් දමා ඇත' : _schedule['thursday_note']) : '',
      ),
      const SizedBox(height: 20),
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10)],
        ),
        child: Row(children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: _primaryLight.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.notifications_active_rounded, color: _primaryMid, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(LangService.t('Collection Reminders', 'එකතු කිරීමේ සිහිකැඳවීම්'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14, color: _darkText)),
            Text(LangService.t('Get notified 1 day before collection', 'එකතු කිරීමට දිනක් කලින් දන්වන්න'), style: GoogleFonts.poppins(fontSize: 11, color: _greyText)),
          ])),
          Switch(value: _notifyEnabled, onChanged: (v) => setState(() => _notifyEnabled = v), activeColor: _primaryMid),
        ]),
      ),
      const SizedBox(height: 24),
      Text(LangService.t('Submit a Report', 'වාර්තාවක් ඉදිරිපත් කරන්න'), style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800, color: _darkText)),
      const SizedBox(height: 12),
      if (_myReports.isNotEmpty) ...[
        Text(LangService.t('Your Reports', 'ඔබේ වාර්තා'), style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: _darkText)),
        const SizedBox(height: 8),
        for (var r in _myReports)
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: r['status'] == LangService.t('resolved', 'විසඳා ඇත') ? _lowColor.withValues(alpha: 0.3) : _accentOrange.withValues(alpha: 0.3),
              ),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(r['report_type'] == 'Missed Collection' ? LangService.t('Missed Collection', 'මඟ හැරුණු එකතු කිරීම') :
                r['report_type'] == 'Overflowing Bin' ? LangService.t('Overflowing Bin', 'පිරී ඉතිරෙන කසල බඳුන') :
                r['report_type'] == 'Damaged Bin' ? LangService.t('Damaged Bin', 'හානි වූ කසල බඳුන') :
                r['report_type'] == 'General Issue' ? LangService.t('General Issue', 'සාමාන්‍ය ගැටළුව') :
                r['report_type'] ?? LangService.t('Report', 'වාර්තාව'), style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w700, color: _darkText)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: r['status'] == LangService.t('resolved', 'විසඳා ඇත') ? _lowColor.withValues(alpha: 0.1) : _accentOrange.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(r['status'] ?? LangService.t('pending', 'විභාගාත්මක'), style: GoogleFonts.poppins(
                      fontSize: 10, fontWeight: FontWeight.w700,
                      color: r['status'] == LangService.t('resolved', 'විසඳා ඇත') ? _lowColor : _accentOrange)),
                ),
              ]),
              const SizedBox(height: 4),
              Text(r['description'] ?? '', style: GoogleFonts.poppins(fontSize: 11, color: _greyText)),
            ]),
          ),
        const SizedBox(height: 16),
      ],
      if (_submitted)
        Column(children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _lowColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: _lowColor.withValues(alpha: 0.3)),
            ),
            child: Row(children: [
              Icon(Icons.check_circle_rounded, color: _lowColor),
              const SizedBox(width: 12),
              Expanded(child: Text(LangService.t('Report submitted! Admin will review shortly.', 'වාර්තාව ඉදිරිපත් කරන ලදී!'),
                  style: GoogleFonts.poppins(color: _lowColor, fontWeight: FontWeight.w600, fontSize: 12))),
            ]),
          ),
          const SizedBox(height: 10),
          TextButton(
            onPressed: () => setState(() { _submitted = false; _selectedReportType = 'Missed Collection'; }),
            child: Text(LangService.t('Submit another report', 'තවත් වාර්තාවක් ඉදිරිපත් කරන්න'), style: GoogleFonts.poppins(
                color: _primaryMid, fontWeight: FontWeight.w600, fontSize: 13)),
          ),
        ])
      else ...[
        DropdownButtonFormField<String>(
          value: _selectedReportType,
          decoration: InputDecoration(
            labelText: LangService.t('Report Type', 'වාර්තා වර්ගය'),
            labelStyle: GoogleFonts.poppins(fontSize: 12, color: _greyText),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _primaryLight, width: 2)),
          ),
          items: [
                DropdownMenuItem(value: 'Missed Collection', child: Text(LangService.t('Missed Collection', 'මඟ හැරුණු එකතු කිරීම'), style: GoogleFonts.poppins(fontSize: 13))),
                DropdownMenuItem(value: 'Overflowing Bin', child: Text(LangService.t('Overflowing Bin', 'පිරී ඉතිරෙන කසල බඳුන'), style: GoogleFonts.poppins(fontSize: 13))),
                DropdownMenuItem(value: 'Damaged Bin', child: Text(LangService.t('Damaged Bin', 'හානි වූ කසල බඳුන'), style: GoogleFonts.poppins(fontSize: 13))),
                DropdownMenuItem(value: 'General Issue', child: Text(LangService.t('General Issue', 'සාමාන්‍ය ගැටළුව'), style: GoogleFonts.poppins(fontSize: 13))),
              ],
          onChanged: (v) => setState(() => _selectedReportType = v ?? 'Missed Collection'),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _reportController,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: LangService.t('Describe the issue in detail...', 'ගැටළුව විස්තරාත්මකව විස්තර කරන්න...'),
            hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey.shade400),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _primaryLight, width: 2)),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _submitting ? null : _submitReport,
            icon: _submitting
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Icon(Icons.send_rounded, size: 18),
            label: Text(_submitting ? LangService.t('Submitting...', 'ඉදිරිපත් කරමින්...') : LangService.t('Submit Report', 'වාර්තාව ඉදිරිපත් කරන්න'),
                style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14)),
            style: ElevatedButton.styleFrom(
              backgroundColor: _accentOrange,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
          ),
        ),
      ],
    ]);
  }

    Widget _buildPublicBins() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Public Bin Locations', style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: _darkText)),
      Text('Homagama area - Live data', style: GoogleFonts.poppins(fontSize: 12, color: _greyText)),
      const SizedBox(height: 16),
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _primaryLight.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: _primaryLight.withValues(alpha: 0.3)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.lightbulb_rounded, color: _primaryMid, size: 18),
            const SizedBox(width: 8),
            Text('How to dispose properly', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, color: _primaryDark)),
          ]),
          const SizedBox(height: 8),
          _TipItem('Use bins below 80% fill level'),
          _TipItem('Avoid bins showing CRITICAL status'),
          _TipItem('Segregate organic and plastic waste'),
          _TipItem('Do not dump near bin exteriors'),
        ]),
      ),
      const SizedBox(height: 20),
      if (_loading)
        const Center(child: CircularProgressIndicator(color: _primaryMid))
      else
        ..._bins.map((bin) {
          final priority = (bin['priority_label'] ?? 'LOW').toUpperCase();
                        final priorityLabel = priority == 'CRITICAL' ? LangService.t('CRITICAL', 'අවදානම්') : priority == 'HIGH' ? LangService.t('HIGH', 'ඉහළ') : priority == 'MEDIUM' ? LangService.t('MEDIUM', 'මධ්‍යම') : LangService.t('LOW', 'අඩු');
          final color = _priorityColor(priority);
          final fill = (bin['fill_level'] ?? 0).toDouble();
          final gas = (bin['gas_ppm'] ?? 0).toDouble();
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border(left: BorderSide(color: color, width: 4)),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10)],
              ),
              child: Row(children: [
                Icon(Icons.delete_rounded, color: color, size: 28),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(bin['bin_id'] ?? '', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14, color: _darkText)),
                  Text('Fill: ${fill.toInt()}% - Gas: ${gas.toInt()} PPM', style: GoogleFonts.poppins(fontSize: 11, color: _greyText)),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: fill / 100,
                      backgroundColor: Colors.grey.shade100,
                      valueColor: AlwaysStoppedAnimation<Color>(color),
                      minHeight: 5,
                    ),
                  ),
                ])),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                  child: Text(priorityLabel, style: GoogleFonts.poppins(color: color, fontSize: 9, fontWeight: FontWeight.w800)),
                ),
              ]),
            ),
          );
        }),
    ]);
  }
}

class _ProfileTab extends StatelessWidget {
  final String userName;
  final String phone;
  final bool isRatepayer;
  final String registrationNumber;
  final VoidCallback onSignOut;
  const _ProfileTab({required this.userName, required this.phone, required this.isRatepayer, required this.registrationNumber, required this.onSignOut});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          const SizedBox(height: 20),
          Container(
            width: 80, height: 80,
            decoration: const BoxDecoration(gradient: LinearGradient(colors: [_primaryDark, _primaryLight]), shape: BoxShape.circle),
            child: Center(child: Text(
              userName.isNotEmpty ? userName[0].toUpperCase() : 'C',
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800),
            )),
          ),
          const SizedBox(height: 12),
          Text(userName, style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w800, color: _darkText)),
          if (phone.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(phone, style: GoogleFonts.poppins(fontSize: 13, color: _greyText)),
          ],
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: isRatepayer ? _primaryLight.withValues(alpha: 0.12) : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(isRatepayer ? Icons.verified_rounded : Icons.person_outline_rounded,
                  color: isRatepayer ? _primaryMid : _greyText, size: 16),
              const SizedBox(width: 6),
              Text(isRatepayer ? LangService.t('Verified Ratepayer', 'තහවුරු කළ ගාස්තු ගෙවන්නා') : LangService.t('Public User', 'පොදු පරිශීලකයා'),
                  style: GoogleFonts.poppins(color: isRatepayer ? _primaryMid : _greyText, fontSize: 12, fontWeight: FontWeight.w600)),
            ]),
          ),
          const SizedBox(height: 24),
          _ProfileItem(icon: Icons.location_city_rounded, label: LangService.t('Municipal Area', 'මහ නගර ප්‍රදේශය'), value: LangService.t('Homagama', 'හෝමාගම')),
          if (isRatepayer && registrationNumber.isNotEmpty)
            _ProfileItem(icon: Icons.badge_rounded, label: 'Registration Number', value: registrationNumber),
          _ProfileItem(icon: Icons.shield_rounded, label: LangService.t('Account Type', 'ගිණුම් වර්ගය'), value: isRatepayer ? LangService.t('Registered Ratepayer', 'ලියාපදිංචි ගාස්තු ගෙවන්නා') : LangService.t('Public User', 'පොදු පරිශීලකයා')),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.report_problem_rounded, size: 18),
              label: Text(LangService.t('Report a Problem', 'ගැටළුවක් වාර්තා කරන්න'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14)),
              style: ElevatedButton.styleFrom(
                backgroundColor: _accentOrange,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onSignOut,
              icon: const Icon(Icons.logout_rounded, color: _criticalColor, size: 18),
              label: Text(LangService.t('Sign Out', 'ඉවත් වන්න'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14, color: _criticalColor)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _criticalColor, width: 1.5),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(LangService.t('MyCollect v1.0 - Powered by AWS & AI', 'MyCollect v1.0 - AWS සහ AI මගින්'), style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey.shade400)),
        ]),
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(seconds: 1), vsync: this)..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.4, end: 1.0).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (_, __) => Container(
        width: 10, height: 10,
        decoration: BoxDecoration(color: _criticalColor.withValues(alpha: _animation.value), shape: BoxShape.circle),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value, label;
  final IconData icon;
  final Color color;
  final bool isLive;
  const _StatCard({required this.value, required this.label, required this.icon, required this.color, this.isLive = false});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10)],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Row(children: [
            Text(value, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w900, color: _darkText)),
            if (isLive) ...[
              const SizedBox(width: 4),
              Container(width: 6, height: 6, decoration: const BoxDecoration(color: _lowColor, shape: BoxShape.circle)),
            ],
          ]),
          Text(label, style: GoogleFonts.poppins(fontSize: 9, color: _greyText, fontWeight: FontWeight.w500)),
        ]),
      ),
    );
  }
}

class _CollectionCard extends StatelessWidget {
  final String street;
  final Map<String, dynamic> schedule;
  const _CollectionCard({required this.street, this.schedule = const {}});

  @override
  Widget build(BuildContext context) {
    final weekday = DateTime.now().weekday;
    final nextDay = weekday <= 1 ? 'Monday' : weekday <= 4 ? 'Thursday' : 'Monday';
    final daysLeft = weekday == 1 ? 0 : weekday <= 4 ? 4 - weekday : 8 - weekday;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
      ),
      child: Row(children: [
        Container(
          width: 50, height: 50,
          decoration: BoxDecoration(color: _primaryLight.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
          child: const Icon(Icons.local_shipping_rounded, color: _primaryMid, size: 26),
        ),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(LangService.t('Your Collection', 'ඔබේ එකතු කිරීම'), style: GoogleFonts.poppins(fontSize: 11, color: _greyText, fontWeight: FontWeight.w500)),
          Text(schedule['monday_date'] ?? nextDay, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800, color: _darkText)),
          Text((schedule['monday_note'] ?? '').isNotEmpty ? '⚠ ${LangService.isSinhala ? 'කල් දමා ඇත' : schedule['monday_note']}' : LangService.t('8:00 AM - 10:00 AM', '8:00 AM - 10:00 AM'), style: GoogleFonts.poppins(fontSize: 11, color: (schedule['monday_note'] ?? '').isNotEmpty ? _accentOrange : _greyText)),
        ])),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: _primaryLight.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
          child: Text(
            schedule['monday_date'] != null
              ? (DateTime.tryParse(schedule['monday_date']) != null
                ? (DateTime.parse(schedule['monday_date']).difference(DateTime.now()).inDays == 0
                  ? 'Today'
                  : LangService.t('In ${DateTime.parse(schedule['monday_date']).difference(DateTime.now()).inDays} days', 'දින ${DateTime.parse(schedule['monday_date']).difference(DateTime.now()).inDays} කින්'))
                : 'Upcoming')
              : (daysLeft == 0 ? LangService.t('Today', 'අද') : LangService.t('In $daysLeft days', 'දින $daysLeft කින්')),
            style: GoogleFonts.poppins(color: _primaryMid, fontSize: 11, fontWeight: FontWeight.w700),
          ),
        ),
      ]),
    );
  }
}

class _NearestBinCard extends StatelessWidget {
  final List<dynamic> bins;
  final Map<String, String> locations;
  const _NearestBinCard({required this.bins, required this.locations});

  @override
  Widget build(BuildContext context) {
    if (bins.isEmpty) return const SizedBox();
    final bin = bins.first;
    final priority = (bin['priority_label'] ?? 'LOW').toUpperCase();
                        final priorityLabel = priority == 'CRITICAL' ? LangService.t('CRITICAL', 'අවදානම්') : priority == 'HIGH' ? LangService.t('HIGH', 'ඉහළ') : priority == 'MEDIUM' ? LangService.t('MEDIUM', 'මධ්‍යම') : LangService.t('LOW', 'අඩු');
    final fill = (bin['fill_level'] ?? 0).toDouble();
    final id = bin['bin_id'] ?? '';
    Color color;
    switch (priority) {
      case 'CRITICAL': color = _criticalColor; break;
      case 'HIGH': color = _highColor; break;
      case 'MEDIUM': color = _mediumColor; break;
      default: color = _lowColor;
    }
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
      ),
      child: Row(children: [
        Container(
          width: 50, height: 50,
          decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
          child: Icon(Icons.delete_rounded, color: color, size: 26),
        ),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Nearest Public Bin', style: GoogleFonts.poppins(fontSize: 11, color: _greyText, fontWeight: FontWeight.w500)),
          Text(id, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800, color: _darkText)),
          Text(locations[id] ?? LangService.t('Homagama', 'හෝමාගම'), style: GoogleFonts.poppins(fontSize: 11, color: _greyText)),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
            child: Text(priorityLabel, style: GoogleFonts.poppins(color: color, fontSize: 9, fontWeight: FontWeight.w800)),
          ),
          const SizedBox(height: 4),
          Text('${fill.toInt()}% full', style: GoogleFonts.poppins(fontSize: 11, color: _greyText)),
        ]),
      ]),
    );
  }
}

class _ScheduleItem extends StatelessWidget {
  final String day, time;
  final bool isNext;
  final String note;
  const _ScheduleItem({required this.day, required this.time, required this.isNext, this.note = ''});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isNext ? _primaryLight.withValues(alpha: 0.06) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isNext ? _primaryLight.withValues(alpha: 0.4) : Colors.grey.shade200),
      ),
      child: Row(children: [
        Icon(Icons.calendar_today_rounded, color: isNext ? _primaryMid : _greyText, size: 20),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(day, style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14, color: _darkText)),
          Text(time, style: GoogleFonts.poppins(fontSize: 12, color: _greyText)),
          if (note.isNotEmpty)
            Text('⚠️ $note', style: GoogleFonts.poppins(fontSize: 11, color: _accentOrange, fontWeight: FontWeight.w600)),
        ])),
        if (isNext)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(color: _primaryMid, borderRadius: BorderRadius.circular(20)),
            child: Text(LangService.t('Next', 'ඊළඟ'), style: GoogleFonts.poppins(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
          ),
      ]),
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
        Icon(icon, color: _primaryMid, size: 20),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: GoogleFonts.poppins(fontSize: 10, color: _greyText)),
          Text(value, style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700, color: _darkText)),
        ])),
      ]),
    );
  }
}

class _TipItem extends StatelessWidget {
  final String text;
  const _TipItem(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(children: [
        const Icon(Icons.check_circle_rounded, color: _primaryMid, size: 14),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: GoogleFonts.poppins(fontSize: 11, color: _primaryDark))),
      ]),
    );
  }
}
