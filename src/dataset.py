"""
dataset.py - Leak-free Data Preprocessing and Feature Engineering
Project: AI/ML-Based Predictive Modelling for Early Forecasting of Bovine Mastitis
PSID: SIH26019
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedGroupKFold, train_test_split

# Features to drop due to leakage
LEAKAGE_FEATURES = ['Milk_visibility', 'Hardness', 'Pain']

# Final expected features after engineering
RAW_KEPT_FEATURES = [
    'Breed',
    'Months after giving birth',
    'Previous_Mastits_status',
    'Temperature',
    'IUFL', 'EUFL', 'IUFR', 'EUFR',
    'IURL', 'EURL', 'IURR', 'EURR'
]

ENGINEERED_FEATURE_NAMES = [
    'asym_IU',
    'asym_EU',
    'std_IU',
    'std_EU',
    'front_rear_ratio',
    'left_right_ratio',
    'diff_FL',
    'diff_FR',
    'diff_RL',
    'diff_RR',
    'mean_differential',
    'high_risk_lactation',
    'history_risk',
    'temp_deviation'
]


def load_raw_dataset(csv_path="clinical_mastitis_cows.csv"):
    """Loads raw dataset and validates structure."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")
    df = pd.read_csv(csv_path)
    return df


def engineer_features(df):
    """
    Cleans dataset by dropping leakage features and engineering
    scientifically sound udder asymmetry, differential, and risk features.
    """
    df = df.copy()

    # Drop leakage features
    for feat in LEAKAGE_FEATURES:
        if feat in df.columns:
            df = df.drop(columns=[feat])

    # Convert numeric fields
    numeric_cols = [
        'Months after giving birth', 'Previous_Mastits_status',
        'IUFL', 'EUFL', 'IUFR', 'EUFR',
        'IURL', 'EURL', 'IURR', 'EURR',
        'Temperature'
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Binary target
    df['class1'] = pd.to_numeric(df['class1'], errors='coerce').astype(int)

    # 1. Udder Quarter Asymmetries (Max - Min across quarters)
    iu_cols = ['IUFL', 'IUFR', 'IURL', 'IURR']
    eu_cols = ['EUFL', 'EUFR', 'EURL', 'EURR']

    df['asym_IU'] = df[iu_cols].max(axis=1) - df[iu_cols].min(axis=1)
    df['asym_EU'] = df[eu_cols].max(axis=1) - df[eu_cols].min(axis=1)

    # 2. Standard deviation across quarters
    df['std_IU'] = df[iu_cols].std(axis=1)
    df['std_EU'] = df[eu_cols].std(axis=1)

    # 3. Spatial Ratios (Front vs Rear, Left vs Right)
    df['front_rear_ratio'] = (df['IUFL'] + df['IUFR']) / (df['IURL'] + df['IURR'] + 1e-5)
    df['left_right_ratio'] = (df['IUFL'] + df['IURL']) / (df['IUFR'] + df['IURR'] + 1e-5)

    # 4. Differentials between External (EU) and Internal (IU) for each quarter
    df['diff_FL'] = df['EUFL'] - df['IUFL']
    df['diff_FR'] = df['EUFR'] - df['IUFR']
    df['diff_RL'] = df['EURL'] - df['IURL']
    df['diff_RR'] = df['EURR'] - df['IURR']
    df['mean_differential'] = (df['diff_FL'] + df['diff_FR'] + df['diff_RL'] + df['diff_RR']) / 4.0

    # 5. Domain Risk Indicators
    # Months 1 & 2 are peak lactation stress / highest mastitis risk
    df['high_risk_lactation'] = df['Months after giving birth'].apply(lambda x: 1 if x in [1, 2] else 0)
    df['history_risk'] = df['Previous_Mastits_status'].apply(lambda x: 1 if x == 1 else 0)

    # Bovine physiological temperature norm: 38.6 C (or cohort median)
    norm_temp = 38.6
    df['temp_deviation'] = (df['Temperature'] - norm_temp).abs()

    # One-hot / binary encode Breed ('Jersey' -> 0, 'hostlene' -> 1)
    df['Breed_Holstein'] = df['Breed'].apply(lambda x: 1 if str(x).lower().startswith('host') or str(x).lower().startswith('hol') else 0)

    return df


def get_feature_columns():
    """Returns list of active feature names used for modeling."""
    feature_cols = [
        'Breed_Holstein',
        'Months after giving birth',
        'Previous_Mastits_status',
        'Temperature',
        'IUFL', 'EUFL', 'IUFR', 'EUFR',
        'IURL', 'EURL', 'IURR', 'EURR',
        'asym_IU', 'asym_EU', 'std_IU', 'std_EU',
        'front_rear_ratio', 'left_right_ratio',
        'diff_FL', 'diff_FR', 'diff_RL', 'diff_RR',
        'mean_differential', 'high_risk_lactation',
        'history_risk', 'temp_deviation'
    ]
    return feature_cols


def split_by_cow(df, test_size=0.2, random_state=42):
    """
    Performs leak-free train/test splitting grouped by Cow_ID.
    Guarantees 0% cow overlap between train and test sets.
    Preserves cow-level class balance.
    """
    cow_df = df.groupby('Cow_ID').agg({
        'class1': 'max'
    }).reset_index()

    train_cows, test_cows = train_test_split(
        cow_df['Cow_ID'],
        test_size=test_size,
        stratify=cow_df['class1'],
        random_state=random_state
    )

    train_cows_set = set(train_cows)
    test_cows_set = set(test_cows)

    assert len(train_cows_set.intersection(test_cows_set)) == 0, "Cow_ID overlap detected!"

    train_df = df[df['Cow_ID'].isin(train_cows_set)].copy()
    test_df = df[df['Cow_ID'].isin(test_cows_set)].copy()

    return train_df, test_df, train_cows_set, test_cows_set
