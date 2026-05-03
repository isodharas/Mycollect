import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _addressController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _isLoading = false;
  String? _errorMessage;
  String _selectedDistrict = 'Colombo';

  final List<String> _districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
    'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Ratnapura',
    'Kegalle', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa',
    'Badulla', 'Monaragala', 'Trincomalee', 'Batticaloa', 'Ampara',
    'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu',
  ];

  Future<void> _handleSignUp() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final address = _addressController.text.trim();
    final password = _passwordController.text.trim();
    final confirm = _confirmPasswordController.text.trim();

    if (name.isEmpty || email.isEmpty || address.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please fill in all fields.');
      return;
    }
    if (password != confirm) {
      setState(() => _errorMessage = 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setState(() => _errorMessage = 'Password must be at least 8 characters.');
      return;
    }

    setState(() { _isLoading = true; _errorMessage = null; });
    final result = await AuthService.signUp(email, password, name, address, _selectedDistrict);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success'] == true) {
      // Show verification dialog
      _showVerificationDialog(email);
    } else {
      setState(() => _errorMessage = result['error']);
    }
  }

  void _showVerificationDialog(String email) {
    final codeController = TextEditingController();
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Verify Your Email',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('We sent a 6-digit code to $email',
              style: const TextStyle(color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 16),
          TextField(
            controller: codeController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 6,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, letterSpacing: 8),
            decoration: InputDecoration(
              counterText: '',
              hintText: '000000',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF6BA53A), width: 2)),
            ),
          ),
        ]),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () async {
                final result = await AuthService.confirmSignUp(email, codeController.text.trim());
                if (!mounted) return;
                if (result['success'] == true) {
                  Navigator.pop(ctx);
                  Navigator.pushReplacement(context,
                      MaterialPageRoute(builder: (_) => const LoginScreen(role: 'citizen')));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Account verified! Please sign in.'),
                        backgroundColor: Color(0xFF4A8C28)));
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(result['error'] ?? 'Invalid code'),
                        backgroundColor: Colors.red));
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4A8C28),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Verify Account'),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF2D5A1B), Color(0xFF4A8C28), Color(0xFF6BA53A)],
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(children: [
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white70, size: 16),
                label: const Text('Back', style: TextStyle(color: Colors.white70, fontSize: 13)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
              child: Column(children: [
                Text('JOIN MYCOLLECT',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1.5)),
                const SizedBox(height: 6),
                const Text('Create Citizen Account',
                    style: TextStyle(color: Colors.white, fontSize: 22,
                        fontWeight: FontWeight.w700, letterSpacing: -0.5)),
              ]),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: SingleChildScrollView(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    _label('FULL NAME'),
                    const SizedBox(height: 6),
                    TextField(controller: _nameController,
                        decoration: _inputDeco('Dinithi Wijesinghe')),
                    const SizedBox(height: 14),
                    _label('EMAIL ADDRESS'),
                    const SizedBox(height: 6),
                    TextField(controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: _inputDeco('you@example.com')),
                    const SizedBox(height: 14),
                    _label('HOME ADDRESS'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _addressController,
                      maxLines: 2,
                      decoration: _inputDeco('No. 45, Galle Road, Homagama'),
                    ),
                    const SizedBox(height: 14),
                    _label('DISTRICT'),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF9FAFB),
                        border: Border.all(color: Colors.grey.shade200, width: 1.5),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedDistrict,
                          isExpanded: true,
                          icon: const Icon(Icons.keyboard_arrow_down_rounded,
                              color: Color(0xFF4A8C28)),
                          items: _districts.map((d) => DropdownMenuItem(
                            value: d,
                            child: Text(d, style: const TextStyle(fontSize: 13)),
                          )).toList(),
                          onChanged: (val) => setState(() => _selectedDistrict = val!),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    _label('PASSWORD'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: _inputDeco('Min. 8 characters').copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(_obscurePassword
                              ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              color: Colors.grey, size: 20),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    _label('CONFIRM PASSWORD'),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _confirmPasswordController,
                      obscureText: _obscureConfirm,
                      decoration: _inputDeco('Re-enter password').copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(_obscureConfirm
                              ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              color: Colors.grey, size: 20),
                          onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                        ),
                      ),
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(children: [
                          const Icon(Icons.error_outline_rounded,
                              color: Color(0xFFDC2626), size: 16),
                          const SizedBox(width: 8),
                          Expanded(child: Text(_errorMessage!,
                              style: const TextStyle(color: Color(0xFFDC2626), fontSize: 12))),
                        ]),
                      ),
                    ],
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _handleSignUp,
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
                            : const Text('Create Account',
                                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Center(
                      child: GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: RichText(
                          text: const TextSpan(
                            style: TextStyle(color: Colors.grey, fontSize: 13),
                            children: [
                              TextSpan(text: 'Already have an account? '),
                              TextSpan(text: 'Sign in',
                                  style: TextStyle(color: Color(0xFF4A8C28),
                                      fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ]),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ]),
        ),
      ),
    );
  }

  Widget _label(String text) => Text(text,
      style: const TextStyle(color: Color(0xFF4A8C28), fontSize: 11,
          fontWeight: FontWeight.w600, letterSpacing: 0.8));

  InputDecoration _inputDeco(String hint) => InputDecoration(
    hintText: hint,
    hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
    filled: true,
    fillColor: const Color(0xFFF9FAFB),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF6BA53A), width: 1.5)),
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
  );
}
