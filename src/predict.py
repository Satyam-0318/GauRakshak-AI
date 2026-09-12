"""
predict.py - Standalone Clinical Mastitis Diagnostic Inference & Explainer Engine
Project: AI/ML-Based Predictive Modelling for Early Forecasting of Bovine Mastitis
PSID: SIH26019
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.dataset import engineer_features, get_feature_columns


class MastitisDiagnosticEngine:
    """
    Production-ready inference service for automated non-invasive
    bovine mastitis screening. Free from target/symptom leakage.
    """

    def __init__(self, model_path="models/best_model.joblib", metadata_path="models/metadata.json"):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        self.model = joblib.load(model_path)

        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
            self.feature_columns = self.metadata['feature_columns']
        else:
            self.feature_columns = get_feature_columns()

    def predict_sample(self, sample_dict):
        """
        Takes raw animal & udder quarter measurements (dict),
        engineers necessary features, and returns risk assessment + explanation.
        """
        # Build 1-row DataFrame
        df = pd.DataFrame([sample_dict])
        # Add dummy class1 if not present (engineer_features expects it or we handle it)
        if 'class1' not in df.columns:
            df['class1'] = 0

        # Engineer features
        df_feat = engineer_features(df)
        X = df_feat[self.feature_columns].values

        prob = float(self.model.predict_proba(X)[0, 1])
        prediction = int(prob >= 0.5)

        # Risk classification
        if prob >= 0.70:
            risk_category = "HIGH RISK"
            action = "Immediate veterinary inspection and California Mastitis Test (CMT) recommended."
        elif prob >= 0.40:
            risk_category = "MODERATE RISK / BORDERLINE"
            action = "Isolate for continuous monitoring across next 2 milking sessions."
        else:
            risk_category = "LOW RISK"
            action = "Healthy baseline. Standard milking routine."

        # Quarter-level diagnostic attribution
        iu_vals = {
            'Front-Left': float(sample_dict.get('IUFL', 0)),
            'Front-Right': float(sample_dict.get('IUFR', 0)),
            'Rear-Left': float(sample_dict.get('IURL', 0)),
            'Rear-Right': float(sample_dict.get('IURR', 0)),
        }
        max_q = max(iu_vals, key=iu_vals.get)
        min_q = min(iu_vals, key=iu_vals.get)
        asym = iu_vals[max_q] - iu_vals[min_q]

        reasons = []
        if asym > 30.0:
            reasons.append(f"Severe quarter asymmetry detected ({asym:.1f} units; {max_q} quarter is highest at {iu_vals[max_q]:.1f})")
        elif asym > 15.0:
            reasons.append(f"Mild quarter asymmetry observed ({asym:.1f} units between {max_q} and {min_q})")
        else:
            reasons.append(f"Quarters are structurally symmetric (spread: {asym:.1f} units)")

        temp = float(sample_dict.get('Temperature', 38.6))
        if temp > 43.0:
            reasons.append(f"Udder surface temperature is high ({temp:.1f}°C)")
        elif temp < 35.0:
            reasons.append(f"Sub-normal surface temperature ({temp:.1f}°C)")

        months = int(sample_dict.get('Months after giving birth', 3))
        if months in [1, 2]:
            reasons.append("Animal is in high-stress early lactation (Month 1-2 post-calving)")

        explanation = "; ".join(reasons) + "."

        return {
            'mastitis_detected': bool(prediction == 1),
            'probability': round(prob, 4),
            'risk_category': risk_category,
            'recommended_action': action,
            'affected_quarter_candidate': max_q if asym > 25.0 else "None (symmetric)",
            'explanation': explanation,
            'quarter_measurements': iu_vals,
            'scientific_disclaimer': "Diagnostic screening baseline model based on non-invasive udder measurements. Does not constitute 7-14 day longitudinal forecasting."
        }


if __name__ == "__main__":
    engine = MastitisDiagnosticEngine()

    # Test with sample healthy cow profile
    healthy_cow = {
        'Cow_ID': 'cow_demo_healthy',
        'Breed': 'Jersey',
        'Months after giving birth': 4,
        'Previous_Mastits_status': 0,
        'Temperature': 39.5,
        'IUFL': 150, 'EUFL': 180,
        'IUFR': 152, 'EUFR': 182,
        'IURL': 151, 'EURL': 181,
        'IURR': 150, 'EURR': 181
    }
    print("--- DEMO: HEALTHY COW SCREENING ---")
    res_h = engine.predict_sample(healthy_cow)
    print(json.dumps(res_h, indent=2))

    # Test with sample mastitic cow profile
    mastitic_cow = {
        'Cow_ID': 'cow_demo_mastitic',
        'Breed': 'Jersey',
        'Months after giving birth': 1,
        'Previous_Mastits_status': 1,
        'Temperature': 45.0,
        'IUFL': 245, 'EUFL': 285,
        'IUFR': 160, 'EUFR': 190,
        'IURL': 155, 'EURL': 185,
        'IURR': 150, 'EURR': 180
    }
    print("\n--- DEMO: MASTITIC COW SCREENING ---")
    res_m = engine.predict_sample(mastitic_cow)
    print(json.dumps(res_m, indent=2))
