import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:google_fonts/google_fonts.dart';
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
    final result = await AuthService.signUp(
        email, password, name, address, _selectedDistrict);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success'] == true) {
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
            style: const TextStyle(
                fontSize: 24, fontWeight: FontWeight.w700, letterSpacing: 8),
            decoration: InputDecoration(
              counterText: '',
              hintText: '000000',
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide:
                  const BorderSide(color: Color(0xFF6BA53A), width: 2)),
            ),
          ),
        ]),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () async {
                final result = await AuthService.confirmSignUp(
                    email, codeController.text.trim());
                if (!mounted) return;
                if (result['success'] == true) {
                  Navigator.pop(ctx);
                  Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                          builder: (_) =>
                          const LoginScreen(role: 'citizen')));
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                      content: Text('Account verified! Please sign in.'),
                      backgroundColor: Color(0xFF4A8C28)));
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text(result['error'] ?? 'Invalid code'),
                      backgroundColor: Colors.red));
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4A8C28),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
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
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.network(
            'https://images.unsplash.com/photo-1569669568849-39a2939a4b65?q=80&w=1987&auto=format&fit=crop',
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1a3a0f), Color(0xFF2D5A1B)],
                ),
              ),
            ),
          ),
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
          SafeArea(
            child: Column(children: [
              Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back_ios_rounded,
                      color: Colors.white70, size: 18),
                ),
              ),
              Padding(
                padding:
                const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                child: Column(children: [
                  Text('JOIN MYCOLLECT',
                      style: GoogleFonts.poppins(
                          color: Colors.white.withValues(alpha: 0.7),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 1.5)),
                  const SizedBox(height: 6),
                  Text('Create Citizen Account',
                      style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w700)),
                ]),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.3),
                              width: 1.5),
                        ),
                        child: SingleChildScrollView(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _label('FULL NAME'),
                                const SizedBox(height: 6),
                                _glassField(
                                    controller: _nameController,
                                    hint: 'Dinithi Wijesinghe'),
                                const SizedBox(height: 14),
                                _label('EMAIL ADDRESS'),
                                const SizedBox(height: 6),
                                _glassField(
                                    controller: _emailController,
                                    hint: 'you@example.com'),
                                const SizedBox(height: 14),
                                _label('HOME ADDRESS'),
                                const SizedBox(height: 6),
                                _glassField(
                                    controller: _addressController,
                                    hint: 'No. 45, Galle Road, Homagama',
                                    maxLines: 2),
                                const SizedBox(height: 14),
                                _label('DISTRICT'),
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 14),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.1),
                                    border: Border.all(
                                        color: Colors.white.withValues(
                                            alpha: 0.3),
                                        width: 1.5),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: DropdownButtonHideUnderline(
                                    child: DropdownButton<String>(
                                      value: _selectedDistrict,
                                      isExpanded: true,
                                      dropdownColor:
                                      const Color(0xFF2D5A1B),
                                      style: GoogleFonts.poppins(
                                          color: Colors.white, fontSize: 13),
                                      icon: const Icon(
                                          Icons.keyboard_arrow_down_rounded,
                                          color: Colors.white70),
                                      items: _districts
                                          .map((d) => DropdownMenuItem(
                                        value: d,
                                        child: Text(d),
                                      ))
                                          .toList(),
                                      onChanged: (val) => setState(
                                              () => _selectedDistrict = val!),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 14),
                                _label('PASSWORD'),
                                const SizedBox(height: 6),
                                _glassField(
                                  controller: _passwordController,
                                  hint: 'Min. 8 characters',
                                  obscure: _obscurePassword,
                                  suffix: IconButton(
                                    icon: Icon(
                                        _obscurePassword
                                            ? Icons.visibility_off_outlined
                                            : Icons.visibility_outlined,
                                        color: Colors.white70,
                                        size: 20),
                                    onPressed: () => setState(() =>
                                    _obscurePassword = !_obscurePassword),
                                  ),
                                ),
                                const SizedBox(height: 14),
                                _label('CONFIRM PASSWORD'),
                                const SizedBox(height: 6),
                                _glassField(
                                  controller: _confirmPasswordController,
                                  hint: 'Re-enter password',
                                  obscure: _obscureConfirm,
                                  suffix: IconButton(
                                    icon: Icon(
                                        _obscureConfirm
                                            ? Icons.visibility_off_outlined
                                            : Icons.visibility_outlined,
                                        color: Colors.white70,
                                        size: 20),
                                    onPressed: () => setState(() =>
                                    _obscureConfirm = !_obscureConfirm),
                                  ),
                                ),
                                if (_errorMessage != null) ...[
                                  const SizedBox(height: 12),
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 14, vertical: 10),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE8593C)
                                          .withValues(alpha: 0.2),
                                      borderRadius:
                                      BorderRadius.circular(10),
                                      border: Border.all(
                                          color: const Color(0xFFE8593C)
                                              .withValues(alpha: 0.5)),
                                    ),
                                    child: Row(children: [
                                      const Icon(
                                          Icons.error_outline_rounded,
                                          color: Color(0xFFE8593C),
                                          size: 16),
                                      const SizedBox(width: 8),
                                      Expanded(
                                          child: Text(_errorMessage!,
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white,
                                                  fontSize: 12))),
                                    ]),
                                  ),
                                ],
                                const SizedBox(height: 20),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed:
                                    _isLoading ? null : _handleSignUp,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor:
                                      const Color(0xFF4A8C28),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 16),
                                      shape: RoundedRectangleBorder(
                                          borderRadius:
                                          BorderRadius.circular(14)),
                                      elevation: 0,
                                    ),
                                    child: _isLoading
                                        ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2))
                                        : Text('Create Account',
                                        style: GoogleFonts.poppins(
                                            fontSize: 15,
                                            fontWeight:
                                            FontWeight.w600)),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Center(
                                  child: GestureDetector(
                                    onTap: () => Navigator.pop(context),
                                    child: RichText(
                                      text: TextSpan(
                                        style: GoogleFonts.poppins(
                                            color: Colors.white70,
                                            fontSize: 13),
                                        children: [
                                          const TextSpan(
                                              text:
                                              'Already have an account? '),
                                          TextSpan(
                                              text: 'Sign in',
                                              style: GoogleFonts.poppins(
                                                  color: Colors.white,
                                                  fontWeight:
                                                  FontWeight.w600)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ]),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _label(String text) => Text(text,
      style: GoogleFonts.poppins(
          color: Colors.white.withValues(alpha: 0.7),
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.8));

  Widget _glassField({
    required TextEditingController controller,
    required String hint,
    bool obscure = false,
    int maxLines = 1,
    Widget? suffix,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      maxLines: obscure ? 1 : maxLines,
      style: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.poppins(
            color: Colors.white.withValues(alpha: 0.4), fontSize: 13),
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.1),
        suffixIcon: suffix,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide:
            BorderSide(color: Colors.white.withValues(alpha: 0.3))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide:
            BorderSide(color: Colors.white.withValues(alpha: 0.3))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide:
            const BorderSide(color: Colors.white, width: 1.5)),
        contentPadding: const EdgeInsets.symmetric(
            horizontal: 14, vertical: 14),
      ),
    );
  }
}