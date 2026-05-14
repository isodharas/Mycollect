import 'package:flutter/material.dart';
import '../../services/lang_service.dart';
import 'dart:async';
import 'dart:ui'; // needed for ImageFilter.blur (real glassmorphism)
import 'citizen_map_screen.dart';
import '../role_selection_screen.dart';
import '../../services/session_service.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';


// ─────────────────────────────────────────────
// COLOR PALETTE  (matches Stitch design)
// ─────────────────────────────────────────────
// We keep every colour from your original file,
// but add a few extras for the new glassmorphism look.
const Color _primaryDark   = Color(0xFF1B4332); // deep forest green
const Color _primaryMid    = Color(0xFF2D6A4F); // mid green
const Color _primaryLight  = Color(0xFF52B788); // lighter green
const Color _bgTop         = Color(0xFFD8EDDA); // soft mint top of gradient
const Color _bgBottom      = Color(0xFFE9F5DB); // pale lime bottom of gradient
const Color _darkText      = Color(0xFF1A2E1A); // near-black green tint
const Color _greyText      = Color(0xFF6B7280);
const Color _criticalColor = Color(0xFFB91C1C); // deep red
const Color _highColor     = Color(0xFFEA580C);
const Color _mediumColor   = Color(0xFFD97706);
const Color _lowColor      = Color(0xFF2D6A4F);
const Color _accentOrange  = Color(0xFFFF6B35);

// Glass card colour – semi-transparent white
const Color _glassColor    = Color(0xCCFFFFFF); // 80% white


// ─────────────────────────────────────────────
// ROOT WIDGET  (unchanged structure)
// ─────────────────────────────────────────────
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
      // ── The full-screen soft gradient background ──────────────────────
      // In the Stitch design every screen sits on top of a blurred
      // mint-to-pale-lime gradient.  We paint it here once so ALL tabs
      // share it automatically.
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFB8DDB8), Color(0xFFD8EDDA), Color(0xFFE9F5DB)],
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: IndexedStack(
          index: _selectedIndex,
          children: widget.isRatepayer ? [
            _HomeTab(
              userName: widget.userName,
              isRatepayer: widget.isRatepayer,
              street: widget.street,
              onGoToMap: () => setState(() => _selectedIndex = 1),
            ),
            const CitizenMapScreen(),
            _ScheduleTab(
              isRatepayer: widget.isRatepayer,
              street: widget.street,
              userName: widget.userName,
              phone: widget.phone,
            ),
            _ProfileTab(
              userName: widget.userName,
              phone: widget.phone,
              isRatepayer: widget.isRatepayer,
              registrationNumber: widget.registrationNumber,
              onReportProblem: () => setState(() => _selectedIndex = 2),
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
          ] : [
            _HomeTab(
              userName: widget.userName,
              isRatepayer: widget.isRatepayer,
              street: widget.street,
              onGoToMap: () => setState(() => _selectedIndex = 1),
            ),
            const CitizenMapScreen(),
            _ProfileTab(
              userName: widget.userName,
              phone: widget.phone,
              isRatepayer: widget.isRatepayer,
              registrationNumber: widget.registrationNumber,
              onReportProblem: () => setState(() => _selectedIndex = 2),
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
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ── BOTTOM NAV ────────────────────────────────────────────────────────
  // Stitch style: white pill background, selected tab gets a filled
  // rounded rectangle highlight, icons slightly larger.
  Widget _buildBottomNav() {
    final items = widget.isRatepayer ? [
      {'icon': Icons.grid_view_rounded,       'label': LangService.t('Home',     'නිවස')},
      {'icon': Icons.map_rounded,             'label': LangService.t('Map',      'සිතියම')},
      {'icon': Icons.calendar_month_rounded,  'label': LangService.t('Schedule', 'කාලසටහන')},
      {'icon': Icons.person_rounded,          'label': LangService.t('Profile',  'පැතිකඩ')},
    ] : [
      {'icon': Icons.grid_view_rounded,       'label': LangService.t('Home',     'නිවස')},
      {'icon': Icons.map_rounded,             'label': LangService.t('Map',      'සිතියම')},
      {'icon': Icons.person_rounded,          'label': LangService.t('Profile',  'පැතිකඩ')},
    ];

    return Container(
      // White bar with subtle top shadow – same as Stitch
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, -2),
          ),
        ],
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
                    // Selected tab gets a soft green pill background
                    decoration: BoxDecoration(
                      color: isSelected
                          ? _primaryMid.withValues(alpha: 0.10)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(
                        item['icon'] as IconData,
                        // Selected = dark green, unselected = light grey
                        color: isSelected ? _primaryDark : Colors.grey.shade400,
                        size: 24,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item['label'] as String,
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: isSelected
                              ? FontWeight.w700
                              : FontWeight.w400,
                          color: isSelected ? _primaryDark : Colors.grey.shade400,
                        ),
                      ),
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


// ─────────────────────────────────────────────
// HOME TAB
// ─────────────────────────────────────────────
class _HomeTab extends StatefulWidget {
  final String userName;
  final bool isRatepayer;
  final String street;
  // Callback so "View Route" button can switch to Map tab (index 1)
  final VoidCallback onGoToMap;
  const _HomeTab({
    required this.userName,
    required this.isRatepayer,
    required this.street,
    required this.onGoToMap,
  });
  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  List<dynamic> _bins      = [];
  bool _loading            = true;
  Timer? _timer;
  Timer? _heroTimer;
  int _heroImageIndex      = 0;
  Map<String, dynamic> _schedule = {};

  static const List<String> _heroImages = [
    'https://images.unsplash.com/photo-1610141160723-d2d346e73766?q=80&w=987&auto=format&fit=crop',
  ];

  // Bin location labels
  Map<String, String> get _binLocations => {
    'BIN_001': LangService.t('North Market',         'උතුරු වෙළඳපොළ'),
    'BIN_002': LangService.t('Malapalla Junction',   'මාලාපල්ල හන්දිය'),
    'BIN_003': LangService.t('Pitipana Town',        'පිටිපාන නගරය'),
    'BIN_004': LangService.t('Thalangama Road',      'තලංගම පාර'),
    'BIN_005': LangService.t('Kotikawatta Bus Stop', 'කොටිකාවත්ත බස් නැවතුම'),
  };

  // ── lifecycle (100% unchanged) ─────────────────────────────────────
  @override
  void initState() {
    super.initState();
    _loadBins();
    _loadHomeSchedule();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _loadBins());
    _heroTimer = Timer.periodic(const Duration(seconds: 20), (_) {
      if (mounted) setState(() => _heroImageIndex = (_heroImageIndex + 1) % _heroImages.length);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _heroTimer?.cancel();
    super.dispose();
  }

  void _showReportDialog(BuildContext context) {
    final reportCtrl = TextEditingController();
    String selectedType = 'Overflowing Bin';
    bool submitting = false;
    bool submitted = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(LangService.t('Report an Issue', 'ගැටළුවක් වාර්තා කරන්න'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 18)),
          content: submitted
            ? Column(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.check_circle_rounded, color: _primaryMid, size: 48),
                const SizedBox(height: 12),
                Text(LangService.t('Report submitted!', 'වාර්තාව ඉදිරිපත් කරන ලදී!'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700, color: _primaryMid)),
              ])
            : Column(mainAxisSize: MainAxisSize.min, children: [
                DropdownButtonFormField<String>(
                  value: selectedType,
                  decoration: InputDecoration(labelText: LangService.t('Report Type', 'වාර්තා වර්ගය'), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)), focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _primaryMid, width: 2))),
                  items: [
                    DropdownMenuItem(value: 'Overflowing Bin', child: Text(LangService.t('Overflowing Bin', 'පිරී ඉතිරෙන කූඩ'), style: GoogleFonts.poppins(fontSize: 13))),
                    DropdownMenuItem(value: 'Damaged Bin', child: Text(LangService.t('Damaged Bin', 'හානි වූ කූඩ'), style: GoogleFonts.poppins(fontSize: 13))),
                    DropdownMenuItem(value: 'General Issue', child: Text(LangService.t('General Issue', 'සාමාන්‍ය ගැටළුව'), style: GoogleFonts.poppins(fontSize: 13))),
                  ],
                  onChanged: (v) => setDialogState(() => selectedType = v ?? selectedType),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: reportCtrl,
                  maxLines: 3,
                  decoration: InputDecoration(hintText: LangService.t('Describe the issue...', 'ගැටළුව විස්තර කරන්න...'), hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey.shade400), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)), focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _primaryMid, width: 2))),
                ),
              ]),
          actions: submitted
            ? [ElevatedButton(onPressed: () => Navigator.pop(ctx), style: ElevatedButton.styleFrom(backgroundColor: _primaryMid, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: Text(LangService.t('Close', 'වසන්න'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700)))]
            : [
                TextButton(onPressed: () => Navigator.pop(ctx), child: Text(LangService.t('Cancel', 'අවලංගු'), style: GoogleFonts.poppins(color: _greyText))),
                ElevatedButton(
                  onPressed: submitting ? null : () async {
                    if (reportCtrl.text.trim().isEmpty) return;
                    setDialogState(() => submitting = true);
                    await ApiService.submitReport(phone: '0000000000', name: widget.userName, description: reportCtrl.text.trim(), reportType: selectedType, area: 'Homagama');
                    setDialogState(() { submitting = false; submitted = true; });
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: _accentOrange, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: submitting ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : Text(LangService.t('Submit', 'ඉදිරිපත් කරන්න'), style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
                ),
              ],
        ),
      ),
    );
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

  // ── helpers (unchanged) ────────────────────────────────────────────
  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return LangService.t('Good Morning',   'සුභ උදෑසනක්');
    if (hour < 17) return LangService.t('Good Afternoon', 'සුභ දහවලක්');
    return LangService.t('Good Evening', 'සුභ සන්ධ්‍යාවක්');
  }

  Color _priorityColor(String p) {
    switch (p.toUpperCase()) {
      case 'CRITICAL': return _criticalColor;
      case 'HIGH':     return _highColor;
      case 'MEDIUM':   return _mediumColor;
      default:         return _lowColor;
    }
  }

  int get _criticalCount =>
      _bins.where((b) => (b['priority_label'] ?? '').toUpperCase() == 'CRITICAL').length;

  // ── BUILD ──────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _loadBins,
        color: _primaryMid,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ①  TOP BAR
              _buildTopBar(),

              // ①b HERO GREETING CARD
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    children: [
                      SizedBox(
                        width: double.infinity,
                        height: 200,
                        child: Image.network(
                          _heroImages[_heroImageIndex],
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(color: const Color(0xFF1B4332)),
                        ),
                      ),
                      Container(
                        width: double.infinity,
                        height: 200,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.7),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        left: 20, right: 20, bottom: 20,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _greeting(),
                              style: GoogleFonts.poppins(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              widget.userName,
                              style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: _criticalCount > 0 ? _criticalColor.withValues(alpha: 0.9) : _primaryMid.withValues(alpha: 0.9),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                Icon(_criticalCount > 0 ? Icons.warning_rounded : Icons.check_circle_rounded, color: Colors.white, size: 14),
                                const SizedBox(width: 6),
                                Text(
                                  _criticalCount > 0 ? '$_criticalCount critical bin${_criticalCount == 1 ? '' : 's'} need attention' : 'All bins are safe',
                                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                                ),
                              ]),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // ②  STAT CARDS ROW
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                child: Row(children: [
                  _StatCard(
                    value: _loading ? '-' : '${_bins.length}',
                    label: LangService.t('TOTAL BINS', 'මුළු කූඩ'),
                    icon: Icons.delete_rounded,
                    color: _primaryMid,
                  ),
                  const SizedBox(width: 10),
                  _StatCard(
                    value: _loading ? '-' : '0$_criticalCount',
                    label: LangService.t('CRITICAL', 'අවදානම්'),
                    icon: Icons.priority_high_rounded,
                    color: _criticalColor,
                  ),
                  const SizedBox(width: 10),
                  _StatCard(
                    value: LangService.t('Active', 'සක්‍රිය'),
                    label: LangService.t('SYSTEM STATUS', 'පද්ධති තත්වය'),
                    icon: Icons.check_circle_rounded,
                    color: _primaryMid,
                    isActive: true,
                  ),
                ]),
              ),

              // ③  HERO CARD  (ratepayer only)
              if (widget.isRatepayer)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                child: _HeroCollectionCard(
                  schedule: _schedule,
                  onViewRoute: widget.onGoToMap,
                ),
              ),

              // ④  SECTION HEADER  "Active Bin Monitoring"
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 28, 16, 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      LangService.t('Active Bin Monitoring', 'ක්‍රියාකාරී කූඩ නිරීක්ෂණය'),
                      style: GoogleFonts.poppins(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: _darkText,
                      ),
                    ),
                    GestureDetector(
                      onTap: widget.onGoToMap,
                      child: Text(
                        LangService.t('SEE ALL', 'සියල්ල'),
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: _primaryMid,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // ⑤  HORIZONTAL BIN CARDS
              if (_loading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: CircularProgressIndicator(color: _primaryMid)),
                )
              else if (_bins.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  child: Center(
                    child: Text(
                      LangService.t('No bins found', 'කූඩ හමු නොවීය'),
                      style: GoogleFonts.poppins(color: _greyText),
                    ),
                  ),
                )
              else
                SizedBox(
                  height: 175,
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                    scrollDirection: Axis.horizontal,
                    itemCount: _bins.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, i) => _BinCard(
                      bin: _bins[i],
                      location: _binLocations[_bins[i]['bin_id']] ??
                          LangService.t('Homagama', 'හෝමාගම'),
                      priorityColor: _priorityColor(
                        (_bins[i]['priority_label'] ?? 'LOW').toUpperCase(),
                      ),
                    ),
                  ),
                ),

              // ⑤b  REPORT BUTTON (non-ratepayer only)
              if (!widget.isRatepayer)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: GestureDetector(
                  onTap: () => _showReportDialog(context),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: _glassColor,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 12, offset: const Offset(0, 4))],
                    ),
                    child: Row(children: [
                      Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(color: _accentOrange.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.report_problem_rounded, color: _accentOrange, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(LangService.t('Report a Bin Issue', 'කූඩ ගැටළුවක් වාර්තා කරන්න'), style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: _darkText)),
                        Text(LangService.t('Tap to report overflowing or damaged bins', 'පිරුණු හෝ හානි වූ කූඩ වාර්තා කරන්න'), style: GoogleFonts.poppins(fontSize: 11, color: _greyText)),
                      ])),
                      const Icon(Icons.chevron_right_rounded, color: _greyText),
                    ]),
                  ),
                ),
              ),

              // ⑥  ECO TIPS HERO SECTION
              // Glassmorphism card with rotating health & eco tips.
              // Uses a PageView so the user can swipe between tips —
              // no external packages needed, pure Flutter.
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                child: _EcoTipsCard(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── TOP BAR ────────────────────────────────────────────────────────
  // Matches Stitch: avatar icon on left, user name + citizen ID,
  // bell icon on right.  No big green gradient header anymore.
  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Row(children: [
        // Avatar circle with initial letter
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            // Subtle dark green gradient circle
            gradient: const LinearGradient(
              colors: [_primaryDark, _primaryMid],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
          ),
          child: Center(
            child: Text(
              widget.userName.isNotEmpty
                  ? widget.userName[0].toUpperCase()
                  : 'C',
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 18,
              ),
            ),
          ),
        ),
        const Spacer(),
        // Bell icon – real glassmorphism with BackdropFilter blur
        // GestureDetector makes it tappable → shows a snackbar alert
        GestureDetector(
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  _criticalCount > 0
                      ? LangService.t(
                          '$_criticalCount critical bin(s) need attention!',
                          '$_criticalCount අවදානම් කූඩ(ය) අවධානය අවශ්‍යයි!')
                      : LangService.t(
                          'No critical alerts right now.',
                          'දැනට අවදානම් ඇඟවීම් නොමැත.'),
                  style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600),
                ),
                backgroundColor: _criticalCount > 0 ? _criticalColor : _primaryMid,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                margin: const EdgeInsets.all(16),
                duration: const Duration(seconds: 3),
              ),
            );
          },
          child: ClipOval(
            child: BackdropFilter(
              // BackdropFilter is what creates the real frosted-glass blur effect.
              // sigmaX and sigmaY control how blurry the background behind the button is.
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  // Semi-transparent white over the blurred background = glassmorphism
                  color: Colors.white.withValues(alpha: 0.75),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.5),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: Stack(alignment: Alignment.center, children: [
                  Icon(Icons.notifications_rounded, color: _primaryDark, size: 20),
                  if (!_loading && _criticalCount > 0)
                    Positioned(
                      top: 7, right: 7,
                      child: Container(
                        width: 8, height: 8,
                        decoration: const BoxDecoration(
                          color: _criticalColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ]),
              ),
            ),
          ),
        ),
      ]),
    );
  }
}


// ─────────────────────────────────────────────
// STAT CARD  (one of the three at the top)
// ─────────────────────────────────────────────
// Stitch style: rounded white card, icon on top,
// big bold number, small label underneath.
class _StatCard extends StatelessWidget {
  final String value, label;
  final IconData icon;
  final Color color;
  final bool isActive;
  const _StatCard({
    required this.value,
    required this.label,
    required this.icon,
    required this.color,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
        decoration: BoxDecoration(
          // Glassmorphism: mostly white with slight transparency
          color: Colors.white.withValues(alpha: 0.80),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: _primaryMid.withValues(alpha: 0.10),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Icon at the top
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 8),
            // The big number / word
            Text(
              value,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            // Small label below number
            Text(
              label,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 8.5,
                fontWeight: FontWeight.w600,
                color: _greyText,
                letterSpacing: 0.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}


// ─────────────────────────────────────────────
// HERO COLLECTION CARD
// ─────────────────────────────────────────────
// This is the big white glassmorphism card in the Stitch design that shows
// "UPCOMING TASK" pill → "Next Collection: Tomorrow, 8:00 AM" →
// description text → "View Route →" button → worker illustration.
//
// NOTE on the illustration:
//   The Stitch design uses a custom vector image of a worker.
//   Flutter cannot render an arbitrary vector without an asset file.
//   We use a clean icon-based placeholder that looks great and fits the style.
//   When you add the real image asset later, just replace the
//   _WorkerIllustration widget with:
//     Image.asset('assets/images/worker.png', height: 120)
class _HeroCollectionCard extends StatelessWidget {
  final Map<String, dynamic> schedule;
  // This callback is called when "View Route" is tapped.
  // It comes from _CitizenHomeState and switches the bottom nav to Map tab.
  final VoidCallback onViewRoute;
  const _HeroCollectionCard({
    required this.schedule,
    required this.onViewRoute,
  });

  String get _nextDateLabel {
    // FIX: removed ", 8:00 AM" from every label — no exact time shown
    if (schedule['monday_date'] != null &&
        DateTime.tryParse(schedule['monday_date']) != null) {
      final diff =
          DateTime.parse(schedule['monday_date']).difference(DateTime.now()).inDays;
      if (diff <= 0) return LangService.t('Today', 'අද');
      if (diff == 1) return LangService.t('Tomorrow', 'හෙට');
      return schedule['monday_date']; // just the date, no time
    }
    final weekday = DateTime.now().weekday;
    if (weekday == 1) return LangService.t('Today', 'අද');
    if (weekday <= 4) return LangService.t('Thursday', 'බ්‍රහස්පතින්දා');
    return LangService.t('Monday', 'සඳුදා');
  }

  String get _noteText {
    final note = schedule['monday_note'] ?? '';
    if (note.isNotEmpty) return note;
    return LangService.t(
      'Waste truck 102-B is scheduled for your sector. Please ensure bins are accessible.',
      'ඔබේ කොටස සඳහා කසල ට්‍රක් 102-B නියමිතය.',
    );
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        // Real glassmorphism blur — blurs whatever is behind the card
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            // Semi-transparent white on top of the blurred background
            color: Colors.white.withValues(alpha: 0.80),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.6),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.07),
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // "UPCOMING TASK" pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _primaryLight.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        LangService.t('UPCOMING TASK', 'ඉදිරි කාර්යය'),
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: _primaryMid,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Big headline — no time, just date/day
                    Text(
                      '${LangService.t('Next Collection:', 'ඊළඟ එකතු කිරීම:')}\n$_nextDateLabel',
                      style: GoogleFonts.poppins(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: _darkText,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Note / description
                    Text(
                      _noteText,
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: _greyText,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 18),

                    // "View Route →" button — now actually navigates to Map tab
                    GestureDetector(
                      onTap: onViewRoute, // calls the callback from parent
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 11),
                        decoration: BoxDecoration(
                          color: _primaryDark,
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          Text(
                            LangService.t('View Route', 'මාර්ගය බලන්න'),
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.arrow_forward_rounded,
                              color: Colors.white, size: 16),
                        ]),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 12),
              const _WorkerIllustration(),
            ],
          ),
        ),
      ),
    );
  }
}


// ─────────────────────────────────────────────
// WORKER ILLUSTRATION PLACEHOLDER
// ─────────────────────────────────────────────
// Styled to look like the rounded white box with the worker image
// in the Stitch design.  Replace the icon + container with
// Image.asset(...) when you have the actual asset file.
class _WorkerIllustration extends StatelessWidget {
  const _WorkerIllustration();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 90, height: 120,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Bin icon in a green circle
          Container(
            width: 54, height: 54,
            decoration: BoxDecoration(
              color: _primaryLight.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.local_shipping_rounded,
              color: _primaryMid,
              size: 28,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            LangService.t('Truck\n102-B', 'ට්‍රක්\n102-B'),
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: _primaryDark,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }
}


// ─────────────────────────────────────────────
// BIN CARD  (horizontal scroll cards)
// ─────────────────────────────────────────────
// Stitch style: white glassmorphism card with a coloured left border
// for priority, fill progress bar, gas reading.
class _BinCard extends StatelessWidget {
  final dynamic bin;
  final String location;
  final Color priorityColor;
  const _BinCard({
    required this.bin,
    required this.location,
    required this.priorityColor,
  });

  @override
  Widget build(BuildContext context) {
    final priority = (bin['priority_label'] ?? 'LOW').toUpperCase();
    final fill     = (bin['fill_level'] ?? 0).toDouble();
    final gas      = (bin['gas_ppm']    ?? 0).toDouble();
    final id       = bin['bin_id'] ?? '';

    final priorityLabel = priority == 'CRITICAL'
        ? LangService.t('CRITICAL', 'අවදානම්')
        : priority == 'HIGH'
            ? LangService.t('HIGH', 'ඉහළ')
            : priority == 'MEDIUM'
                ? LangService.t('MEDIUM', 'මධ්‍යම')
                : LangService.t('LOW', 'සාමාන්‍ය');

    return Container(
      width: 185,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _glassColor,                         // glassmorphism white
        borderRadius: BorderRadius.circular(18),
        border: Border(
          left: BorderSide(color: priorityColor, width: 4), // coloured left bar
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // ── Header row: BIN ID + priority badge ──────────────────────
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(
              LangService.t('BIN ID', 'කූඩ ID'),
              style: GoogleFonts.poppins(
                fontSize: 9, color: _greyText, fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
            Text(
              id,
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w900, fontSize: 15, color: _darkText,
              ),
            ),
          ]),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              // Semi-transparent tint of priority colour for the badge
              color: priorityColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: priorityColor.withValues(alpha: 0.5), width: 1,
              ),
            ),
            child: Text(
              priorityLabel,
              style: GoogleFonts.poppins(
                color: priorityColor, fontSize: 9, fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ]),

        const SizedBox(height: 6),
        Text(
          location,
          style: GoogleFonts.poppins(fontSize: 10, color: _greyText),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),

        const Spacer(),

        // ── Fill level row ────────────────────────────────────────────
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(
            LangService.t('FILL LEVEL', 'පිරවුම් මට්ටම'),
            style: GoogleFonts.poppins(
              fontSize: 9, color: _greyText, fontWeight: FontWeight.w600,
              letterSpacing: 0.4,
            ),
          ),
          Text(
            '${fill.toInt()}%',
            style: GoogleFonts.poppins(
              fontSize: 12, fontWeight: FontWeight.w800, color: priorityColor,
            ),
          ),
        ]),
        const SizedBox(height: 5),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: fill / 100,
            backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation<Color>(priorityColor),
            minHeight: 7,
          ),
        ),

        const SizedBox(height: 10),

        // ── Gas PPM row ───────────────────────────────────────────────
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(
            LangService.t('GAS PPM (METHANE)', 'වායු PPM'),
            style: GoogleFonts.poppins(
              fontSize: 9, color: _greyText, fontWeight: FontWeight.w600,
              letterSpacing: 0.4,
            ),
          ),
          Text(
            '${gas.toInt()} PPM',
            style: GoogleFonts.poppins(
              fontSize: 10, fontWeight: FontWeight.w700, color: _greyText,
            ),
          ),
        ]),
        const SizedBox(height: 5),
        // Thin gas progress bar (always grey – just shows relative level)
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: (gas / 1000).clamp(0.0, 1.0),
            backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation<Color>(
              priorityColor.withValues(alpha: 0.6),
            ),
            minHeight: 5,
          ),
        ),
      ]),
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// ECO TIPS CARD
// ─────────────────────────────────────────────────────────────────────────────
// A swipeable glassmorphism card showing health & eco tips.
// Each tip has an icon, a headline, and a short description.
// The dot indicators at the bottom show which tip is active.
// LangService.t() wraps every string so Sinhala toggle works instantly.
class _EcoTipsCard extends StatefulWidget {
  @override
  State<_EcoTipsCard> createState() => _EcoTipsCardState();
}

class _EcoTipsCardState extends State<_EcoTipsCard> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  Timer? _autoTimer;

  // ── tip data ────────────────────────────────────────────────────────
  // Each tip: icon, colour accent, English headline, Sinhala headline,
  //           English body, Sinhala body.
  static const List<_Tip> _tips = [
    _Tip(
      icon: Icons.recycling_rounded,
      color: Color(0xFF2D6A4F),
      titleEn: 'Separate Your Waste',
      titleSi: 'ඔබේ කසල වෙන් කරන්න',
      bodyEn:  'Sort organic, plastic, paper & glass into different bags before disposal.',
      bodySi:  'ඉවත දැමීමට පෙර කාබනික, ප්ලාස්ටික්, කඩදාසි සහ වීදුරු වෙන් කරන්න.',
    ),
    _Tip(
      icon: Icons.thermostat_rounded,
      color: Color(0xFFB91C1C),
      titleEn: 'Avoid Overfilling Bins',
      titleSi: 'කූඩ අධික ලෙස නොපිරවන්න',
      bodyEn:  'Bins above 85% release harmful gases. Use the nearest low-fill bin instead.',
      bodySi:  '85%ට වැඩි කූඩවලින් හානිකර වායූ නිකුත් වේ. ළඟම ඇති අඩු පිරවුම් කූඩ භාවිතා කරන්න.',
    ),
    _Tip(
      icon: Icons.water_drop_rounded,
      color: Color(0xFF0369A1),
      titleEn: 'Drain Liquids First',
      titleSi: 'පළමුව දියර බැස්සන්න',
      bodyEn:  'Empty liquid from containers before binning. Wet waste speeds up harmful gas production.',
      bodySi:  'කූඩයට දැමීමට පෙර බඳුන් වලින් දියර හිස් කරන්න. තෙත් කසල හානිකර වායු නිෂ්පාදනය වේගවත් කරයි.',
    ),
    _Tip(
      icon: Icons.eco_rounded,
      color: Color(0xFF52B788),
      titleEn: 'Compost Organic Waste',
      titleSi: 'කාබනික කසල කොම්පෝස්ට් කරන්න',
      bodyEn:  'Kitchen scraps make great compost. Reduces bin load and cuts methane emissions.',
      bodySi:  'කුස්සිය කසල හොඳ කොම්පෝස්ට් සාදයි. කූඩ භාරය අඩු කර මීතේන් විමෝචනය කපා හරී.',
    ),
    _Tip(
      icon: Icons.masks_rounded,
      color: Color(0xFFD97706),
      titleEn: 'Stay Safe Near Full Bins',
      titleSi: 'පිරුණු කූඩ අසල ආරක්ෂාකාරීව සිටින්න',
      bodyEn:  'High gas PPM causes respiratory issues. Keep children away from CRITICAL bins.',
      bodySi:  'ඉහළ වායු PPM හේතුවෙන් හුස්ම ගැනීමේ ගැටළු ඇතිවේ. CRITICAL කූඩවලින් දරුවන් ඈත් කරන්න.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    // Auto-advance every 4 seconds
    _autoTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted) return;
      final next = (_currentPage + 1) % _tips.length;
      _pageController.animateToPage(
        next,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    _autoTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        // Glassmorphism: white at 85% opacity — matches the rest of the home screen
        color: const Color(0xD9FFFFFF),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Section label row ───────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // "🌿 Eco Tips" header
                Row(children: [
                  Container(
                    width: 30, height: 30,
                    decoration: BoxDecoration(
                      color: _primaryLight.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.eco_rounded,
                        color: _primaryMid, size: 16),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    LangService.t('Eco & Health Tips', 'පරිසර සහ සෞඛ්‍ය උපදෙස්'),
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: _darkText,
                    ),
                  ),
                ]),
                // Dot indicators — one dot per tip
                Row(
                  children: List.generate(_tips.length, (i) {
                    final isActive = i == _currentPage;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.only(left: 4),
                      width:  isActive ? 16 : 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: isActive
                            ? _primaryMid
                            : Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(3),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),

          // ── Swipeable tip pages ─────────────────────────────────────
          SizedBox(
            height: 130,
            child: PageView.builder(
              controller: _pageController,
              itemCount: _tips.length,
              onPageChanged: (i) => setState(() => _currentPage = i),
              itemBuilder: (context, i) {
                final tip = _tips[i];
                return Padding(
                  padding: const EdgeInsets.fromLTRB(18, 12, 18, 16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Coloured icon circle
                      Container(
                        width: 46, height: 46,
                        decoration: BoxDecoration(
                          color: tip.color.withValues(alpha: 0.10),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: tip.color.withValues(alpha: 0.25),
                            width: 1.5,
                          ),
                        ),
                        child: Icon(tip.icon, color: tip.color, size: 22),
                      ),
                      const SizedBox(width: 14),
                      // Text content
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              // Picks Sinhala or English based on toggle
                              LangService.t(tip.titleEn, tip.titleSi),
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: _darkText,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              LangService.t(tip.bodyEn, tip.bodySi),
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                color: _greyText,
                                height: 1.45,
                              ),
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Simple data class to hold one tip's content
// Using const so Flutter can optimise memory — no setState needed for tip data
class _Tip {
  final IconData icon;
  final Color color;
  final String titleEn, titleSi, bodyEn, bodySi;
  const _Tip({
    required this.icon,
    required this.color,
    required this.titleEn,
    required this.titleSi,
    required this.bodyEn,
    required this.bodySi,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  THE TABS BELOW (_ScheduleTab, _ProfileTab, and all helper widgets)
//  ARE COMPLETELY UNCHANGED FROM YOUR ORIGINAL CODE.
//  They are included here so the file compiles as a single self-contained unit.
// ─────────────────────────────────────────────────────────────────────────────

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
  String _selectedReportType = 'Missed Collection';
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
      // Check if schedule changed and notify
      final newDate = s['monday_date']?.toString() ?? '';
      if (newDate.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        final storedDate = prefs.getString('last_schedule_date') ?? '';
        if (storedDate.isNotEmpty && storedDate != newDate) {
          await _showScheduleNotification(newDate, s['monday_note']?.toString() ?? '');
        }
        await prefs.setString('last_schedule_date', newDate);
      }
    } catch (e) {}
  }

  Future<void> _showScheduleNotification(String date, String note) async {
    try {
      final body = note.isNotEmpty
          ? 'Next collection: $date • $note'
          : 'Next collection date updated: $date';
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Row(children: [
            const Icon(Icons.notifications_active_rounded, color: Colors.white, size: 18),
            const SizedBox(width: 10),
            Expanded(child: Text(body, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
          ]),
          backgroundColor: const Color(0xFF2D6A4F),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
        ));
      }
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
              (_schedule['monday_date'] != null && DateTime.tryParse(_schedule['monday_date']) != null) ? (DateTime.parse(_schedule['monday_date']).difference(DateTime.now()).inDays <= 0 ? LangService.t('Today', 'අද') : LangService.t('In ${DateTime.parse(_schedule["monday_date"]).difference(DateTime.now()).inDays} days', 'දින ${DateTime.parse(_schedule["monday_date"]).difference(DateTime.now()).inDays} කින්')) : (daysLeft == 0 ? LangService.t('Today', 'අද') : LangService.t('In $daysLeft days', 'දින $daysLeft කින්')),
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
            ),
          ),
        ]),
      ),
      const SizedBox(height: 16),
      _ScheduleItem(
        day: LangService.t('Monday', 'සඳුදා'),
        time: (_schedule['monday_date'] != null && _schedule['monday_date'].isNotEmpty) ? _schedule['monday_date'] + ' • 8:00 AM' : '8:00 AM - 10:00 AM',
        isNext: nextDay == LangService.t('Monday', 'සඳුදා'),
        note: _schedule['monday_note'] != null && _schedule['monday_note'].isNotEmpty ? (LangService.isSinhala ? 'කල් දමා ඇත' : _schedule['monday_note']) : '',
      ),
      const SizedBox(height: 10),
      _ScheduleItem(
        day: LangService.t('Thursday', 'බ්‍රහස්පතින්දා'),
        time: (_schedule['thursday_date'] != null && _schedule['thursday_date'].isNotEmpty) ? _schedule['thursday_date'] + ' • 8:00 AM' : '8:00 AM - 10:00 AM',
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
          final priorityLabel = priority == 'CRITICAL' ? LangService.t('CRITICAL', 'අවදානම්') : priority == 'HIGH' ? LangService.t('HIGH', 'ඉහළ') : priority == 'MEDIUM' ? LangService.t('MEDIUM', 'මධ්‍යම') : LangService.t('LOW', 'සාමාන්‍ය');
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
  final VoidCallback? onReportProblem;
  const _ProfileTab({required this.userName, required this.phone, required this.isRatepayer, required this.registrationNumber, required this.onSignOut, this.onReportProblem});

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
              onPressed: () { onReportProblem?.call(); },
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

// ── Unchanged helper widgets ───────────────────────────────────────────────

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
