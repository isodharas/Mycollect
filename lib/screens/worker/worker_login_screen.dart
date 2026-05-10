import 'package:flutter/material.dart';
import '../../services/lang_service.dart';
import 'worker_home.dart';

const Map<String, Map<String, String>> _workerAccounts = {
  'WRK-001': {'pin': '1234', 'name': 'Sunil Perera', 'vehicle': 'Truck #1'},
  'WRK-002': {'pin': '5678', 'name': 'Nimal Silva', 'vehicle': 'Truck #2'},
  'WRK-003': {'pin': '9012', 'name': 'Kamal Fernando', 'vehicle': 'Truck #3'},
};

class WorkerLoginScreen extends StatefulWidget {
  const WorkerLoginScreen({super.key});
  @override
  State<WorkerLoginScreen> createState() => _WorkerLoginScreenState();
}

class _WorkerLoginScreenState extends State<WorkerLoginScreen> {
  final _idController = TextEditingController();
  String _pin = '';
  bool _isLoading = false;
  String? _error;

  void _onPinTap(String digit) {
    if (_pin.length < 4) setState(() => _pin += digit);
  }

  void _onPinDelete() {
    if (_pin.isNotEmpty) setState(() => _pin = _pin.substring(0, _pin.length - 1));
  }

  Future<void> _handleLogin() async {
    final id = _idController.text.trim().toUpperCase();
    if (id.isEmpty || _pin.length < 4) {
      setState(() => _error = 'Please enter your Worker ID and 4-digit PIN');
      return;
    }
    setState(() { _isLoading = true; _error = null; });
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    final account = _workerAccounts[id];
    if (account == null || account['pin'] != _pin) {
      setState(() { _isLoading = false; _pin = ''; _error = 'Invalid Worker ID or PIN.'; });
      return;
    }
    setState(() => _isLoading = false);
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const WorkerHome()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(children: [
        // Background image
        Positioned.fill(
          child: Image.network(
            'https://images.unsplash.com/photo-1776777484084-531576dace95?q=80&w=1600&auto=format&fit=crop',
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(color: const Color(0xFF1B4332)),
          ),
        ),
        // Dark overlay
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.6),
                  Colors.black.withValues(alpha: 0.75),
                ],
              ),
            ),
          ),
        ),
        // Content
        SafeArea(
          child: Column(children: [
            // Back button
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white70, size: 16),
                label: Text(LangService.t('Back', 'ආපසු'), style: const TextStyle(color: Colors.white70, fontSize: 13)),
              ),
            ),
            const SizedBox(height: 8),
            // Logo
            Container(
              width: 60, height: 60,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 1.5),
              ),
              child: const Icon(Icons.local_shipping_rounded, color: Colors.white, size: 30),
            ),
            const SizedBox(height: 10),
            Text(LangService.t('Worker Sign In', 'සේවක පිවිසීම'),
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text(LangService.t('Enter your Worker ID and PIN', 'ඔබේ සේවක හැඳුනුම සහ PIN ඇතුළත් කරන්න'),
                style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
            const SizedBox(height: 16),
            // White card
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 20, offset: const Offset(0, 8))],
                  ),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    // Worker ID
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(LangService.t('WORKER ID', 'සේවක හැඳුනුම'),
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _idController,
                      textCapitalization: TextCapitalization.characters,
                      style: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1),
                      decoration: InputDecoration(
                        hintText: 'e.g. WRK-001',
                        hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13, fontWeight: FontWeight.normal, letterSpacing: 0),
                        filled: true, fillColor: const Color(0xFFF9FAFB),
                        prefixIcon: const Icon(Icons.badge_rounded, color: Color(0xFF4A8C28), size: 20),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF6BA53A), width: 1.5)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // PIN label
                    Text(LangService.t('4-DIGIT PIN', 'අංක 4 PIN'),
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
                    const SizedBox(height: 10),
                    // PIN dots
                    Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(4, (i) {
                      final filled = i < _pin.length;
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        width: 48, height: 48,
                        decoration: BoxDecoration(
                          color: filled ? const Color(0xFF4A8C28) : const Color(0xFFF9FAFB),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: filled ? const Color(0xFF4A8C28) : Colors.grey.shade200, width: 1.5),
                        ),
                        child: filled ? const Icon(Icons.circle, color: Colors.white, size: 12) : null,
                      );
                    })),
                    if (_error != null) ...[
                      const SizedBox(height: 10),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(10)),
                        child: Row(children: [
                          const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626), size: 16),
                          const SizedBox(width: 8),
                          Expanded(child: Text(_error!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 12))),
                        ]),
                      ),
                    ],
                    const SizedBox(height: 14),
                    // Number pad
                    _PinRow(digits: ['1','2','3'], onTap: _onPinTap),
                    const SizedBox(height: 8),
                    _PinRow(digits: ['4','5','6'], onTap: _onPinTap),
                    const SizedBox(height: 8),
                    _PinRow(digits: ['7','8','9'], onTap: _onPinTap),
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
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF1F5F0), foregroundColor: const Color(0xFF2D5A1B), elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                          child: const Icon(Icons.backspace_outlined, size: 20),
                        ),
                      ),
                    ]),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: (_isLoading || _pin.length < 4) ? null : _handleLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF4A8C28), foregroundColor: Colors.white,
                          disabledBackgroundColor: Colors.grey.shade200,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        child: _isLoading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : Text(LangService.t('Sign In', 'පිවිසෙන්න'), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ]),
                ),
              ),
            ),
          ]),
        ),
      ]),
    );
  }
}

class _PinRow extends StatelessWidget {
  final List<String> digits;
  final Function(String) onTap;
  const _PinRow({required this.digits, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return Row(mainAxisAlignment: MainAxisAlignment.center, children: digits.map((d) =>
      Padding(padding: const EdgeInsets.symmetric(horizontal: 5), child: _PinButton(label: d, onTap: () => onTap(d)))
    ).toList());
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
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF1F5F0), foregroundColor: const Color(0xFF2D5A1B), elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
        child: Text(label, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
      ),
    );
  }
}
