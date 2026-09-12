"""
explain.py - SHAP Explainability and Individual Animal Clinical Risk Attribution
Project: AI/ML-Based Predictive Modelling for Early Forecasting of Bovine Mastitis
PSID: SIH26019
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import shap

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.dataset import load_raw_dataset, engineer_features, get_feature_columns, split_by_cow


def generate_clinical_explanation(feature_names, feature_values, shap_values, base_value, predicted_prob):
    """
    Translates SHAP values for a single cow observation into a concise,
    medically grounded clinical explanation.
    """
    # Sort features by SHAP impact toward positive class
    impacts = list(zip(feature_names, feature_values, shap_values))
    # Top features pushing toward mastitis (positive SHAP)
    top_pos_drivers = sorted([x for x in impacts if x[2] > 0], key=lambda x: x[2], reverse=True)[:3]
    # Top features pushing toward healthy (negative SHAP)
    top_neg_drivers = sorted([x for x in impacts if x[2] < 0], key=lambda x: x[2])[:3]

    reasons = []
    if predicted_prob >= 0.5:
        risk_level = "HIGH RISK (Clinical Mastitis Indicated)"
        for name, val, sv in top_pos_drivers:
            if 'asym' in name:
                reasons.append(f"significant udder quarter asymmetry ({name} = {val:.1f})")
            elif 'std' in name:
                reasons.append(f"high inter-quarter variance ({name} = {val:.1f})")
            elif 'temp' in name:
                reasons.append(f"elevated udder surface temperature / thermal deviation ({name} = {val:.1f})")
            elif 'diff' in name or 'differential' in name:
                reasons.append(f"widened inner-to-outer udder tissue gradient ({name} = {val:.1f})")
            elif 'high_risk_lactation' in name and val == 1:
                reasons.append("early lactation stage vulnerability (months 1-2 post-calving)")
            elif 'history_risk' in name and val == 1:
                reasons.append("prior history of mastitis infection")
            else:
                reasons.append(f"elevated {name} ({val:.1f})")
        explanation = f"Flagged as {risk_level} (Predicted probability: {predicted_prob*100:.1f}%). Key drivers: " + ", ".join(reasons) + "."
    else:
        risk_level = "LOW RISK (Healthy / Normal Udder)"
        for name, val, sv in top_neg_drivers:
            if 'asym' in name:
                reasons.append(f"symmetric quarter measurements ({name} = {val:.1f})")
            elif 'temp' in name:
                reasons.append(f"normal physiological temperature range ({name} = {val:.1f})")
            elif 'std' in name:
                reasons.append(f"low inter-quarter variance ({name} = {val:.1f})")
            else:
                reasons.append(f"normal baseline {name} ({val:.1f})")
        explanation = f"Evaluated as {risk_level} (Predicted probability: {predicted_prob*100:.1f}%). Confirmatory signs: " + ", ".join(reasons) + "."

    return explanation


def run_explainability_analysis(model_path="models/best_model.joblib", csv_path="clinical_mastitis_cows.csv", output_dir="models"):
    """Computes TreeExplainer SHAP values, global feature importances, and sample explanations."""
    print("=" * 70)
    print("STEP 4: SHAP EXPLAINABILITY ANALYSIS")
    print("=" * 70)

    raw_df = load_raw_dataset(csv_path)
    df = engineer_features(raw_df)
    feature_cols = get_feature_columns()

    train_df, test_df, train_cows, test_cows = split_by_cow(df, test_size=0.2, random_state=42)

    X_train = train_df[feature_cols].values
    X_test = test_df[feature_cols].values
    y_test = test_df['class1'].values

    model = joblib.load(model_path)
    print(f"Loaded trained model: {type(model).__name__}")

    # Use TreeExplainer
    # For RandomForestClassifier, shap_values is a list of arrays (one per class) or 3D array (samples, features, classes)
    explainer = shap.TreeExplainer(model)
    print("Calculating SHAP values for held-out test cows...")
    shap_vals = explainer.shap_values(X_test)

    # If binary classification, extract positive class (class 1) SHAP values
    if isinstance(shap_vals, list):
        # Older shap / standard format: list of [class 0, class 1]
        shap_class1 = shap_vals[1]
    elif len(shap_vals.shape) == 3:
        # Newer shap format: (n_samples, n_features, n_classes)
        shap_class1 = shap_vals[:, :, 1]
    else:
        shap_class1 = shap_vals

    # Global Feature Importance: Mean Absolute SHAP Value
    mean_abs_shap = np.mean(np.abs(shap_class1), axis=0)
    importance_df = pd.DataFrame({
        'feature': feature_cols,
        'mean_abs_shap': mean_abs_shap
    }).sort_values(by='mean_abs_shap', ascending=False).reset_index(drop=True)

    print("\n--- GLOBAL FEATURE IMPORTANCE (TOP 10 RISK FACTORS) ---")
    for idx, row in importance_df.head(10).iterrows():
        print(f"  {idx+1:2d}. {row['feature']:25s} | Mean |SHAP|: {row['mean_abs_shap']:.4f}")

    # Case Studies on Held-Out Test Set
    test_probs = model.predict_proba(X_test)[:, 1]

    # Find sample high-risk cow (True Positive)
    tp_indices = np.where((y_test == 1) & (test_probs > 0.9))[0]
    sample_tp_idx = tp_indices[0] if len(tp_indices) > 0 else 0
    sample_tp_cow = test_df.iloc[sample_tp_idx]['Cow_ID']
    sample_tp_day = test_df.iloc[sample_tp_idx]['Day']

    tp_explanation = generate_clinical_explanation(
        feature_cols,
        X_test[sample_tp_idx],
        shap_class1[sample_tp_idx],
        explainer.expected_value[1] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value,
        test_probs[sample_tp_idx]
    )

    print("\n" + "-" * 70)
    print(f"CASE 1: HIGH-RISK MASTITIC COW EXPLANATION ({sample_tp_cow}, Day {sample_tp_day})")
    print("-" * 70)
    print(tp_explanation)

    # Find sample healthy cow (True Negative)
    tn_indices = np.where((y_test == 0) & (test_probs < 0.1))[0]
    sample_tn_idx = tn_indices[0] if len(tn_indices) > 0 else 0
    sample_tn_cow = test_df.iloc[sample_tn_idx]['Cow_ID']
    sample_tn_day = test_df.iloc[sample_tn_idx]['Day']

    tn_explanation = generate_clinical_explanation(
        feature_cols,
        X_test[sample_tn_idx],
        shap_class1[sample_tn_idx],
        explainer.expected_value[0] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value,
        test_probs[sample_tn_idx]
    )

    print("\n" + "-" * 70)
    print(f"CASE 2: HEALTHY COW EXPLANATION ({sample_tn_cow}, Day {sample_tn_day})")
    print("-" * 70)
    print(tn_explanation)

    # Check the single false positive case if exists
    fp_indices = np.where((y_test == 0) & (test_probs >= 0.5))[0]
    fp_explanation = None
    if len(fp_indices) > 0:
        sample_fp_idx = fp_indices[0]
        sample_fp_cow = test_df.iloc[sample_fp_idx]['Cow_ID']
        sample_fp_day = test_df.iloc[sample_fp_idx]['Day']
        fp_explanation = generate_clinical_explanation(
            feature_cols,
            X_test[sample_fp_idx],
            shap_class1[sample_fp_idx],
            explainer.expected_value[1] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value,
            test_probs[sample_fp_idx]
        )
        print("\n" + "-" * 70)
        print(f"CASE 3: BORDERLINE / FALSE POSITIVE CASE ({sample_fp_cow}, Day {sample_fp_day})")
        print("-" * 70)
        print(fp_explanation)

    # Save explainability report
    explain_data = {
        'top_10_features': importance_df.head(10).to_dict(orient='records'),
        'all_features_importance': importance_df.to_dict(orient='records'),
        'sample_tp': {
            'cow_id': str(sample_tp_cow),
            'day': int(sample_tp_day),
            'probability': float(test_probs[sample_tp_idx]),
            'explanation': tp_explanation
        },
        'sample_tn': {
            'cow_id': str(sample_tn_cow),
            'day': int(sample_tn_day),
            'probability': float(test_probs[sample_tn_idx]),
            'explanation': tn_explanation
        }
    }
    if fp_explanation:
        explain_data['sample_fp'] = {
            'cow_id': str(sample_fp_cow),
            'day': int(sample_fp_day),
            'probability': float(test_probs[sample_fp_idx]),
            'explanation': fp_explanation
        }

    report_path = os.path.join(output_dir, "explainability_report.json")
    with open(report_path, 'w') as f:
        json.dump(explain_data, f, indent=2)
    print(f"\nSaved explainability report to {report_path}")

    return explain_data


if __name__ == "__main__":
    run_explainability_analysis()
