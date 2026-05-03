import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'role_selection_screen.dart';
import '../services/lang_service.dart';

class LanguageScreen extends StatelessWidget {
  const LanguageScreen({super.key});

  void _selectLanguage(BuildContext context, bool sinhala) async {
    await LangService.setLanguage(sinhala);
    if (!context.mounted) return;
    Navigator.pushReplacement(context,
        MaterialPageRoute(builder: (_) => const RoleSelectionScreen()));
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
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80, height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.eco_rounded, color: Colors.white, size: 44),
                ),
                const SizedBox(height: 24),
                Text('MyCollect', style: GoogleFonts.poppins(
                    color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                Text('Smart Waste Management', style: GoogleFonts.poppins(
                    color: Colors.white70, fontSize: 14)),
                const SizedBox(height: 60),
                Text('Choose your language / භාෂාව තෝරන්න',
                    style: GoogleFonts.poppins(color: Colors.white70, fontSize: 13),
                    textAlign: TextAlign.center),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _selectLanguage(context, false),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF2D5A1B),
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      const Text('🇬🇧', style: TextStyle(fontSize: 20)),
                      const SizedBox(width: 12),
                      Text('Continue in English', style: GoogleFonts.poppins(
                          fontSize: 16, fontWeight: FontWeight.w700)),
                    ]),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _selectLanguage(context, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.15),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: const BorderSide(color: Colors.white54, width: 1.5),
                      ),
                      elevation: 0,
                    ),
                    child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      const Text('🇱🇰', style: TextStyle(fontSize: 20)),
                      const SizedBox(width: 12),
                      Text('සිංහලෙන් ඉදිරියට යන්න', style: GoogleFonts.poppins(
                          fontSize: 16, fontWeight: FontWeight.w700)),
                    ]),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
