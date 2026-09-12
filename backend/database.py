"""
database.py - SQLite database layer for GauRakshak AI.
Manages persistent storage for cows (RFID-tagged) and prediction histories.
Designed with standard SQL schema so it can seamlessly migrate to PostgreSQL.
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "gaurakshak.db")


def get_db_connection() -> sqlite3.Connection:
    """Creates a thread-safe connection to the SQLite database with row factory."""
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Initializes tables and seeds demo cows if database is empty."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Cows Table (RFID is the primary identifier)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cows (
                rfid TEXT PRIMARY KEY,
                name TEXT,
                breed TEXT NOT NULL,
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT
            )
        """)
        
        # 2. Predictions Table (Linked to cow via RFID)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rfid TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                season TEXT NOT NULL,
                lactation_stage TEXT NOT NULL,
                parity TEXT NOT NULL,
                milk_yield TEXT NOT NULL,
                ph REAL NOT NULL,
                ec REAL NOT NULL,
                scc REAL NOT NULL,
                predicted_stage TEXT NOT NULL,
                confidence REAL NOT NULL,
                probabilities TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                clinical_explanation TEXT,
                veterinary_recommendation TEXT,
                action_code TEXT,
                FOREIGN KEY (rfid) REFERENCES cows(rfid) ON DELETE CASCADE
            )
        """)
        
        # Create index on rfid and timestamp for fast lookups
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_rfid ON predictions(rfid)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_timestamp ON predictions(timestamp DESC)")
        
        conn.commit()
        
        # Seed initial realistic dairy cows if table is empty
        cursor.execute("SELECT COUNT(*) AS count FROM cows")
        row = cursor.fetchone()
        if row and row["count"] == 0:
            seed_demo_data(cursor)
            conn.commit()


def seed_demo_data(cursor: sqlite3.Cursor):
    """Seeds initial realistic Indian dairy cows with calibrated prediction histories."""
    demo_cows = [
        ("RFID-IND-1001", "Gauri", "Gir", "High milk yield indigenous cow from Gujarat line", "2026-08-15 08:00:00"),
        ("RFID-IND-1002", "Lakshmi", "Sahiwal", "Calm temperament, 3rd lactation Punjab breed", "2026-08-20 09:30:00"),
        ("RFID-IND-1003", "Kamdhenu", "Holstein Cross", "High yielding crossbred cow in early lactation", "2026-09-01 07:15:00"),
        ("RFID-IND-1004", "Shyama", "Murrah Cross", "Sturdy black indigenous cross, 2nd parity", "2026-09-05 10:00:00"),
    ]
    
    cursor.executemany(
        "INSERT INTO cows (rfid, name, breed, notes, date_added) VALUES (?, ?, ?, ?, ?)",
        demo_cows
    )
    
    demo_predictions = [
        # Gauri (Healthy)
        (
            "RFID-IND-1001", "2026-09-10 08:15:00", "Winter", "Mid", "2nd", "5-10",
            6.55, 4.25, 1.20, "Healthy", 0.92,
            json.dumps({"Healthy": 0.92, "Subclinical": 0.07, "Clinical": 0.01}),
            24, "Healthy udder. Normal milk pH and electrical conductivity.",
            "Maintain standard post-milking teat dip and clean bedding.", "MONITOR"
        ),
        (
            "RFID-IND-1001", "2026-09-07 08:10:00", "Winter", "Mid", "2nd", "5-10",
            6.52, 4.20, 1.10, "Healthy", 0.94,
            json.dumps({"Healthy": 0.94, "Subclinical": 0.05, "Clinical": 0.01}),
            20, "Optimal biophysical readings across all parameters.",
            "Maintain routine DHIA record keeping.", "MONITOR"
        ),
        # Lakshmi (Subclinical - Caution)
        (
            "RFID-IND-1002", "2026-09-10 08:30:00", "Rainy", "Mid", "3rd", "5-10",
            6.80, 5.10, 3.60, "Subclinical", 0.84,
            json.dumps({"Healthy": 0.12, "Subclinical": 0.84, "Clinical": 0.04}),
            58, "Mild infection detected. Elevated conductivity and somatic cell count indicate early mammary tissue inflammation.",
            "Perform California Mastitis Test (CMT) on individual quarters. Consult veterinarian for teat sealant or herbal anti-inflammatory dip.", "CAUTION_CMT"
        ),
        (
            "RFID-IND-1002", "2026-09-06 08:25:00", "Rainy", "Mid", "3rd", "5-10",
            6.68, 4.75, 2.40, "Subclinical", 0.72,
            json.dumps({"Healthy": 0.25, "Subclinical": 0.72, "Clinical": 0.03}),
            45, "Early somatic cell rise detected before visual clots.",
            "Isolate milk cluster and re-test in 48 hours.", "CAUTION_CMT"
        ),
        # Kamdhenu (Clinical - Urgent)
        (
            "RFID-IND-1003", "2026-09-10 09:00:00", "Summer", "Early", "4th and above", "0-4",
            7.25, 6.80, 38.5, "Clinical", 0.98,
            json.dumps({"Healthy": 0.01, "Subclinical": 0.01, "Clinical": 0.98}),
            94, "Severe clinical mastitis. High alkaline milk (pH 7.25), severe cellular damage (SCC 38.5 ×10⁵), and conductivity spike.",
            "URGENT: Isolate cow immediately from milking line. Discard milk. Call veterinarian for clinical quarter antibiotic infusion and anti-inflammatory therapy.", "URGENT_TREATMENT"
        ),
        # Shyama (Healthy)
        (
            "RFID-IND-1004", "2026-09-08 07:45:00", "Rainy", "Mid", "2nd", "5-10",
            6.58, 4.30, 1.45, "Healthy", 0.89,
            json.dumps({"Healthy": 0.89, "Subclinical": 0.10, "Clinical": 0.01}),
            22, "Healthy udder. Parameters within safe indigenous dairy thresholds.",
            "Continue regular hygienic milking protocols.", "MONITOR"
        )
    ]
    
    cursor.executemany("""
        INSERT INTO predictions (
            rfid, timestamp, season, lactation_stage, parity, milk_yield,
            ph, ec, scc, predicted_stage, confidence, probabilities,
            risk_score, clinical_explanation, veterinary_recommendation, action_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, demo_predictions)


# --- DAO / Service Functions ---

def get_all_cows() -> List[Dict[str, Any]]:
    """Retrieves all registered cows with their latest prediction summary."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = """
            SELECT 
                c.rfid, 
                c.name, 
                c.breed, 
                c.date_added,
                c.notes,
                p.timestamp AS last_tested,
                p.predicted_stage AS last_stage,
                p.risk_score AS last_risk_score,
                p.confidence AS last_confidence,
                (SELECT COUNT(*) FROM predictions WHERE rfid = c.rfid) AS test_count
            FROM cows c
            LEFT JOIN predictions p ON p.id = (
                SELECT id FROM predictions 
                WHERE rfid = c.rfid 
                ORDER BY timestamp DESC, id DESC 
                LIMIT 1
            )
            ORDER BY c.date_added DESC
        """
        rows = cursor.execute(query).fetchall()
        return [dict(row) for row in rows]


def get_cow_by_rfid(rfid: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single cow by its RFID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        row = cursor.execute(
            "SELECT * FROM cows WHERE LOWER(rfid) = LOWER(?)", 
            (rfid.strip(),)
        ).fetchone()
        if not row:
            return None
        cow = dict(row)
        
        # Also fetch prediction history for this cow
        history_rows = cursor.execute("""
            SELECT 
                id, rfid, timestamp, season, lactation_stage, parity, milk_yield,
                ph, ec, scc, predicted_stage, confidence, probabilities,
                risk_score, clinical_explanation, veterinary_recommendation, action_code
            FROM predictions
            WHERE LOWER(rfid) = LOWER(?)
            ORDER BY timestamp DESC, id DESC
        """, (rfid.strip(),)).fetchall()
        
        cow["predictions"] = []
        for h in history_rows:
            rec = dict(h)
            try:
                rec["probabilities"] = json.loads(rec["probabilities"])
            except Exception:
                pass
            cow["predictions"].append(rec)
            
        return cow


def register_cow(rfid: str, name: Optional[str], breed: str, notes: Optional[str] = "") -> Dict[str, Any]:
    """Registers a new cow with RFID identifier."""
    rfid_clean = rfid.strip().upper()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        existing = cursor.execute(
            "SELECT rfid FROM cows WHERE LOWER(rfid) = LOWER(?)", 
            (rfid_clean,)
        ).fetchone()
        
        if existing:
            # Update name/breed if provided
            cursor.execute(
                "UPDATE cows SET name = COALESCE(?, name), breed = COALESCE(?, breed), notes = COALESCE(?, notes) WHERE LOWER(rfid) = LOWER(?)",
                (name, breed, notes, rfid_clean)
            )
        else:
            cursor.execute(
                "INSERT INTO cows (rfid, name, breed, notes, date_added) VALUES (?, ?, ?, ?, ?)",
                (rfid_clean, name or f"Cow {rfid_clean}", breed, notes or "", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            )
        conn.commit()
        
    return get_cow_by_rfid(rfid_clean)


def save_cow_prediction(rfid: str, input_data: Dict[str, Any], pred_result: Dict[str, Any]) -> int:
    """
    Saves a prediction record linked to cow RFID.
    Ensures cow exists (auto-registers with generic breed if missing).
    """
    rfid_clean = rfid.strip().upper()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Ensure cow exists
        cow_exists = cursor.execute(
            "SELECT rfid FROM cows WHERE LOWER(rfid) = LOWER(?)", 
            (rfid_clean,)
        ).fetchone()
        
        if not cow_exists:
            cursor.execute(
                "INSERT INTO cows (rfid, name, breed, notes, date_added) VALUES (?, ?, ?, ?, ?)",
                (rfid_clean, f"Cow {rfid_clean}", "Indigenous / Desi", "Auto-registered from test", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            )
        
        # Calculate risk score if not provided
        risk_score = pred_result.get("risk_score")
        if risk_score is None:
            probs = pred_result.get("probabilities", {})
            clinical_p = probs.get("Clinical", 0.0)
            subclinical_p = probs.get("Subclinical", 0.0)
            calculated = int(round((clinical_p * 100) + (subclinical_p * 50)))
            risk_score = max(10, min(100, calculated))
            
        cursor.execute("""
            INSERT INTO predictions (
                rfid, timestamp, season, lactation_stage, parity, milk_yield,
                ph, ec, scc, predicted_stage, confidence, probabilities,
                risk_score, clinical_explanation, veterinary_recommendation, action_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rfid_clean,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            input_data.get("Season", "Winter"),
            input_data.get("LactationStage", "Mid"),
            input_data.get("Parity", "2nd"),
            input_data.get("MilkYield", "5-10"),
            float(input_data.get("pH", 6.6)),
            float(input_data.get("EC", 4.5)),
            float(input_data.get("SCC", 1.8)),
            pred_result.get("predicted_stage", "Healthy"),
            float(pred_result.get("confidence", 0.85)),
            json.dumps(pred_result.get("probabilities", {})),
            int(risk_score),
            pred_result.get("clinical_explanation", ""),
            pred_result.get("veterinary_recommendation", ""),
            pred_result.get("action_code", "MONITOR")
        ))
        conn.commit()
        return cursor.lastrowid


def search_cows(query: str) -> List[Dict[str, Any]]:
    """Searches cows by RFID or name."""
    term = f"%{query.strip().lower()}%"
    with get_db_connection() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("""
            SELECT 
                c.rfid, c.name, c.breed, c.date_added,
                p.timestamp AS last_tested,
                p.predicted_stage AS last_stage,
                p.risk_score AS last_risk_score
            FROM cows c
            LEFT JOIN predictions p ON p.id = (
                SELECT id FROM predictions 
                WHERE rfid = c.rfid 
                ORDER BY timestamp DESC, id DESC 
                LIMIT 1
            )
            WHERE LOWER(c.rfid) LIKE ? OR LOWER(c.name) LIKE ? OR LOWER(c.breed) LIKE ?
            ORDER BY c.date_added DESC
        """, (term, term, term)).fetchall()
        return [dict(r) for r in rows]
