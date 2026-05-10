import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:ui';
import 'role_selection_screen.dart';
import '../services/lang_service.dart';

class LanguageScreen extends StatefulWidget {
  const LanguageScreen({super.key});

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeIn;
  late Animation<Offset> _slideUp;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _fadeIn = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _slideUp = Tween<Offset>(
        begin: const Offset(0, 0.18), end: Offset.zero)
        .animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _selectLanguage(BuildContext context, bool sinhala) async {
    await LangService.setLanguage(sinhala);
    if (!context.mounted) return;
    Navigator.pushReplacement(context,
        MaterialPageRoute(builder: (_) => const RoleSelectionScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background image
          Image.network(
            'https://images.unsplash.com/photo-1593667228250-d0883c59e8db?q=80&w=1035&auto=format&fit=crop',
            fit: BoxFit.cover,
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
                colors: [
                  Color(0x881a3a0f),
                  Color(0x662D5A1B),
                  Color(0x991a3a0f),
                ],
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
          // Content
          SafeArea(
            child: FadeTransition(
              opacity: _fadeIn,
              child: SlideTransition(
                position: _slideUp,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: Column(
                    children: [
                      const Spacer(flex: 2),
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: 'My',
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontSize: 42,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            TextSpan(
                              text: 'Collect',
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF6BA53A),
                                fontSize: 42,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Smart Waste Management',
                        style: GoogleFonts.poppins(
                          color: Colors.white.withValues(alpha: 0.65),
                          fontSize: 13,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const Spacer(flex: 3),
                      // Glassmorphism card
                      ClipRRect(
                        borderRadius: BorderRadius.circular(28),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.fromLTRB(24, 28, 24, 32),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.13),
                              borderRadius: BorderRadius.circular(28),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.25),
                                width: 1.5,
                              ),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  'Choose your language',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'භාෂාව තෝරන්න',
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.55),
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 28),
                                _LangButton(
                                  flag: '🇬🇧',
                                  label: 'Continue in English',
                                  isPrimary: true,
                                  onTap: () => _selectLanguage(context, false),
                                ),
                                const SizedBox(height: 14),
                                _LangButton(
                                  flag: '🇱🇰',
                                  label: 'සිංහලෙන් ඉදිරියට යන්න',
                                  isPrimary: false,
                                  onTap: () => _selectLanguage(context, true),
                                ),
                                const SizedBox(height: 24),
                                Text(
                                  'EMPOWERING SRI LANKA\'S GREEN PULSE',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white.withValues(alpha: 0.4),
                                    fontSize: 9,
                                    letterSpacing: 1.4,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const Spacer(flex: 2),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.15)),
                        ),
                        child: Text(
                          'Homagama Municipal Council · IoT · AI',
                          style: GoogleFonts.poppins(
                            color: Colors.white.withValues(alpha: 0.45),
                            fontSize: 10,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LangButton extends StatelessWidget {
  final String flag;
  final String label;
  final bool isPrimary;
  final VoidCallback onTap;

  const _LangButton({
    required this.flag,
    required this.label,
    required this.isPrimary,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        decoration: BoxDecoration(
          color: isPrimary
              ? Colors.white
              : const Color(0xFF4A8C28).withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isPrimary
                ? Colors.transparent
                : Colors.white.withValues(alpha: 0.3),
            width: 1.5,
          ),
          boxShadow: isPrimary
              ? [BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          )]
              : [],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(flag, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 12),
            Flexible(child: Text(
              label,
              style: isPrimary
                  ? GoogleFonts.poppins(
                color: const Color(0xFF2D5A1B),
                fontSize: 15,
                fontWeight: FontWeight.w700,
              )
                  : GoogleFonts.poppins(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),)
            ),
          ],
        ),
      ),
    );
  }
}