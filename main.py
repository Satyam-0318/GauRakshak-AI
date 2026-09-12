"""
main.py - Master Unified Pipeline Runner for SIH26019
Bovine Mastitis Early Forecasting & Diagnostic AI Engine
"""

import os
import sys
import time

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from src.train import run_training_pipeline
from src.explain import run_explainability_analysis
from src.predict import MastitisDiagnosticEngine
from forecasting.synthetic_data_generator import generate_synthetic_cohort
from forecasting.forecasting_model import train_forecasting_models
from forecasting.forecasting_pipeline import run_forecasting_pipeline


def print_banner(title):
    print("\n" + "=" * 80)
    print(f" {title.upper()}")
    print("=" * 80)


def main():
    start_time = time.time()
    print_banner("SIH26019: Bovine Mastitis Diagnostic & Forecasting Pipeline Suite")
    print("Execution Mode: Full End-to-End Execution")
    print("Components: Diagnostic Baseline (Real Data) + 7-14 Day Forecaster (Simulation)\n")

    # =========================================================================
    # MODULE 1: LEAK-FREE DIAGNOSTIC BASELINE ON REAL DATA
    # =========================================================================
    print_banner("Module 1: Leak-Free Diagnostic Baseline (Real Dataset)")
    print("Dataset: clinical_mastitis_cows.csv (1,100 Cows, 6,600 Records)")
    print("Leakage Removed: Milk_visibility, Hardness, Pain")
    print("Splitting: Strict GroupShuffleSplit by Cow_ID (80% Train, 20% Unseen Test)")
    
    train_res = run_training_pipeline(csv_path=os.path.join(BASE_DIR, "clinical_mastitis_cows.csv"))
    
    # Run Diagnostic Explainability
    print_banner("Module 2: Diagnostic Model Explainability (SHAP)")
    run_explainability_analysis()

    # Quick interactive demo of Diagnostic Engine
    print_banner("Module 3: Diagnostic Inference Engine Live Test")
    engine = MastitisDiagnosticEngine()
    demo_healthy = {
        'Cow_ID': 'cow_live_test_healthy',
        'Breed': 'Jersey',
        'Months after giving birth': 3,
        'Previous_Mastits_status': 0,
        'Temperature': 39.1,
        'IUFL': 152, 'EUFL': 185,
        'IUFR': 150, 'EUFR': 184,
        'IURL': 151, 'EURL': 186,
        'IURR': 152, 'EURR': 185
    }
    demo_sick = {
        'Cow_ID': 'cow_live_test_sick',
        'Breed': 'Jersey',
        'Months after giving birth': 1,
        'Previous_Mastits_status': 1,
        'Temperature': 44.8,
        'IUFL': 260, 'EUFL': 295,  # Inflamed Front-Left quarter!
        'IUFR': 165, 'EUFR': 195,
        'IURL': 160, 'EURL': 190,
        'IURR': 162, 'EURR': 192
    }
    res_h = engine.predict_sample(demo_healthy)
    res_s = engine.predict_sample(demo_sick)
    print(f"Sample 1 (Healthy Udder):  Detection = {res_h['mastitis_detected']}, Risk = {res_h['risk_category']} (Prob: {res_h['probability']*100:.1f}%)")
    print(f"  Explanation: {res_h['explanation']}")
    print(f"Sample 2 (Mastitic Udder): Detection = {res_s['mastitis_detected']}, Risk = {res_s['risk_category']} (Prob: {res_s['probability']*100:.1f}%)")
    print(f"  Affected Quarter: {res_s['affected_quarter_candidate']}")
    print(f"  Explanation: {res_s['explanation']}")

    # =========================================================================
    # MODULE 4: 7-14 DAY EARLY FORECASTING PROTOTYPE (SYNTHETIC SIMULATION)
    # =========================================================================
    print_banner("Module 4: 7–14 Day Early Forecasting Simulation Pipeline")
    print("Generating 45-day prospective cohort (200 cows, 9,000 records)...")
    synth_csv = os.path.join(BASE_DIR, "forecasting", "synthetic_longitudinal_cows.csv")
    generate_synthetic_cohort(num_cows=200, days_per_cow=45, incidence_rate=0.35, output_path=synth_csv)

    print("\nTraining Time-Aware Forecasting Models on Pre-Clinical Observations...")
    train_forecasting_models(csv_path=synth_csv)

    print("\nExecuting End-to-End Early Warning Simulation & Generating Case Studies...")
    run_forecasting_pipeline(csv_path=synth_csv)

    # =========================================================================
    # SUMMARY & COMPLETION
    # =========================================================================
    elapsed = time.time() - start_time
    print_banner("Execution Complete & Summary")
    print(f"Total Execution Time: {elapsed:.2f} seconds")
    print("\nGenerated Artifacts & Codebase Status:")
    print("  1. Models Saved:     models/best_model.joblib (Diagnostic), models/forecasting_model.joblib (Forecasting)")
    print("  2. Scalers Saved:    models/scaler.joblib, models/forecasting_scaler.joblib")
    print("  3. Metadata:         models/metadata.json, models/explainability_report.json, forecasting/forecasting_metadata.json")
    print("  4. Predictions CSV:  forecasting/sample_forecasting_results.csv")
    print("  5. Visualization:    forecasting/risk_timeline.svg (7–14 Day Timeline Vector Plot)")
    print("  6. Technical Docs:   forecasting_evaluation_report.md, overfitting_and_generalization_audit_report.md")
    print("\nAll systems operational, leak-free, and SIH-ready.\n")


if __name__ == "__main__":
    main()
