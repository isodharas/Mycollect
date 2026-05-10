import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:ui';
import '../services/lang_service.dart';
import 'language_screen.dart';
import 'citizen/citizen_auth_screen.dart';
import 'worker/worker_login_screen.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.network(
            'https://images.unsplash.com/photo-1569669568849-39a2939a4b65?q=80&w=1987&auto=format&fit=crop',
            fit: BoxFit.cover,
            alignment: Alignment.centerLeft,
            errorBuilder: (_, __, ___) => Container(color: const Color(0xFF2D5A1B)),
          ),
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0x771a3a0f), Color(0x552D5A1B), Color(0x881a3a0f)],
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                Align(
                  alignment: Alignment.topLeft,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                    onPressed: () => Navigator.pushReplacement(context,
                        MaterialPageRoute(builder: (_) => const LanguageScreen())),
                  ),
                ),
                const Spacer(),
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
                const SizedBox(height: 8),
                Text(
                  LangService.t('Smart Waste Management · Homagama', 'හෝමාගම නාගරික කසළ කළමනාකරණය'),
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    shadows: [
                      Shadow(
                        color: Colors.black.withValues(alpha: 0.6),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Text(
                    LangService.t('I AM A...', 'මම...'),
                    style: GoogleFonts.poppins(
                      color: Colors.white.withValues(alpha: 0.65),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(children: [
                    _RoleCard(
                      icon: Icons.person_rounded,
                      title: LangService.t('Citizen', 'පුරවැසියා'),
                      subtitle: LangService.t('View bin status & collection schedule in your area', 'ඔබේ ප්‍රදේශයේ කසල බඳුන් තත්වය බලන්න'),
                      onTap: () => Navigator.push(context,
                          MaterialPageRoute(builder: (_) => const CitizenAuthScreen())),
                    ),
                    const SizedBox(height: 14),
                    _RoleCard(
                      icon: Icons.local_shipping_rounded,
                      title: LangService.t('Truck Driver', 'රථ රියදුරා'),
                      subtitle: LangService.t('View priority routes and mark bins as collected', 'ප්‍රමුඛතා මාර්ග බලා කසල බඳුන් එකතු කරන්න'),
                      onTap: () => Navigator.push(context,
                          MaterialPageRoute(builder: (_) => const WorkerLoginScreen())),
                    ),
                  ]),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.only(bottom: 32),
                  child: Text(
                    LangService.t('Powered by AI · IoT · AWS', 'AI · IoT · AWS මගින් බලගන්වා ඇත'),
                    style: GoogleFonts.poppins(
                      color: Colors.white.withValues(alpha: 0.4),
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  const _RoleCard({required this.icon, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.13),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withValues(alpha: 0.25), width: 1.5),
            ),
            child: Row(children: [
              Container(
                width: 52, height: 52,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: Colors.white, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(title, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(subtitle, style: GoogleFonts.poppins(color: Colors.white.withValues(alpha: 0.65), fontSize: 11)),
              ])),
              Icon(Icons.chevron_right_rounded, color: Colors.white.withValues(alpha: 0.6)),
            ]),
          ),
        ),
      ),
    );
  }
}