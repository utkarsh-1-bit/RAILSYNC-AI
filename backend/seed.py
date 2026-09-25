import sys
import os
from datetime import datetime, timedelta
import random

# Add backend directory to python path if not already there
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models


def seed_data():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # --- Stations ---
    if db.query(models.Station).count() == 0:
        print("Seeding stations...")
        stations = [
            models.Station(code="NDLS", name="New Delhi", latitude=28.6415, longitude=77.2209, platform_count=16, zone="NR", is_junction=True),
            models.Station(code="MMCT", name="Mumbai Central", latitude=18.9712, longitude=72.8197, platform_count=10, zone="WR", is_junction=True),
            models.Station(code="HWH", name="Howrah Junction", latitude=22.5833, longitude=88.3333, platform_count=23, zone="ER", is_junction=True),
            models.Station(code="MAS", name="Chennai Central", latitude=13.0827, longitude=80.2707, platform_count=12, zone="SR", is_junction=True),
            models.Station(code="SBC", name="Bengaluru City", latitude=12.9784, longitude=77.5714, platform_count=10, zone="SWR", is_junction=True),
            models.Station(code="JP", name="Jaipur Junction", latitude=26.9196, longitude=75.7878, platform_count=7, zone="NWR", is_junction=True),
            models.Station(code="LKO", name="Lucknow Charbagh", latitude=26.8350, longitude=80.9210, platform_count=9, zone="NR", is_junction=True),
            models.Station(code="ADI", name="Ahmedabad Junction", latitude=23.0225, longitude=72.5714, platform_count=12, zone="WR", is_junction=True),
            models.Station(code="PUNE", name="Pune Junction", latitude=18.5285, longitude=73.8744, platform_count=6, zone="CR", is_junction=True),
            models.Station(code="BPL", name="Bhopal Junction", latitude=23.2688, longitude=77.4122, platform_count=6, zone="WCR", is_junction=True),
            models.Station(code="AGC", name="Agra Cantt", latitude=27.1546, longitude=78.0106, platform_count=5, zone="NCR", is_junction=False),
            models.Station(code="CNB", name="Kanpur Central", latitude=26.4535, longitude=80.3504, platform_count=10, zone="NCR", is_junction=True),
            models.Station(code="PRYJ", name="Prayagraj Junction", latitude=25.4312, longitude=81.8406, platform_count=10, zone="NCR", is_junction=True),
            models.Station(code="MGS", name="Mughal Sarai", latitude=25.2793, longitude=83.1178, platform_count=8, zone="ECR", is_junction=True),
            models.Station(code="BBS", name="Bhubaneswar", latitude=20.2706, longitude=85.8398, platform_count=6, zone="ECoR", is_junction=False),
            models.Station(code="SC", name="Secunderabad", latitude=17.4344, longitude=78.5013, platform_count=10, zone="SCR", is_junction=True),
        ]
        db.add_all(stations)
        db.commit()

    # --- Trains ---
    if db.query(models.Train).count() == 0:
        print("Seeding trains...")
        trains = [
            models.Train(number="12951", name="Mumbai Rajdhani Express", train_type="Rajdhani", capacity=1200, max_speed_kmph=130, priority=1, status="on_time"),
            models.Train(number="12952", name="New Delhi Rajdhani Express", train_type="Rajdhani", capacity=1200, max_speed_kmph=130, priority=1, status="on_time"),
            models.Train(number="12301", name="Howrah Rajdhani Express", train_type="Rajdhani", capacity=1100, max_speed_kmph=130, priority=1, status="delayed"),
            models.Train(number="12004", name="Lucknow Shatabdi Express", train_type="Shatabdi", capacity=800, max_speed_kmph=150, priority=2, status="on_time"),
            models.Train(number="12002", name="Bhopal Shatabdi Express", train_type="Shatabdi", capacity=800, max_speed_kmph=150, priority=2, status="on_time"),
            models.Train(number="12622", name="Tamil Nadu Express", train_type="Superfast", capacity=1500, max_speed_kmph=110, priority=3, status="delayed"),
            models.Train(number="12810", name="Howrah Mumbai Mail", train_type="Mail/Express", capacity=1500, max_speed_kmph=100, priority=4, status="on_time"),
            models.Train(number="12625", name="Kerala Express", train_type="Superfast", capacity=1400, max_speed_kmph=110, priority=3, status="on_time"),
            models.Train(number="12723", name="Telangana Express", train_type="Superfast", capacity=1300, max_speed_kmph=110, priority=3, status="on_time"),
            models.Train(number="12431", name="Rajdhani Express (Trivandrum)", train_type="Rajdhani", capacity=1000, max_speed_kmph=130, priority=1, status="on_time"),
            models.Train(number="12309", name="Rajdhani Express (Patna)", train_type="Rajdhani", capacity=1100, max_speed_kmph=130, priority=1, status="delayed"),
            models.Train(number="12259", name="Sealdah Duronto Express", train_type="Duronto", capacity=900, max_speed_kmph=130, priority=2, status="on_time"),
        ]
        db.add_all(trains)
        db.commit()

    # --- Route Segments ---
    if db.query(models.RouteSegment).count() == 0:
        print("Seeding route segments...")
        # Fetch all stations for ID mapping
        all_stations = {s.code: s.id for s in db.query(models.Station).all()}
        segments = [
            # Delhi - Mumbai via Jaipur, Ahmedabad
            ("NDLS", "JP", 308, 270, "double"),
            ("JP", "ADI", 625, 510, "double"),
            ("ADI", "MMCT", 493, 420, "double"),
            # Delhi - Mumbai via AGC, BPL, PUNE
            ("NDLS", "AGC", 195, 120, "quadruple"),
            ("AGC", "BPL", 525, 390, "double"),
            ("BPL", "PUNE", 790, 690, "double"),
            ("PUNE", "MMCT", 192, 210, "double"),
            # Delhi - Howrah
            ("NDLS", "CNB", 440, 300, "quadruple"),
            ("CNB", "PRYJ", 195, 150, "double"),
            ("PRYJ", "MGS", 130, 90, "double"),
            ("MGS", "HWH", 410, 330, "double"),
            # Delhi - Lucknow
            ("NDLS", "LKO", 512, 360, "double"),
            ("LKO", "CNB", 82, 75, "double"),
            # Delhi - Chennai
            ("AGC", "BPL", 525, 390, "double"),
            ("BPL", "SC", 720, 630, "double"),
            ("SC", "MAS", 620, 540, "double"),
            # Howrah - Chennai
            ("HWH", "BBS", 440, 390, "double"),
            ("BBS", "MAS", 1170, 960, "single"),
            # Bengaluru connections
            ("MAS", "SBC", 360, 300, "double"),
            ("SC", "SBC", 570, 540, "double"),
        ]
        
        added_pairs = set()
        for from_code, to_code, dist, time_min, track in segments:
            pair = tuple(sorted([from_code, to_code]))
            if pair in added_pairs:
                continue
            added_pairs.add(pair)
            if from_code in all_stations and to_code in all_stations:
                db.add(models.RouteSegment(
                    from_station_id=all_stations[from_code],
                    to_station_id=all_stations[to_code],
                    distance_km=dist,
                    typical_time_minutes=time_min,
                    track_type=track
                ))
        db.commit()

    # --- Schedules ---
    if db.query(models.Schedule).count() == 0:
        print("Seeding schedules...")
        all_stations = {s.code: s for s in db.query(models.Station).all()}
        all_trains = {t.number: t for t in db.query(models.Train).all()}

        # Define routes as (train_number, [(station_code, arr_offset_hrs, dep_offset_hrs, platform), ...])
        base_date = datetime(2026, 9, 25, 0, 0)
        route_defs = [
            ("12951", [  # Mumbai Rajdhani - NDLS to MMCT
                ("NDLS", None, 16.0, 3),
                ("JP", 20.5, 20.67, 1),
                ("ADI", 3.0, 3.25, 5),   # Day 2
                ("MMCT", 8.33, None, 2),  # Day 2
            ]),
            ("12301", [  # Howrah Rajdhani - NDLS to HWH
                ("NDLS", None, 17.0, 9),
                ("CNB", 21.33, 21.5, 4),
                ("PRYJ", 23.5, 23.67, 3),
                ("MGS", 0.75, 1.0, 2),    # Day 2
                ("HWH", 9.83, None, 12),  # Day 2
            ]),
            ("12004", [  # Lucknow Shatabdi
                ("NDLS", None, 6.17, 7),
                ("AGC", 8.17, 8.33, 2),
                ("CNB", 11.0, 11.17, 6),
                ("LKO", 12.67, None, 1),
            ]),
            ("12002", [  # Bhopal Shatabdi
                ("NDLS", None, 6.25, 12),
                ("AGC", 8.17, 8.33, 3),
                ("BPL", 12.67, None, 1),
            ]),
            ("12622", [  # Tamil Nadu Express
                ("NDLS", None, 22.5, 5),
                ("AGC", 0.67, 0.83, 1),
                ("BPL", 7.5, 7.75, 3),
                ("SC", 18.5, 18.83, 4),
                ("MAS", 7.08, None, 6),   # Day 2 arr
            ]),
            ("12810", [  # Howrah Mumbai Mail
                ("HWH", None, 20.0, 15),
                ("MGS", 2.5, 2.67, 3),
                ("PRYJ", 4.0, 4.17, 5),
                ("CNB", 6.5, 6.67, 8),
                ("MMCT", 23.5, None, 4),  # Day 2
            ]),
        ]

        for train_num, stops in route_defs:
            if train_num not in all_trains:
                continue
            train = all_trains[train_num]
            for seq, (st_code, arr_h, dep_h, plat) in enumerate(stops, start=1):
                if st_code not in all_stations:
                    continue
                station = all_stations[st_code]
                
                arr_time = None
                dep_time = None
                day = 1
                
                if arr_h is not None:
                    day = 1 if arr_h < 24 else 2
                    arr_time = base_date + timedelta(hours=arr_h % 24, days=day - 1)
                if dep_h is not None:
                    day_dep = 1 if dep_h < 24 else 2
                    dep_time = base_date + timedelta(hours=dep_h % 24, days=day_dep - 1)

                # Add some random delay for trains marked as delayed
                delay = 0
                if train.status == "delayed":
                    delay = random.choice([15, 30, 45, 60, 90])

                db.add(models.Schedule(
                    train_id=train.id,
                    station_id=station.id,
                    arrival_time=arr_time,
                    departure_time=dep_time,
                    scheduled_arrival=arr_time,
                    scheduled_departure=dep_time,
                    sequence_number=seq,
                    platform=plat,
                    delay_minutes=delay,
                    day=day
                ))
        db.commit()

    print("Database seeded successfully.")
    db.close()


if __name__ == "__main__":
    seed_data()
