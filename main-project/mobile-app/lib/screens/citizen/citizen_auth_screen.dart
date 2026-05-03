import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../services/api_service.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:ui';
import 'citizen_home.dart';
import '../../services/session_service.dart';
import '../../services/lang_service.dart';

const List<Map<String, String>> _zones = [
  {'name': 'Homagama Town'},
  {'name': 'Malapalla'},
  {'name': 'Thalangama'},
  {'name': 'Kotikawatta'},
  {'name': 'Sirimawathie Mawatha'},
  {'name': 'Pitipana'},
];

class CitizenAuthScreen extends StatefulWidget {
  const CitizenAuthScreen({super.key});
  @override
  State<CitizenAuthScreen> createState() => _CitizenAuthScreenState();
}

class _CitizenAuthScreenState extends State<CitizenAuthScreen> {
  String _step = 'checking';
  String? _detectedZone;

  final _nameController       = TextEditingController();
  final _phoneController      = TextEditingController();
  final _passwordController   = TextEditingController();
  final _regNumberController  = TextEditingController();
  bool _isRatepayer       = false;
  bool _obscure           = true;
  bool _isLoading         = false;
  bool _isVerifying       = false;
  String? _error;
  String? _verifiedName;
  String? _verifiedAddress;
  bool _ratepayerVerified = false;

  final _signinPhoneController    = TextEditingController();
  final _signinPasswordController = TextEditingController();
  bool _signinObscure = true;

  static const String _baseUrl =
      'https://g7oob1ovd6.execute-api.ap-southeast-2.amazonaws.com/prod';

  // ── lifecycle (unchanged) ──────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    _checkLocation();
  }

  Future<void> _checkLocation() async {
    setState(() => _step = 'checking');
    _detectedZone = 'Homagama Area';
    setState(() => _step = 'in_zone');
  }

  // ── business logic (unchanged) ────────────────────────────────────
  Future<void> _verifyRatepayer() async {
    final regNum = _regNumberController.text.trim().toUpperCase();
    if (regNum.isEmpty) {
      setState(() => _error = LangService.t(
          'Please enter your registration number',
          'කරුණාකර ලියාපදිංචි අංකය ඇතුළු කරන්න'));
      return;
    }
    setState(() { _isVerifying = true; _error = null; _ratepayerVerified = false; });
    try {
      final dio = Dio();
      final response = await dio.get(
        '$_baseUrl/verify-ratepayer',
        queryParameters: {'registration_number': regNum},
      );
      final data = response.data;
      if (data['verified'] == true) {
        setState(() {
          _ratepayerVerified = true;
          _verifiedName    = data['name'];
          _verifiedAddress = data['address'];
          _nameController.text = data['name'] ?? '';
          _error = null;
        });
      } else {
        setState(() {
          _ratepayerVerified = false;
          _error = LangService.t(
            'Registration number not found in municipal records. You can still sign up as a public bin user.',
            'ලියාපදිංචි අංකය මහ නගර සභා වාර්තාවල නොමැත. ඔබට තවමත් පොදු කූඩ පරිශීලකයෙකු ලෙස ලියාපදිංචි විය හැකිය.',
          );
        });
      }
    } catch (e) {
      setState(() => _error = LangService.t(
          'Verification failed. Check your connection.',
          'තහවුරු කිරීම අසාර්ථක විය. ජාල සම්බන්ධතාව පරීක්ෂා කරන්න.'));
    }
    setState(() => _isVerifying = false);
  }

  Future<void> _handleSignup() async {
    if (_nameController.text.trim().isEmpty ||
        _phoneController.text.trim().isEmpty ||
        _passwordController.text.trim().isEmpty) {
      setState(() => _error = LangService.t(
          'Please fill in all fields', 'කරුණාකර සියලු තොරතුරු පුරවන්න'));
      return;
    }
    if (_isRatepayer && !_ratepayerVerified) {
      setState(() => _error = LangService.t(
          'Please verify your registration number first',
          'කරුණාකර මුලින්ම ලියාපදිංචි අංකය තහවුරු කරන්න'));
      return;
    }
    if (_passwordController.text.trim().length < 4) {
      setState(() => _error = LangService.t(
          'Password must be at least 4 characters',
          'මුරපදය අවම වශයෙන් අකුරු 4ක් විය යුතුය'));
      return;
    }
    setState(() { _isLoading = true; _error = null; });
    final result = await ApiService.citizenSignup(
      name:               _nameController.text.trim(),
      phone:              _phoneController.text.trim(),
      password:           _passwordController.text.trim(),
      isRatepayer:        _isRatepayer && _ratepayerVerified,
      registrationNumber: _regNumberController.text.trim().toUpperCase(),
      street:  _verifiedAddress != null ? _verifiedAddress!.split(',').first : '',
      address: _verifiedAddress ?? '',
    );
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (result['success'] == true) {
      final user = result['user'];
      await SessionService.saveCitizenSession(
        userName:           user['name'] ?? '',
        phone:              user['phone'] ?? '',
        isRatepayer:        user['is_ratepayer'] ?? false,
        street:             user['street'] ?? '',
        registrationNumber: user['registration_number'] ?? '',
      );
      if (!mounted) return;
      Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (_) => CitizenHome(
            userName:           user['name'] ?? '',
            isRatepayer:        user['is_ratepayer'] ?? false,
            street:             user['street'] ?? '',
            phone:              user['phone'] ?? '',
            registrationNumber: user['registration_number'] ?? '',
          )));
    } else {
      setState(() => _error = result['message'] ??
          LangService.t('Signup failed', 'ලියාපදිංචිය අසාර්ථක විය'));
    }
  }

  Future<void> _handleSignin() async {
    if (_signinPhoneController.text.trim().isEmpty ||
        _signinPasswordController.text.trim().isEmpty) {
      setState(() => _error = LangService.t(
          'Please enter your phone and password',
          'දුරකථන අංකය සහ මුරපදය ඇතුළු කරන්න'));
      return;
    }
    setState(() { _isLoading = true; _error = null; });
    final result = await ApiService.citizenSignin(
      phone:    _signinPhoneController.text.trim(),
      password: _signinPasswordController.text.trim(),
    );
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (result['success'] == true) {
      final user = result['user'];
      await SessionService.saveCitizenSession(
        userName:           user['name'] ?? '',
        phone:              user['phone'] ?? '',
        isRatepayer:        user['is_ratepayer'] ?? false,
        street:             user['street'] ?? '',
        registrationNumber: user['registration_number'] ?? '',
      );
      if (!mounted) return;
      Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (_) => CitizenHome(
            userName:           user['name'] ?? '',
            isRatepayer:        user['is_ratepayer'] ?? false,
            street:             user['street'] ?? '',
            phone:              user['phone'] ?? '',
            registrationNumber: user['registration_number'] ?? '',
          )));
    } else {
      setState(() => _error = result['message'] ??
          LangService.t('Sign in failed', 'පිවිසීම අසාර්ථක විය'));
    }
  }

  // ── build ──────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background image (unchanged)
          Image.network(
            'https://images.unsplash.com/photo-1569669568849-39a2939a4b65?q=80&w=1987&auto=format&fit=crop',
            fit: BoxFit.cover,
            alignment: Alignment.centerRight,
            errorBuilder: (_, __, ___) => Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                    colors: [Color(0xFF1a3a0f), Color(0xFF2D5A1B)]),
              ),
            ),
          ),
          // Overlay (unchanged)
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  const Color(0xFF1a3a0f).withValues(alpha: 0.75),
                  const Color(0xFF2D5A1B).withValues(alpha: 0.5),
                  const Color(0xFF1a3a0f).withValues(alpha: 0.85),
                ],
              ),
            ),
          ),
          // Content
          SafeArea(
            child: Column(children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                child: Row(children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back_ios_rounded,
                        color: Colors.white70, size: 18),
                  ),
                  Image.asset(
                    'assets/logo.png',
                    height: 32,
                    errorBuilder: (_, __, ___) => Text('MyCollect',
                        style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w700)),
                  ),
                ]),
              ),
              Expanded(child: _buildStep()),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 'checking': return _buildChecking();
      case 'in_zone':  return _buildInZone();
      case 'signup':   return _buildSignup();
      case 'signin':   return _buildSignin();
      default:         return _buildChecking();
    }
  }

  // ── checking screen (unchanged) ───────────────────────────────────
  Widget _buildChecking() {
    return Center(child: Column(
        mainAxisAlignment: MainAxisAlignment.center, children: [
      Container(width: 80, height: 80,
          decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.45),
              shape: BoxShape.circle),
          child: const Icon(Icons.location_searching_rounded,
              color: Colors.white, size: 40)),
      const SizedBox(height: 24),
      Text(LangService.t('Checking your location...', 'ස්ථානය පරීක්ෂා කරමින්...'),
          style: GoogleFonts.poppins(color: Colors.white, fontSize: 18,
              fontWeight: FontWeight.w600)),
      const SizedBox(height: 32),
      const CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
    ]));
  }

  // ── in-zone screen (unchanged) ────────────────────────────────────
  Widget _buildInZone() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 28),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.45),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(
                    color: Colors.white.withValues(alpha: 0.3), width: 1.5),
              ),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Container(
                    width: 72, height: 72,
                    decoration: const BoxDecoration(
                        color: Colors.white, shape: BoxShape.circle),
                    child: const Icon(Icons.location_on_rounded,
                        color: Color(0xFF4A8C28), size: 40)),
                const SizedBox(height: 20),
                Text(LangService.t('You are in the area!', 'ඔබ ප්‍රදේශයේ සිටී!'),
                    style: GoogleFonts.poppins(color: Colors.white,
                        fontSize: 22, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.verified_rounded, color: Colors.white, size: 16),
                    const SizedBox(width: 6),
                    Text(_detectedZone ?? 'Homagama Area',
                        style: GoogleFonts.poppins(color: Colors.white,
                            fontSize: 13, fontWeight: FontWeight.w600)),
                  ]),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => setState(() => _step = 'signup'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF2D5A1B),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: Text(
                        LangService.t('New User · Sign Up',
                            'නව පරිශීලකයා · ලියාපදිංචි වන්න'),
                        style: GoogleFonts.poppins(
                            fontSize: 15, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => setState(() => _step = 'signin'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: BorderSide(color: Colors.white.withValues(alpha: 0.5)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text(
                        LangService.t('Already have account · Sign In',
                            'ගිණුමක් ඇත · පිවිසෙන්න'),
                        style: GoogleFonts.poppins(
                            fontSize: 14, fontWeight: FontWeight.w600)),
                  ),
                ),
              ]),
            ),
          ),
        ),
      ),
    );
  }

  // ── SIGNUP SCREEN ─────────────────────────────────────────────────
  Widget _buildSignup() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(children: [
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerLeft,
          child: Text(LangService.t('Create Account', 'ගිණුමක් සාදන්න'),
              style: GoogleFonts.poppins(color: Colors.white,
                  fontSize: 24, fontWeight: FontWeight.w800)),
        ),
        const SizedBox(height: 2),
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
            // FIX ① – was hardcoded English
            LangService.t(
              'Join the waste revolution in your neighborhood.',
              'ඔබේ අසල්වැසි ප්‍රදේශයේ කසල කළමනාකරණයට එක් වන්න.',
            ),
            style: GoogleFonts.poppins(
                color: Colors.white.withValues(alpha: 0.6), fontSize: 12),
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.45),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                      color: Colors.white.withValues(alpha: 0.3), width: 1.5),
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [

                      // ── Ratepayer toggle ────────────────────────────
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: _isRatepayer
                              ? Colors.white.withValues(alpha: 0.2)
                              : Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.3)),
                        ),
                        child: Row(children: [
                          Expanded(child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                LangService.t('Registered Ratepayer?',
                                    'ලියාපදිංචි ගාස්තු ගෙවන්නෙක්ද?'),
                                style: GoogleFonts.poppins(fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white),
                              ),
                              Text(
                                // FIX ② – was hardcoded English
                                LangService.t(
                                  'I pay Homagama Municipal Council fees',
                                  'මම හෝමාගම මහ නගර සභා ගාස්තු ගෙවමි',
                                ),
                                style: GoogleFonts.poppins(fontSize: 11,
                                    color: Colors.white.withValues(alpha: 0.6)),
                              ),
                            ],
                          )),
                          Switch(
                            value: _isRatepayer,
                            onChanged: (val) => setState(() {
                              _isRatepayer       = val;
                              _ratepayerVerified = false;
                              _regNumberController.clear();
                              _error = null;
                            }),
                            activeColor: const Color(0xFF6BA53A),
                          ),
                        ]),
                      ),

                      if (_isRatepayer) ...[
                        const SizedBox(height: 14),
                        // FIX ③ – label was hardcoded English
                        _glassLabel(LangService.t(
                            'MUNICIPAL REGISTRATION NUMBER',
                            'නාගරික ලියාපදිංචි අංකය')),
                        const SizedBox(height: 6),
                        Row(children: [
                          Expanded(
                            child: _glassField(
                              controller: _regNumberController,
                              // FIX ④ – hint was hardcoded English
                              hint: LangService.t('e.g. HMC-2024-001', 'උදා: HMC-2024-001'),
                              suffix: _ratepayerVerified
                                  ? const Icon(Icons.verified_rounded,
                                      color: Colors.white, size: 20)
                                  : null,
                            ),
                          ),
                          const SizedBox(width: 8),
                          SizedBox(
                            height: 50,
                            child: ElevatedButton(
                              onPressed: _isVerifying ? null : _verifyRatepayer,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF4A8C28),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                elevation: 0,
                              ),
                              child: _isVerifying
                                  ? const SizedBox(width: 18, height: 18,
                                      child: CircularProgressIndicator(
                                          color: Colors.white, strokeWidth: 2))
                                  : Text(LangService.t('Verify', 'තහවුරු'),
                                      style: GoogleFonts.poppins(
                                          fontWeight: FontWeight.w700)),
                            ),
                          ),
                        ]),

                        if (_ratepayerVerified) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF4A8C28).withValues(alpha: 0.3),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(children: [
                              const Icon(Icons.check_circle_rounded,
                                  color: Colors.white, size: 18),
                              const SizedBox(width: 8),
                              Expanded(child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // FIX ⑤ – "Verified: name" was hardcoded English
                                  Text(
                                    '${LangService.t('Verified', 'තහවුරු')}: $_verifiedName',
                                    style: GoogleFonts.poppins(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 12),
                                  ),
                                  Text(_verifiedAddress ?? '',
                                      style: GoogleFonts.poppins(
                                          color: Colors.white70, fontSize: 11)),
                                ],
                              )),
                            ]),
                          ),
                        ],
                      ],

                      const SizedBox(height: 14),
                      // FIX ⑥ – label was hardcoded English
                      _glassLabel(LangService.t('YOUR NAME', 'ඔබේ නම')),
                      const SizedBox(height: 6),
                      _glassField(
                        controller: _nameController,
                        // FIX ⑦ – hint was hardcoded English
                        hint: LangService.t('e.g. Kamal Perera', 'උදා: කමල් පෙරේරා'),
                      ),
                      const SizedBox(height: 14),
                      // FIX ⑧ – label was hardcoded English
                      _glassLabel(LangService.t('MOBILE NUMBER', 'ජංගම දුරකථන අංකය')),
                      const SizedBox(height: 6),
                      _glassField(
                        controller: _phoneController,
                        hint: '77 123 4567',
                        prefix: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 14),
                          child: Text('🇱🇰 +94',
                              style: GoogleFonts.poppins(
                                  fontSize: 13, color: Colors.white70)),
                        ),
                      ),
                      const SizedBox(height: 14),
                      // FIX ⑨ – label was hardcoded English
                      _glassLabel(LangService.t('CREATE PASSWORD', 'මුරපදයක් සාදන්න')),
                      const SizedBox(height: 6),
                      _glassField(
                        controller: _passwordController,
                        // FIX ⑩ – hint was hardcoded English
                        hint: LangService.t(
                            'At least 4 characters', 'අවම වශයෙන් අකුරු 4ක්'),
                        obscure: _obscure,
                        suffix: IconButton(
                          icon: Icon(
                              _obscure
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: Colors.white70,
                              size: 20),
                          onPressed: () =>
                              setState(() => _obscure = !_obscure),
                        ),
                      ),

                      const SizedBox(height: 12),
                      // ── Info box ──────────────────────────────────
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(children: [
                          const Icon(Icons.info_outline_rounded,
                              color: Colors.white70, size: 16),
                          const SizedBox(width: 8),
                          Expanded(child: Text(
                            // FIX ⑪ – both info strings were hardcoded English
                            _isRatepayer && _ratepayerVerified
                                ? LangService.t(
                                    'You will get: Collection schedule + bin map + truck notifications',
                                    'ඔබට ලැබේ: එකතු කිරීමේ කාලසටහන + කූඩ සිතියම + ට්‍රක් දැනුම්දීම්',
                                  )
                                : LangService.t(
                                    'You will get: Public bin locations + fill levels + area alerts',
                                    'ඔබට ලැබේ: පොදු කූඩ ස්ථාන + පිරවුම් මට්ටම් + ප්‍රදේශ ඇඟවීම්',
                                  ),
                            style: GoogleFonts.poppins(
                                fontSize: 11, color: Colors.white70),
                          )),
                        ]),
                      ),

                      if (_error != null) ...[
                        const SizedBox(height: 12),
                        _errorBox(_error!),
                      ],
                      const SizedBox(height: 20),

                      // ── Sign up button ─────────────────────────────
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleSignup,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4A8C28),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                          child: _isLoading
                              ? const SizedBox(height: 20, width: 20,
                                  child: CircularProgressIndicator(
                                      color: Colors.white, strokeWidth: 2))
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                        LangService.t(
                                            'GET STARTED', 'ආරම්භ කරන්න'),
                                        style: GoogleFonts.poppins(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700)),
                                    const SizedBox(width: 8),
                                    const Icon(Icons.arrow_forward_rounded,
                                        size: 18),
                                  ]),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // FIX ⑫ – "Already signed up? Sign in here" was hardcoded
                      Center(
                        child: GestureDetector(
                          onTap: () => setState(() => _step = 'signin'),
                          child: RichText(
                            text: TextSpan(
                              style: GoogleFonts.poppins(
                                  color: Colors.white70, fontSize: 13),
                              children: [
                                TextSpan(
                                    text: LangService.t(
                                        'Already signed up? ', 'දැනටමත් ලියාපදිංචිද? ')),
                                TextSpan(
                                    text: LangService.t(
                                        'Sign in here', 'මෙතනින් පිවිසෙන්න'),
                                    style: GoogleFonts.poppins(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
      ]),
    );
  }

  // ── SIGNIN SCREEN ─────────────────────────────────────────────────
  Widget _buildSignin() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(children: [
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerLeft,
          child: Text(LangService.t('Welcome Back!', 'නැවත සාදරයෙන්!'),
              style: GoogleFonts.poppins(color: Colors.white,
                  fontSize: 24, fontWeight: FontWeight.w800)),
        ),
        const SizedBox(height: 2),
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
              LangService.t('Sign in with your phone number',
                  'දුරකථන අංකයෙන් පිවිසෙන්න'),
              style: GoogleFonts.poppins(
                  color: Colors.white.withValues(alpha: 0.6), fontSize: 12)),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.45),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                      color: Colors.white.withValues(alpha: 0.3), width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // FIX ⑬ – label was hardcoded English
                    _glassLabel(LangService.t('MOBILE NUMBER', 'ජංගම දුරකථන අංකය')),
                    const SizedBox(height: 6),
                    _glassField(
                      controller: _signinPhoneController,
                      hint: '77 123 4567',
                      prefix: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 14),
                        child: Text('🇱🇰 +94',
                            style: GoogleFonts.poppins(
                                fontSize: 13, color: Colors.white70)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // FIX ⑭ – label was hardcoded English
                    _glassLabel(LangService.t('PASSWORD', 'මුරපදය')),
                    const SizedBox(height: 6),
                    _glassField(
                      controller: _signinPasswordController,
                      // FIX ⑮ – hint was hardcoded English
                      hint: LangService.t('Your password', 'ඔබේ මුරපදය'),
                      obscure: _signinObscure,
                      suffix: IconButton(
                        icon: Icon(
                            _signinObscure
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: Colors.white70,
                            size: 20),
                        onPressed: () =>
                            setState(() => _signinObscure = !_signinObscure),
                      ),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      _errorBox(_error!),
                    ],
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _handleSignin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF4A8C28),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        child: _isLoading
                            ? const SizedBox(height: 20, width: 20,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2))
                            : Text(LangService.t('Sign In', 'පිවිසෙන්න'),
                                style: GoogleFonts.poppins(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700)),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // FIX ⑯ – "New user? Sign up here" was hardcoded English
                    Center(
                      child: GestureDetector(
                        onTap: () => setState(() => _step = 'signup'),
                        child: RichText(
                          text: TextSpan(
                            style: GoogleFonts.poppins(
                                color: Colors.white70, fontSize: 13),
                            children: [
                              TextSpan(
                                  text: LangService.t(
                                      'New user? ', 'නව පරිශීලකයෙක්ද? ')),
                              TextSpan(
                                  text: LangService.t(
                                      'Sign up here', 'මෙතනින් ලියාපදිංචි වන්න'),
                                  style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
      ]),
    );
  }

  // ── helper widgets (unchanged) ────────────────────────────────────
  // _glassLabel now accepts the already-translated string from the caller
  Widget _glassLabel(String text) => Text(
        text,
        style: GoogleFonts.poppins(
            color: Colors.white.withValues(alpha: 0.7),
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.8),
      );

  Widget _glassField({
    required TextEditingController controller,
    required String hint,
    bool obscure = false,
    Widget? prefix,
    Widget? suffix,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.poppins(
            color: Colors.white.withValues(alpha: 0.4), fontSize: 13),
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.1),
        prefixIcon: prefix,
        suffixIcon: suffix,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.3))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.3))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Colors.white, width: 1.5)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }

  Widget _errorBox(String msg) => Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
            color: const Color(0xFFE8593C).withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
                color: const Color(0xFFE8593C).withValues(alpha: 0.5))),
        child: Row(children: [
          const Icon(Icons.error_outline_rounded,
              color: Color(0xFFE8593C), size: 16),
          const SizedBox(width: 8),
          Expanded(
              child: Text(msg,
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 12))),
        ]),
      );
}
