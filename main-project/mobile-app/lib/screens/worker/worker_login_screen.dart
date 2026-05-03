import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:ui';
import '../../services/lang_service.dart';
import 'worker_home.dart';
import '../../services/session_service.dart';

const Map<String, Map<String, String>> _workerAccounts = {
  'WRK-001': {'pin': '1234', 'name': 'Sunil Perera',   'vehicle': 'Truck #1'},
  'WRK-002': {'pin': '5678', 'name': 'Nimal Silva',    'vehicle': 'Truck #2'},
  'WRK-003': {'pin': '9012', 'name': 'Kamal Fernando', 'vehicle': 'Truck #3'},
};

class WorkerLoginScreen extends StatefulWidget {
  const WorkerLoginScreen({super.key});
  @override
  State<WorkerLoginScreen> createState() => _WorkerLoginScreenState();
}

class _WorkerLoginScreenState extends State<WorkerLoginScreen>
    with SingleTickerProviderStateMixin {
  final _idController = TextEditingController();
  String _pin = '';
  bool _isLoading = false;
  String? _error;

  late AnimationController _controller;
  late Animation<double> _fadeIn;
  late Animation<Offset> _slideUp;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _fadeIn  = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _slideUp = Tween<Offset>(begin: const Offset(0, 0.18), end: Offset.zero)
        .animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    _idController.dispose();
    super.dispose();
  }

  void _onPinTap(String digit) {
    if (_pin.length < 4) setState(() => _pin += digit);
  }

  void _onPinDelete() {
    if (_pin.isNotEmpty) setState(() => _pin = _pin.substring(0, _pin.length - 1));
  }

  Future<void> _handleLogin() async {
    final id = _idController.text.trim().toUpperCase();
    if (id.isEmpty || _pin.length < 4) {
      setState(() => _error = LangService.t(
        'Please enter your Worker ID and 4-digit PIN',
        'ඔබේ සේවක හැඳුනුම සහ PIN ඇතුළත් කරන්න',
      ));
      return;
    }
    setState(() { _isLoading = true; _error = null; });
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;

    final account = _workerAccounts[id];
    if (account == null || account['pin'] != _pin) {
      setState(() {
        _isLoading = false;
        _pin = '';
        _error = LangService.t(
          'Invalid Worker ID or PIN. Please try again.',
          'වලංගු නොවන සේවක හැඳුනුම හෝ PIN.',
        );
      });
      return;
    }

    await SessionService.saveWorkerSession(
      workerId: id,
      workerName: account['name']!,
      vehicle: account['vehicle']!,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);
    Navigator.pushReplacement(context,
      MaterialPageRoute(builder: (_) => WorkerHome(
        workerName: account['name']!,
        workerId: id,
        vehicle: account['vehicle']!,
      )),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // ── Same background style as language + role screens ──────
          Image.network(
            'https://images.unsplash.com/photo-1569669568849-39a2939a4b65?q=80&w=1987&auto=format&fit=crop',
            fit: BoxFit.cover,
            alignment: Alignment.centerLeft,
            errorBuilder: (_, __, ___) => Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF1a3a0f), Color(0xFF2D5A1B), Color(0xFF4A8C28)],
                ),
              ),
            ),
          ),
          // Dark overlay
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0x881a3a0f), Color(0x552D5A1B), Color(0x991a3a0f)],
              ),
            ),
          ),
          // Decorative circles
          Positioned(
            top: -60, right: -60,
            child: Container(
              width: 220, height: 220,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF6BA53A).withValues(alpha: 0.15),
              ),
            ),
          ),
          Positioned(
            bottom: 80, left: -80,
            child: Container(
              width: 280, height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF4A8C28).withValues(alpha: 0.12),
              ),
            ),
          ),

          // ── Content ───────────────────────────────────────────────
          SafeArea(
            child: FadeTransition(
              opacity: _fadeIn,
              child: SlideTransition(
                position: _slideUp,
                child: Column(children: [
                  // Back button
                  Align(
                    alignment: Alignment.topLeft,
                    child: TextButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white70, size: 16),
                      label: Text(LangService.t('Back', 'ආපසු'),
                          style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Truck icon + title
                  Container(
                    width: 64, height: 64,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 1.5),
                    ),
                    child: const Icon(Icons.local_shipping_rounded, color: Colors.white, size: 32),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    LangService.t('Worker Sign In', 'සේවක පිවිසීම'),
                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    LangService.t('Enter your Worker ID and PIN', 'ඔබේ සේවක හැඳුනුම සහ PIN ඇතුළත් කරන්න'),
                    style: GoogleFonts.poppins(color: Colors.white.withValues(alpha: 0.7), fontSize: 13),
                  ),
                  const SizedBox(height: 24),

                  // ── Glassmorphism card ────────────────────────────
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(28),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.fromLTRB(24, 20, 24, 20),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.92),
                              borderRadius: BorderRadius.circular(28),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.6),
                                width: 1.5,
                              ),
                            ),
                            child: Column(children: [
                              // Worker ID field
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(LangService.t('WORKER ID', 'සේවක හැඳුනුම'),
                                    style: GoogleFonts.poppins(
                                      color: const Color(0xFF2D5A1B), fontSize: 11,
                                      fontWeight: FontWeight.w700, letterSpacing: 0.8,
                                    )),
                                const SizedBox(height: 6),
                                TextField(
                                  controller: _idController,
                                  textCapitalization: TextCapitalization.characters,
                                  style: GoogleFonts.poppins(fontWeight: FontWeight.w700, letterSpacing: 1),
                                  onChanged: (_) => setState(() {}),
                                  decoration: InputDecoration(
                                    hintText: 'e.g. WRK-001',
                                    hintStyle: GoogleFonts.poppins(
                                        color: Colors.grey.shade400, fontSize: 13,
                                        fontWeight: FontWeight.normal, letterSpacing: 0),
                                    filled: true,
                                    fillColor: const Color(0xFFF9FAFB),
                                    prefixIcon: const Icon(Icons.badge_rounded,
                                        color: Color(0xFF4A8C28), size: 20),
                                    border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
                                    enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
                                    focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(color: Color(0xFF6BA53A), width: 2)),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                                  ),
                                ),
                              ]),
                              const SizedBox(height: 16),

                              // PIN label
                              Text(LangService.t('4-DIGIT PIN', 'අංක 4 PIN'),
                                  style: GoogleFonts.poppins(
                                    color: const Color(0xFF2D5A1B), fontSize: 11,
                                    fontWeight: FontWeight.w700, letterSpacing: 0.8,
                                  )),
                              const SizedBox(height: 10),

                              // PIN dots
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: List.generate(4, (i) {
                                  final filled = i < _pin.length;
                                  return AnimatedContainer(
                                    duration: const Duration(milliseconds: 150),
                                    margin: const EdgeInsets.symmetric(horizontal: 8),
                                    width: 52, height: 52,
                                    decoration: BoxDecoration(
                                      color: filled ? const Color(0xFF2D5A1B) : const Color(0xFFF9FAFB),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: filled ? const Color(0xFF2D5A1B) : Colors.grey.shade200,
                                        width: 1.5,
                                      ),
                                      boxShadow: filled ? [BoxShadow(
                                        color: const Color(0xFF2D5A1B).withValues(alpha: 0.3),
                                        blurRadius: 8, offset: const Offset(0, 3),
                                      )] : [],
                                    ),
                                    child: filled
                                        ? const Icon(Icons.circle, color: Colors.white, size: 14)
                                        : null,
                                  );
                                }),
                              ),
                              const SizedBox(height: 12),

                              // Error
                              if (_error != null) ...[
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFEE2E2),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Row(children: [
                                    const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626), size: 16),
                                    const SizedBox(width: 8),
                                    Expanded(child: Text(_error!,
                                        style: GoogleFonts.poppins(color: const Color(0xFFDC2626), fontSize: 12))),
                                  ]),
                                ),
                                const SizedBox(height: 8),
                              ],

                              // Number pad
                              Expanded(
                                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                                  _PinRow(digits: ['1', '2', '3'], onTap: _onPinTap),
                                  const SizedBox(height: 8),
                                  _PinRow(digits: ['4', '5', '6'], onTap: _onPinTap),
                                  const SizedBox(height: 8),
                                  _PinRow(digits: ['7', '8', '9'], onTap: _onPinTap),
                                  const SizedBox(height: 8),
                                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                    const SizedBox(width: 72),
                                    const SizedBox(width: 10),
                                    _PinButton(label: '0', onTap: () => _onPinTap('0')),
                                    const SizedBox(width: 10),
                                    SizedBox(
                                      width: 72, height: 52,
                                      child: ElevatedButton(
                                        onPressed: _onPinDelete,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFFF1F5F0),
                                          foregroundColor: const Color(0xFF2D5A1B),
                                          elevation: 0,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                        ),
                                        child: const Icon(Icons.backspace_outlined, size: 20),
                                      ),
                                    ),
                                  ]),
                                ]),
                              ),

                              // Sign in button — always visible, green when ready
                              const SizedBox(height: 8),
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: (_isLoading || _pin.length < 4 || _idController.text.trim().isEmpty)
                                      ? null
                                      : _handleLogin,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF2D5A1B),
                                    foregroundColor: Colors.white,
                                    disabledBackgroundColor: Colors.grey.shade200,
                                    disabledForegroundColor: Colors.grey.shade400,
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    elevation: 0,
                                  ),
                                  child: _isLoading
                                      ? const SizedBox(height: 20, width: 20,
                                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                      : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                          const Icon(Icons.login_rounded, size: 18),
                                          const SizedBox(width: 8),
                                          Text(LangService.t('Sign In', 'පිවිසෙන්න'),
                                              style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700)),
                                        ]),
                                ),
                              ),
                            ]),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    LangService.t('Homagama Municipal Council · Workers Only', 'හෝමාගම මහ නගර සභා · සේවකයින් පමණි'),
                    style: GoogleFonts.poppins(color: Colors.white.withValues(alpha: 0.4), fontSize: 10),
                  ),
                  const SizedBox(height: 16),
                ]),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PinRow extends StatelessWidget {
  final List<String> digits;
  final Function(String) onTap;
  const _PinRow({required this.digits, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: digits.map((d) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 5),
        child: _PinButton(label: d, onTap: () => onTap(d)),
      )).toList(),
    );
  }
}

class _PinButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _PinButton({required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 72, height: 52,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFF1F5F0),
          foregroundColor: const Color(0xFF2D5A1B),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        child: Text(label, style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w600)),
      ),
    );
  }
}
