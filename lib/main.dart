import 'package:flutter/material.dart';
import 'screens/language_screen.dart';
import 'screens/citizen/citizen_home.dart';
import 'screens/worker/worker_home.dart';
import 'services/session_service.dart';
import 'services/lang_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyCollectApp());
}

class MyCollectApp extends StatelessWidget {
  const MyCollectApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MyCollect',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6BA53A)),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    await Future.delayed(const Duration(milliseconds: 500));
    await LangService.loadLanguage();
    final session = await SessionService.getSession();
    if (!mounted) return;
    if (session == null) {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => LanguageScreen()));
      return;
    }
    if (session['role'] == 'citizen') {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => CitizenHome(
        userName: session['userName'] ?? '',
        phone: session['phone'] ?? '',
        isRatepayer: session['isRatepayer'] ?? false,
        street: session['street'] ?? '',
        registrationNumber: session['registrationNumber'] ?? '',
      )));
    } else if (session['role'] == 'worker') {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const WorkerHome()));
    } else {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => LanguageScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF2D5A1B),
      body: Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.eco_rounded, color: Colors.white, size: 44),
          ),
          const SizedBox(height: 20),
          const Text('MyCollect', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          const SizedBox(height: 8),
          Text('Smart Waste Management', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13)),
          const SizedBox(height: 40),
          const CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
        ]),
      ),
    );
  }
}
