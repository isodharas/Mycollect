import 'package:flutter/material.dart';
import '../services/lang_service.dart';
import 'language_screen.dart';
import 'citizen/citizen_auth_screen.dart';
import 'worker/worker_login_screen.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});
  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF2D5A1B), Color(0xFF4A8C28), Color(0xFF6BA53A)],
            stops: [0.0, 0.45, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              SafeArea(
        child: Align(
          alignment: Alignment.topLeft,
          child: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            onPressed: () => Navigator.pushReplacement(context,
                MaterialPageRoute(builder: (_) => const LanguageScreen())),
          ),
        ),
      ),
      const SizedBox(height: 8),
              Container(
                width: 64, height: 64,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Icon(Icons.eco_rounded, color: Colors.white, size: 32),
              ),
              const SizedBox(height: 16),
              const Text('MyCollect',
                  style: TextStyle(color: Colors.white, fontSize: 26,
                      fontWeight: FontWeight.w700, letterSpacing: -0.5)),
              const SizedBox(height: 4),
              Text(LangService.t('Smart Waste Management · Homagama', 'හෝමාගම නාගරික කසළ කළමනාකරණය'),
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
              const Spacer(),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(LangService.t('I AM A...', 'මම...'),
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.65),
                        fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1.5)),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(children: [
                  _RoleCard(
                    icon: Icons.person_rounded,
                    title: LangService.t('Citizen', 'පුරවැසියා'),
                    subtitle: 'View bin status & collection schedule in your area',
                    tag: LangService.t('GPS · Free Access', 'GPS · නොමිලේ'),
                    onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const CitizenAuthScreen())),
                  ),
                  const SizedBox(height: 14),
                  _RoleCard(
                    icon: Icons.local_shipping_rounded,
                    title: LangService.t('Truck Driver', 'රථ රියදුරා'),
                    subtitle: 'View priority routes and mark bins as collected',
                    tag: LangService.t('Worker ID · PIN', 'සේවක හැඳුනුම · PIN'),
                    onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const WorkerLoginScreen())),
                  ),
                ]),
              ),
              const Spacer(),
              Padding(
                padding: const EdgeInsets.only(bottom: 32),
                child: Text(LangService.t('Powered by AI · IoT · AWS', 'AI · IoT · AWS මගින් බලගන්වා ඇත'),
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 11)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String tag;
  final VoidCallback onTap;
  const _RoleCard({required this.icon, required this.title, required this.subtitle,
      required this.tag, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.14),
          border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(children: [
          Container(
            width: 46, height: 46,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.22),
              borderRadius: BorderRadius.circular(13),
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 15,
                  fontWeight: FontWeight.w700)),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(tag, style: TextStyle(color: Colors.white.withValues(alpha: 0.9),
                    fontSize: 9, fontWeight: FontWeight.w600)),
              ),
            ]),
            const SizedBox(height: 4),
            Text(subtitle, style: TextStyle(color: Colors.white.withValues(alpha: 0.65),
                fontSize: 11)),
          ])),
          Icon(Icons.chevron_right_rounded, color: Colors.white.withValues(alpha: 0.6)),
        ]),
      ),
    );
  }
}
