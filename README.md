# MyCollect Mobile App

AI-powered IoT waste management app for Homagama Municipal Zone, Sri Lanka.

## Requirements
- Flutter SDK 3.x+
- Android device with USB debugging enabled

## Setup
```bash
flutter pub get
flutter devices
flutter run -d <DEVICE_ID>
```

## Demo Credentials

**Citizen Login**
- Phone: 743242650
- Password: password123

**Worker Login**
| ID | PIN |
|----|-----|
| WRK-001 | 1234 |
| WRK-002 | 5678 |
| WRK-003 | 9012 |

## Demo Flow
1. Select language (English / Sinhala)
2. Select role (Citizen / Worker)
3. Citizen: login → view dashboard → check bin map → view schedule → submit report
4. Worker: login with WRK-001/1234 → view priority bins → mark as collected
5. KEY MOMENT: Worker marks bin collected → web dashboard updates in real time

## Troubleshooting
```bash
# Phone not detected
adb kill-server && adb start-server

# Build fails
flutter clean && flutter pub get
```

## Project Info
- Student: Dinithi Wijesinghe (10952811)
- Module: PUSL3190 — NSBM / Plymouth University
- Supervisor: Miss Dharani Rajasinghe
