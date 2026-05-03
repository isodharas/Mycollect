import boto3
from decimal import Decimal
import time
import sys

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')
table = dynamodb.Table('BinLatestStatus')

# ── All 5 bins with real locations ────────────────────────────────────────
BINS = {
    'BIN_001': 'Homagama North Market',
    'BIN_002': 'Malapalla Junction',
    'BIN_003': 'Pitipana Town',
    'BIN_004': 'Thalangama Road',
    'BIN_005': 'Kotikawatta Bus Stop',
}

def write_bin(bin_id, gas_ppm, fill_level, priority_label, health_risk):
    table.put_item(Item={
        'bin_id': bin_id,
        'gas_ppm': Decimal(str(gas_ppm)),
        'fill_level': Decimal(str(fill_level)),
        'health_risk': Decimal(str(health_risk)),
        'priority_label': priority_label,
        'classified_by': 'RandomForest',
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'location': BINS.get(bin_id, 'Homagama'),
    })

def cmd_reset():
    """Reset all bins to normal safe levels"""
    print("\n🔄 Resetting all bins to NORMAL...")
    data = [
        ('BIN_001', 120, 35, 'LOW',    18.4),
        ('BIN_002', 180, 52, 'MEDIUM', 27.2),
        ('BIN_003', 160, 45, 'MEDIUM', 26.1),
        ('BIN_004', 90,  28, 'LOW',    14.7),
        ('BIN_005', 210, 60, 'MEDIUM', 32.7),
    ]
    for bin_id, gas, fill, priority, risk in data:
        write_bin(bin_id, gas, fill, priority, risk)
        print(f"  ✓ {bin_id} → {priority} (gas={gas} PPM, fill={fill}%)")
    print("\n✅ All bins reset. Refresh app to see changes.\n")

def cmd_spike(bin_id=None):
    """Spike one bin or BIN_003 by default to CRITICAL"""
    target = bin_id or 'BIN_003'
    if target not in BINS:
        print(f"❌ Unknown bin: {target}. Choose from: {list(BINS.keys())}")
        return
    print(f"\n⚠️  Spiking {target} to CRITICAL...")
    write_bin(target, 720, 45, 'CRITICAL', 65.4)
    print(f"  ✓ {target} → CRITICAL (gas=720 PPM overrides fill=45%)")
    print(f"  📍 Location: {BINS[target]}")
    print(f"\n🔴 Refresh app/dashboard to see {target} turn RED.\n")

def cmd_demo():
    """
    Live escalation demo — runs for ~2 minutes.
    Shows bins escalating from MEDIUM → HIGH → CRITICAL in real time.
    Perfect for viva: open the app, run this, let examiner watch.
    """
    print("\n🎬 STARTING LIVE DEMO SCENARIO")
    print("   Open your app and dashboard now. Watch bins change in real time.")
    print("   Press Ctrl+C to stop early.\n")

    # Step 1 — all normal
    print("Step 1/4 — All bins normal...")
    cmd_reset()
    time.sleep(8)

    # Step 2 — BIN_002 goes HIGH
    print("Step 2/4 — BIN_002 gas rising (HIGH)...")
    write_bin('BIN_002', 420, 52, 'HIGH', 41.2)
    print("  ✓ BIN_002 → HIGH (gas=420 PPM)")
    time.sleep(10)

    # Step 3 — BIN_003 gas spike → CRITICAL
    print("Step 3/4 — BIN_003 critical gas spike!")
    write_bin('BIN_003', 720, 45, 'CRITICAL', 65.4)
    print("  🔴 BIN_003 → CRITICAL (gas=720 PPM, fill only 45%)")
    print("  ← This shows 70% gas weight overriding low fill level")
    time.sleep(10)

    # Step 4 — BIN_001 also fills up
    print("Step 4/4 — BIN_001 fill level critical...")
    write_bin('BIN_001', 380, 91, 'CRITICAL', 53.6)
    print("  🔴 BIN_001 → CRITICAL (fill=91%, gas=380 PPM)")
    print("\n✅ Demo scenario complete. 2 CRITICAL bins visible on dashboard.")
    print("   Run 'python3 demo_simulator.py reset' to restore.\n")

def cmd_fill(bin_id, fill_pct):
    """Manually set a bin's fill level"""
    if bin_id not in BINS:
        print(f"❌ Unknown bin: {bin_id}")
        return
    fill = int(fill_pct)
    if fill >= 80:
        gas, priority, risk = 380, 'CRITICAL', 53.6
    elif fill >= 60:
        gas, priority, risk = 280, 'HIGH', 37.4
    elif fill >= 40:
        gas, priority, risk = 180, 'MEDIUM', 26.1
    else:
        gas, priority, risk = 90, 'LOW', 14.2
    write_bin(bin_id, gas, fill, priority, risk)
    print(f"✓ {bin_id} → fill={fill}%, priority={priority}")

def cmd_status():
    """Print current status of all bins from DynamoDB"""
    print("\n📊 Current bin status from DynamoDB:\n")
    print(f"  {'BIN ID':<10} {'PRIORITY':<10} {'GAS PPM':<10} {'FILL %':<10} {'HEALTH RISK'}")
    print("  " + "-"*55)
    for bin_id in BINS:
        try:
            resp = table.get_item(Key={'bin_id': bin_id})
            item = resp.get('Item', {})
            if item:
                print(f"  {bin_id:<10} {item.get('priority_label','?'):<10} "
                      f"{item.get('gas_ppm','?'):<10} {item.get('fill_level','?'):<10} "
                      f"{item.get('health_risk','?')}")
            else:
                print(f"  {bin_id:<10} NO DATA IN DYNAMODB")
        except Exception as e:
            print(f"  {bin_id} error: {e}")
    print()

def print_help():
    print("""
╔══════════════════════════════════════════════════════╗
║         MyCollect Demo Simulator                     ║
╚══════════════════════════════════════════════════════╝

Commands:
  python3 demo_simulator.py reset              → Reset all 5 bins to safe levels
  python3 demo_simulator.py spike              → Spike BIN_003 to CRITICAL
  python3 demo_simulator.py spike BIN_001      → Spike any specific bin
  python3 demo_simulator.py demo               → Run live 2-min escalation scenario
  python3 demo_simulator.py fill BIN_002 85    → Set BIN_002 fill to 85%
  python3 demo_simulator.py status             → Print current DynamoDB values
  python3 demo_simulator.py help               → Show this help

Viva tip:
  1. Run 'reset' first to show all bins normal
  2. Open your Flutter app on the emulator
  3. Run 'demo' — let examiner watch bins escalate live
  4. Run 'reset' after to restore
""")

# ── MAIN ──────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    args = sys.argv[1:]

    if not args or args[0] == 'help':
        print_help()
    elif args[0] == 'reset':
        cmd_reset()
    elif args[0] == 'spike':
        cmd_spike(args[1] if len(args) > 1 else None)
    elif args[0] == 'demo':
        cmd_demo()
    elif args[0] == 'status':
        cmd_status()
    elif args[0] == 'fill':
        if len(args) < 3:
            print("Usage: python3 demo_simulator.py fill BIN_001 85")
        else:
            cmd_fill(args[1], args[2])
    else:
        print(f"❌ Unknown command: {args[0]}")
        print_help()
