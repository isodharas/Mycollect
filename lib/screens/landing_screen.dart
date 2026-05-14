import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_screen.dart';
import 'signup_screen.dart';

const Color _skyBlue = Color(0xFF38BDF8);
const Color _mintGreen = Color(0xFF4ADE80);
const Color _darkText = Color(0xFF0F172A);

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEFF8FF),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              // ── Hero Section ──
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 40, 24, 40),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(32),
                    bottomRight: Radius.circular(32),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Logo row
                    Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                                colors: [_skyBlue, _mintGreen]),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.recycling_rounded,
                              color: Colors.white, size: 24),
                        ),
                        const SizedBox(width: 10),
                        RichText(
                          text: TextSpan(children: [
                            TextSpan(
                                text: 'My',
                                style: GoogleFonts.poppins(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white)),
                            TextSpan(
                                text: 'Collect',
                                style: GoogleFonts.poppins(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: _skyBlue)),
                          ]),
                        ),
                      ],
                    ),
                    const SizedBox(height: 40),

                    // Hero text
                    Text('Keep Your City\nClean,',
                        style: GoogleFonts.poppins(
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            height: 1.2)),
                    Text('Effortlessly.',
                        style: GoogleFonts.poppins(
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: _skyBlue,
                            height: 1.2)),
                    const SizedBox(height: 16),
                    Text(
                        'Smart waste management for modern\nSri Lankan communities. Join the\nmovement to digitalize civic duty.',
                        style: GoogleFonts.poppins(
                            fontSize: 14,
                            color: Colors.white60,
                            height: 1.6)),
                    const SizedBox(height: 32),

                    // CTA buttons
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                              colors: [_skyBlue, _mintGreen]),
                          borderRadius: BorderRadius.circular(50),
                          boxShadow: [
                            BoxShadow(
                              color: _skyBlue.withValues(alpha: 0.4),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: () => Navigator.push(context,
                              MaterialPageRoute(
                                  builder: (_) => const SignupScreen())),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(50)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('Get Started',
                                  style: GoogleFonts.poppins(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white)),
                              const SizedBox(width: 8),
                              const Icon(Icons.arrow_forward_rounded,
                                  color: Colors.white, size: 18),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: OutlinedButton(
                        onPressed: () => Navigator.push(context,
                            MaterialPageRoute(
                                builder: (_) => const LoginScreen(role: 'citizen'))),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(
                              color: Colors.white.withValues(alpha: 0.3),
                              width: 1.5),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(50)),
                        ),
                        child: Text('Login',
                            style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Colors.white)),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Stats row
                    Row(
                      children: [
                        _heroStat('15+', 'Municipal\nCouncils'),
                        Container(
                            width: 1,
                            height: 40,
                            color: Colors.white24),
                        _heroStat('98%', 'Collection\nAccuracy'),
                        Container(
                            width: 1,
                            height: 40,
                            color: Colors.white24),
                        _heroStat('50k', 'Active\nCitizens'),
                      ],
                    ),
                  ],
                ),
              ),

              // ── Features Section ──
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Revolutionizing\nCivic Cleanliness',
                        style: GoogleFonts.poppins(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: _darkText)),
                    const SizedBox(height: 8),
                    Text('Technology meets tradition to keep our\nidentity productive pristine.',
                        style: GoogleFonts.poppins(
                            fontSize: 13, color: Colors.grey.shade500)),
                    const SizedBox(height: 24),

                    _featureCard(
                      icon: Icons.route_rounded,
                      color: _skyBlue,
                      title: 'Smart Route Optimization',
                      desc: 'Dynamic AI-driven prioritized collection routes by knowledge-first consolidation and carbon footprint across your district.',
                    ),
                    const SizedBox(height: 12),
                    _featureCard(
                      icon: Icons.notifications_active_rounded,
                      color: Colors.orange,
                      title: 'Smart Bin Alerts',
                      desc: 'Real-time IoT bin status and early warning helps citizens and early warning teams towards bin overflow happenings.',
                    ),
                    const SizedBox(height: 12),
                    _featureCard(
                      icon: Icons.emoji_events_rounded,
                      color: _mintGreen,
                      title: 'Citizen Rewards',
                      desc: 'Earn points for proper disposal and recycling that translates to local dining incentives.',
                    ),
                    const SizedBox(height: 12),
                    _featureCard(
                      icon: Icons.dashboard_rounded,
                      color: Colors.purple,
                      title: 'Community Dashboard',
                      desc: 'Transparent data for every citizen and municipality. See how your area trends in cleanliness and sustainability.',
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),

              // ── User Types Section ──
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                color: Colors.white,
                child: Column(
                  children: [
                    Text('Who is it for?',
                        style: GoogleFonts.poppins(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: _darkText)),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: _userTypeCard(
                            icon: Icons.person_rounded,
                            color: _skyBlue,
                            title: 'Citizens',
                            features: [
                              'Track bin status',
                              'Get notifications',
                              'Report issues',
                              'View schedule',
                            ],
                            onTap: () => Navigator.push(context,
                                MaterialPageRoute(
                                    builder: (_) => const SignupScreen())),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _userTypeCard(
                            icon: Icons.engineering_rounded,
                            color: _mintGreen,
                            title: 'Workers',
                            features: [
                              'Optimized routes',
                              'Update bin status',
                              'Mark collected',
                              'Real-time alerts',
                            ],
                            onTap: () => Navigator.push(context,
                                MaterialPageRoute(
                                    builder: (_) => const LoginScreen(role: 'citizen'))),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // ── CTA Bottom ──
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF0F2027), Color(0xFF2C5364)],
                  ),
                ),
                child: Column(
                  children: [
                    Text('Ready to transform your\nneighborhood?',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: Colors.white)),
                    const SizedBox(height: 8),
                    Text('Download the MyCollect app today.\nA greener future for Sri Lanka.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                            fontSize: 13, color: Colors.white60)),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: _storeButton(
                            icon: Icons.apple_rounded,
                            store: 'App Store',
                            label: 'DOWNLOAD ON THE',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _storeButton(
                            icon: Icons.android_rounded,
                            store: 'Play Store',
                            label: 'GET IT ON',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Text('MyCollect',
                        style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white60)),
                    Text('Digitalizing waste management for a\ncleaner, smarter Sri Lanka. Proudly\nserving communities since 2025.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                            fontSize: 11, color: Colors.white38)),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Privacy Policy',
                            style: GoogleFonts.poppins(
                                fontSize: 11, color: Colors.white38)),
                        const SizedBox(width: 16),
                        Text('Terms of Service',
                            style: GoogleFonts.poppins(
                                fontSize: 11, color: Colors.white38)),
                        const SizedBox(width: 16),
                        Text('Contact',
                            style: GoogleFonts.poppins(
                                fontSize: 11, color: Colors.white38)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Smart Empathy',
                        style: GoogleFonts.poppins(
                            fontSize: 10, color: Colors.white24)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _heroStat(String value, String label) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Column(
          children: [
            Text(value,
                style: GoogleFonts.poppins(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white)),
            Text(label,
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                    fontSize: 10, color: Colors.white54)),
          ],
        ),
      ),
    );
  }

  Widget _featureCard({
    required IconData icon,
    required Color color,
    required String title,
    required String desc,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: _darkText)),
                const SizedBox(height: 4),
                Text(desc,
                    style: GoogleFonts.poppins(
                        fontSize: 12, color: Colors.grey.shade500, height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _userTypeCard({
    required IconData icon,
    required Color color,
    required String title,
    required List<String> features,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 10),
          Text(title,
              style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: _darkText)),
          const SizedBox(height: 8),
          ...features.map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Icon(Icons.check_circle_rounded, color: color, size: 14),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(f,
                          style: GoogleFonts.poppins(
                              fontSize: 11, color: Colors.grey.shade600)),
                    ),
                  ],
                ),
              )),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 38,
            child: ElevatedButton(
              onPressed: onTap,
              style: ElevatedButton.styleFrom(
                backgroundColor: color,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20)),
              ),
              child: Text('Join Now',
                  style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _storeButton({
    required IconData icon,
    required String store,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.white, size: 24),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: GoogleFonts.poppins(
                      fontSize: 8, color: Colors.white60, letterSpacing: 0.5)),
              Text(store,
                  style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Colors.white)),
            ],
          ),
        ],
      ),
    );
  }
}
