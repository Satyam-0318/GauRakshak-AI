"""
forecasting_model.py - 7-14 Day Prospective Mastitis Early Warning Engine
Project: AI/ML-Based Predictive Modelling for Early Forecasting of Bovine Mastitis
PSID: SIH26019

IMPORTANT SCIENTIFIC NOTICE:
This module is evaluated on SYNTHETIC longitudinal trajectories for PROTOTYPE DEMONSTRATION ONLY.
Results are explicitly labeled as: "Synthetic simulation performance - NOT clinical validation".
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)
from sklearn.model_selection import train_test_split


def build_temporal_features(df):
    """
    Computes time-aware rolling features for each cow strictly using past data (<= t).
    Prevents lookahead / future-feature leakage.
    """
    df = df.sort_values(by=['Cow_ID', 'Day']).copy()

    # 1. Base instantaneous features
    iu_cols = ['IUFL', 'IUFR', 'IURL', 'IURR']
    eu_cols = ['EUFL', 'EUFR', 'EURL', 'EURR']

    df['asym_IU'] = df[iu_cols].max(axis=1) - df[iu_cols].min(axis=1)
    df['asym_EU'] = df[eu_cols].max(axis=1) - df[eu_cols].min(axis=1)
    df['std_IU'] = df[iu_cols].std(axis=1)

    df['diff_FL'] = df['EUFL'] - df['IUFL']
    df['diff_FR'] = df['EUFR'] - df['IUFR']
    df['diff_RL'] = df['EURL'] - df['IURL']
    df['diff_RR'] = df['EURR'] - df['IURR']
    df['max_quarter_diff'] = df[['diff_FL', 'diff_FR', 'diff_RL', 'diff_RR']].max(axis=1)
    df['mean_differential'] = (df['diff_FL'] + df['diff_FR'] + df['diff_RL'] + df['diff_RR']) / 4.0

    df['temp_deviation'] = (df['Temperature'] - 38.6).abs()
    df['high_risk_lactation'] = df['Months after giving birth'].apply(lambda x: 1 if x in [1, 2] else 0)
    df['Breed_Holstein'] = df['Breed'].apply(lambda x: 1 if str(x).lower().startswith('host') or str(x).lower().startswith('hol') else 0)

    # 2. Rolling temporal features (grouped by cow)
    # 7-day rolling window
    grouped = df.groupby('Cow_ID')

    df['asym_IU_mean_7d'] = grouped['asym_IU'].transform(lambda x: x.rolling(window=7, min_periods=3).mean())
    df['asym_IU_std_7d'] = grouped['asym_IU'].transform(lambda x: x.rolling(window=7, min_periods=3).std().fillna(0))
    # 7-day delta (change over 7 days)
    df['asym_IU_delta_7d'] = grouped['asym_IU'].transform(lambda x: x - x.shift(7)).fillna(0)
    # 3-day delta (short-term velocity)
    df['asym_IU_delta_3d'] = grouped['asym_IU'].transform(lambda x: x - x.shift(3)).fillna(0)
    # Acceleration: 3-day velocity minus 7-day velocity
    df['asym_acceleration'] = df['asym_IU_delta_3d'] - (df['asym_IU_delta_7d'] / 2.33)

    # Temperature dynamics
    df['temp_mean_7d'] = grouped['Temperature'].transform(lambda x: x.rolling(window=7, min_periods=3).mean())
    df['temp_delta_7d'] = grouped['Temperature'].transform(lambda x: x - x.shift(7)).fillna(0)
    df['temp_delta_3d'] = grouped['Temperature'].transform(lambda x: x - x.shift(3)).fillna(0)

    # Differential dynamics
    df['max_diff_delta_7d'] = grouped['max_quarter_diff'].transform(lambda x: x - x.shift(7)).fillna(0)

    # Fill any remaining NaNs with forward/backward fill or 0
    df = df.fillna(0)

    return df


def get_forecasting_feature_names():
    return [
        'asym_IU',
        'asym_EU',
        'std_IU',
        'max_quarter_diff',
        'mean_differential',
        'Temperature',
        'temp_deviation',
        'asym_IU_mean_7d',
        'asym_IU_std_7d',
        'asym_IU_delta_7d',
        'asym_IU_delta_3d',
        'asym_acceleration',
        'temp_mean_7d',
        'temp_delta_7d',
        'temp_delta_3d',
        'max_diff_delta_7d',
        'Months after giving birth',
        'high_risk_lactation',
        'Previous_Mastits_status',
        'Breed_Holstein'
    ]


def evaluate_early_forecasting(y_true, y_pred, y_prob):
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_true, y_prob) if len(np.unique(y_true)) > 1 else 0.0
    pr_auc = average_precision_score(y_true, y_prob) if len(np.unique(y_true)) > 1 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0

    return {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'roc_auc': float(roc_auc),
        'pr_auc': float(pr_auc),
        'fnr': float(fnr),
        'confusion_matrix': {'tn': int(tn), 'fp': int(fp), 'fn': int(fn), 'tp': int(tp)}
    }


def train_forecasting_models(csv_path="forecasting/synthetic_longitudinal_cows.csv", output_dir="models"):
    """
    Trains and benchmarks prospective 7-14 day forecasting models on synthetic trajectories.
    """
    os.makedirs(output_dir, exist_ok=True)
    print("=" * 70)
    print("STEP 5: TRAINING 7-14 DAY EARLY FORECASTING PROTOTYPE (SYNTHETIC)")
    print("=" * 70)

    raw_df = pd.read_csv(csv_path)
    df = build_temporal_features(raw_df)
    feature_cols = get_forecasting_feature_names()

    # Target: Will the cow develop mastitis within the 7-14 day window?
    # Or within the next 14 days (early warning)?
    # We train on target_onset_next_14d for comprehensive pre-clinical alert
    target_col = 'target_onset_next_14d'

    # Filter out days where the cow is ALREADY clinically sick (is_clinical_active == 1)
    # Because early forecasting is strictly for non-clinical cows!
    preclinical_df = df[df['is_clinical_active'] == 0].copy()

    print(f"Total simulated records: {len(df)}")
    print(f"Pre-clinical records used for early warning: {len(preclinical_df)}")
    print(f"Pre-clinical positive early warning instances: {preclinical_df[target_col].sum()} ({preclinical_df[target_col].mean()*100:.1f}%)")

    # Split strictly by Cow_ID (80% train cows, 20% test cows)
    unique_cows = preclinical_df[['Cow_ID', 'is_sick_cow']].drop_duplicates()
    train_cows, test_cows = train_test_split(
        unique_cows['Cow_ID'],
        test_size=0.20,
        stratify=unique_cows['is_sick_cow'],
        random_state=42
    )

    train_cows_set = set(train_cows)
    test_cows_set = set(test_cows)
    assert len(train_cows_set.intersection(test_cows_set)) == 0, "Cow overlap detected!"

    train_df = preclinical_df[preclinical_df['Cow_ID'].isin(train_cows_set)].copy()
    test_df = preclinical_df[preclinical_df['Cow_ID'].isin(test_cows_set)].copy()

    print(f"\nTrain Cows: {len(train_cows_set)} ({len(train_df)} observations)")
    print(f"Test Cows:  {len(test_cows_set)} ({len(test_df)} observations)")

    X_train = train_df[feature_cols].values
    y_train = train_df[target_col].values

    X_test = test_df[feature_cols].values
    y_test = test_df[target_col].values

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Class weighting
    pos_weight = (y_train == 0).sum() / max((y_train == 1).sum(), 1)

    models = {
        'Random Forest': RandomForestClassifier(n_estimators=150, max_depth=8, min_samples_split=4, class_weight='balanced', random_state=42, n_jobs=-1),
        'XGBoost': XGBClassifier(n_estimators=150, max_depth=5, learning_rate=0.05, scale_pos_weight=pos_weight, random_state=42, eval_metric='logloss', n_jobs=-1),
        'Logistic Regression': LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    }

    test_results = {}
    fitted_models = {}

    print("\n--- FORECASTING MODEL BENCHMARKS (ON HELD-OUT TEST COWS) ---")
    for name, model in models.items():
        X_tr = X_train_scaled if name == 'Logistic Regression' else X_train
        X_te = X_test_scaled if name == 'Logistic Regression' else X_test

        model.fit(X_tr, y_train)
        fitted_models[name] = model

        preds = model.predict(X_te)
        probs = model.predict_proba(X_te)[:, 1]

        res = evaluate_early_forecasting(y_test, preds, probs)
        test_results[name] = res

        print(f"\nModel: {name}")
        print(f"  Accuracy:       {res['accuracy']:.4f}")
        print(f"  Precision:      {res['precision']:.4f}")
        print(f"  Recall (Sens.): {res['recall']:.4f}  <-- Early Detection Sensitivity")
        print(f"  F1-Score:       {res['f1_score']:.4f}")
        print(f"  ROC-AUC:        {res['roc_auc']:.4f}")
        print(f"  PR-AUC:         {res['pr_auc']:.4f}")
        print(f"  False Neg Rate: {res['fnr']:.4f}")
        print(f"  Confusion Matrix: TN={res['confusion_matrix']['tn']}, FP={res['confusion_matrix']['fp']}, FN={res['confusion_matrix']['fn']}, TP={res['confusion_matrix']['tp']}")

    # Select champion
    best_name = 'Random Forest'
    best_model = fitted_models[best_name]

    # Save model artifacts
    model_path = os.path.join(output_dir, "forecasting_model.joblib")
    scaler_path = os.path.join(output_dir, "forecasting_scaler.joblib")
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)

    # Lead Time Analysis on Test Cows
    print("\n" + "=" * 70)
    print("LEAD TIME & EARLY DETECTION ANALYSIS (TEST COWS)")
    print("=" * 70)

    test_df['predicted_prob'] = best_model.predict_proba(X_test)[:, 1]
    # Warning triggered if prob >= 0.40 (Early Warning Threshold)
    test_df['warning_triggered'] = (test_df['predicted_prob'] >= 0.40).astype(int)

    # Analyze per sick cow in test set
    test_sick_cows = test_df[test_df['is_sick_cow'] == 1]['Cow_ID'].unique()
    lead_times = []
    detected_ge_7d = 0
    detected_ge_14d = 0

    for cow_id in test_sick_cows:
        cow_records = test_df[test_df['Cow_ID'] == cow_id].sort_values(by='Day')
        onset_day = cow_records['onset_day'].iloc[0]

        # Find first day warning was triggered before onset
        warnings = cow_records[(cow_records['warning_triggered'] == 1) & (cow_records['Day'] < onset_day)]
        if len(warnings) > 0:
            first_warning_day = warnings['Day'].iloc[0]
            lead_time = onset_day - first_warning_day
            lead_times.append(lead_time)
            if lead_time >= 7:
                detected_ge_7d += 1
            if lead_time >= 14:
                detected_ge_14d += 1
        else:
            lead_times.append(0)

    total_test_sick = len(test_sick_cows)
    avg_lead_time = float(np.mean(lead_times)) if lead_times else 0.0
    min_lead_time = int(np.min(lead_times)) if lead_times else 0
    max_lead_time = int(np.max(lead_times)) if lead_times else 0
    pct_ge_7d = (detected_ge_7d / total_test_sick) * 100.0 if total_test_sick > 0 else 0.0
    pct_ge_14d = (detected_ge_14d / total_test_sick) * 100.0 if total_test_sick > 0 else 0.0

    print(f"Total Sick Cows in Test Set: {total_test_sick}")
    print(f"Average Lead Time:           {avg_lead_time:.1f} days before clinical signs")
    print(f"Minimum Lead Time:           {min_lead_time} days")
    print(f"Maximum Lead Time:           {max_lead_time} days")
    print(f"Detected >= 7 Days Early:    {detected_ge_7d} / {total_test_sick} ({pct_ge_7d:.1f}%)")
    print(f"Detected >= 14 Days Early:   {detected_ge_14d} / {total_test_sick} ({pct_ge_14d:.1f}%)")

    # Save summary metadata
    lead_time_metrics = {
        'total_sick_cows_test': total_test_sick,
        'average_lead_time_days': round(avg_lead_time, 2),
        'min_lead_time_days': min_lead_time,
        'max_lead_time_days': max_lead_time,
        'pct_detected_ge_7d_early': round(pct_ge_7d, 2),
        'pct_detected_ge_14d_early': round(pct_ge_14d, 2)
    }

    report = {
        'experiment_type': 'SYNTHETIC_SIMULATION_PROTOTYPE (NOT CLINICAL VALIDATION)',
        'target': 'target_onset_next_14d',
        'feature_columns': feature_cols,
        'test_results': test_results,
        'lead_time_metrics': lead_time_metrics
    }

    with open("forecasting/forecasting_metadata.json", "w") as f:
        json.dump(report, f, indent=2)

    print(f"\nSaved forecasting model to: {model_path}")
    print(f"Saved forecasting metadata to: forecasting/forecasting_metadata.json")

    return report, df, preclinical_df, test_df, best_model


if __name__ == "__main__":
    train_forecasting_models()
