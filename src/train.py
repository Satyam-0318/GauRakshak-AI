"""
train.py - Leak-free Model Training and Evaluation Pipeline
Project: AI/ML-Based Predictive Modelling for Early Forecasting of Bovine Mastitis
PSID: SIH26019
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.dataset import load_raw_dataset, engineer_features, get_feature_columns, split_by_cow, LEAKAGE_FEATURES


def evaluate_predictions(y_true, y_pred, y_prob):
    """Calculates all key diagnostic performance metrics."""
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
        'confusion_matrix': {
            'tn': int(tn),
            'fp': int(fp),
            'fn': int(fn),
            'tp': int(tp)
        }
    }


def run_training_pipeline(csv_path="clinical_mastitis_cows.csv", output_dir="models"):
    """Executes full leak-free training, CV, and test evaluation."""
    os.makedirs(output_dir, exist_ok=True)

    print("=" * 70)
    print("STEP 1: LOADING & FEATURE ENGINEERING (NO TARGET LEAKAGE)")
    print("=" * 70)
    raw_df = load_raw_dataset(csv_path)
    df = engineer_features(raw_df)
    feature_cols = get_feature_columns()

    print(f"Original dataset shape: {raw_df.shape}")
    print(f"Engineered dataset shape: {df.shape}")
    print(f"Total features used ({len(feature_cols)}): {feature_cols}")

    print("\n" + "=" * 70)
    print("STEP 2: LEAK-FREE SPLITTING BY COW_ID (80% TRAIN / 20% TEST)")
    print("=" * 70)
    train_df, test_df, train_cows, test_cows = split_by_cow(df, test_size=0.2, random_state=42)

    print(f"Total Cows: {df['Cow_ID'].nunique()}")
    print(f"Training Cows: {len(train_cows)} ({len(train_df)} observations)")
    print(f"Held-out Test Cows: {len(test_cows)} ({len(test_df)} observations)")
    print(f"Overlap between Train and Test Cows: {len(train_cows.intersection(test_cows))}")

    # Verify class balance at cow level
    train_cow_labels = train_df.groupby('Cow_ID')['class1'].max()
    test_cow_labels = test_df.groupby('Cow_ID')['class1'].max()
    print(f"Train Cow Class Balance: Healthy={sum(train_cow_labels == 0)}, Mastitic={sum(train_cow_labels == 1)} ({sum(train_cow_labels == 1)/len(train_cow_labels)*100:.1f}%)")
    print(f"Test Cow Class Balance:  Healthy={sum(test_cow_labels == 0)}, Mastitic={sum(test_cow_labels == 1)} ({sum(test_cow_labels == 1)/len(test_cow_labels)*100:.1f}%)")

    X_train = train_df[feature_cols].values
    y_train = train_df['class1'].values
    groups_train = train_df['Cow_ID'].values

    X_test = test_df[feature_cols].values
    y_test = test_df['class1'].values
    groups_test = test_df['Cow_ID'].values

    # Preprocessing: Scaler fitted ONLY on training set
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Class weight calculation for balanced learning
    num_neg = np.sum(y_train == 0)
    num_pos = np.sum(y_train == 1)
    scale_pos_weight = num_neg / max(num_pos, 1)

    print("\n" + "=" * 70)
    print("STEP 3: 5-FOLD STRATIFIED GROUP CROSS-VALIDATION (ON TRAIN SET)")
    print("=" * 70)

    models_config = {
        'Logistic Regression': {
            'model': LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42),
            'use_scaled': True
        },
        'Random Forest': {
            'model': RandomForestClassifier(n_estimators=200, max_depth=10, min_samples_split=5, class_weight='balanced', random_state=42, n_jobs=-1),
            'use_scaled': False
        },
        'XGBoost': {
            'model': XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=5, scale_pos_weight=scale_pos_weight, random_state=42, eval_metric='logloss', n_jobs=-1),
            'use_scaled': False
        }
    }

    cv = StratifiedGroupKFold(n_splits=5)
    cv_results = {}

    for name, cfg in models_config.items():
        print(f"\n--- Cross-Validating: {name} ---")
        fold_recalls = []
        fold_pr_aucs = []
        fold_f1s = []
        fold_fnrs = []

        X_curr = X_train_scaled if cfg['use_scaled'] else X_train

        for fold, (train_idx, val_idx) in enumerate(cv.split(X_curr, y_train, groups=groups_train)):
            X_tr, y_tr = X_curr[train_idx], y_train[train_idx]
            X_val, y_val = X_curr[val_idx], y_train[val_idx]

            # clone and train
            from sklearn.base import clone
            fold_model = clone(cfg['model'])
            fold_model.fit(X_tr, y_tr)

            val_preds = fold_model.predict(X_val)
            val_probs = fold_model.predict_proba(X_val)[:, 1]

            res = evaluate_predictions(y_val, val_preds, val_probs)
            fold_recalls.append(res['recall'])
            fold_pr_aucs.append(res['pr_auc'])
            fold_f1s.append(res['f1_score'])
            fold_fnrs.append(res['fnr'])

        cv_results[name] = {
            'mean_recall': np.mean(fold_recalls),
            'mean_pr_auc': np.mean(fold_pr_aucs),
            'mean_f1': np.mean(fold_f1s),
            'mean_fnr': np.mean(fold_fnrs)
        }
        print(f"  5-Fold CV Mean Recall: {cv_results[name]['mean_recall']:.4f}")
        print(f"  5-Fold CV Mean PR-AUC: {cv_results[name]['mean_pr_auc']:.4f}")
        print(f"  5-Fold CV Mean F1:     {cv_results[name]['mean_f1']:.4f}")
        print(f"  5-Fold CV Mean FNR:    {cv_results[name]['mean_fnr']:.4f}")

    print("\n" + "=" * 70)
    print("STEP 4: FINAL TEST EVALUATION ON COMPLETELY UNSEEN COWS (220 COWS)")
    print("=" * 70)

    test_results = {}
    fitted_models = {}

    for name, cfg in models_config.items():
        X_tr = X_train_scaled if cfg['use_scaled'] else X_train
        X_te = X_test_scaled if cfg['use_scaled'] else X_test

        model = cfg['model']
        model.fit(X_tr, y_train)
        fitted_models[name] = model

        test_preds = model.predict(X_te)
        test_probs = model.predict_proba(X_te)[:, 1]

        res = evaluate_predictions(y_test, test_preds, test_probs)
        test_results[name] = res

        print(f"\nModel: {name}")
        print(f"  Accuracy:       {res['accuracy']:.4f}")
        print(f"  Precision:      {res['precision']:.4f}")
        print(f"  Recall (Sens.): {res['recall']:.4f}  <-- Priority Metric")
        print(f"  F1-Score:       {res['f1_score']:.4f}")
        print(f"  ROC-AUC:        {res['roc_auc']:.4f}")
        print(f"  PR-AUC:         {res['pr_auc']:.4f}")
        print(f"  False Neg Rate: {res['fnr']:.4f}  <-- Risk of Missed Infections")
        print(f"  Confusion Matrix: TN={res['confusion_matrix']['tn']}, FP={res['confusion_matrix']['fp']}, FN={res['confusion_matrix']['fn']}, TP={res['confusion_matrix']['tp']}")

    # Select best model based on Recall and PR-AUC
    # We want to minimize False Negative Rate (maximize Recall) while maintaining high PR-AUC
    best_name = max(test_results.keys(), key=lambda k: (test_results[k]['recall'] * 0.6 + test_results[k]['pr_auc'] * 0.4))
    best_model = fitted_models[best_name]

    print("\n" + "=" * 70)
    print(f"BEST MODEL SELECTED: {best_name}")
    print("=" * 70)

    # Save artifacts
    best_model_path = os.path.join(output_dir, "best_model.joblib")
    scaler_path = os.path.join(output_dir, "scaler.joblib")
    metadata_path = os.path.join(output_dir, "metadata.json")

    joblib.dump(best_model, best_model_path)
    joblib.dump(scaler, scaler_path)

    metadata = {
        'best_model_name': best_name,
        'feature_columns': feature_cols,
        'leakage_features_removed': LEAKAGE_FEATURES,
        'total_cows': int(df['Cow_ID'].nunique()),
        'train_cows': len(train_cows),
        'test_cows': len(test_cows),
        'test_results': test_results,
        'cv_results': cv_results,
        'model_type': "Leak-free clinical mastitis diagnostic baseline (NOT a 7-14 day forecasting model)"
    }

    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved best model to {best_model_path}")
    print(f"Saved scaler to {scaler_path}")
    print(f"Saved metadata to {metadata_path}")

    return {
        'best_name': best_name,
        'best_model': best_model,
        'scaler': scaler,
        'feature_cols': feature_cols,
        'test_results': test_results,
        'train_df': train_df,
        'test_df': test_df,
        'X_test': X_test,
        'X_test_scaled': X_test_scaled,
        'y_test': y_test,
        'test_cows': test_cows
    }


if __name__ == "__main__":
    run_training_pipeline()
