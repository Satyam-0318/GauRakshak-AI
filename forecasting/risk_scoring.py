"""
risk_scoring.py - Calibrated Early Warning Risk Scoring Engine (0-100)
Project: AI/ML-Based Predictive Modelling for Early Forecasting of Bovine Mastitis
PSID: SIH26019

SCIENTIFIC NOTICE:
These risk bands are prototype definitions designed for demonstration and SIH evaluation.
They require on-farm clinical and veterinary validation before deployment.
"""

import numpy as np


def compute_risk_score(probability, asym_curr=5.0, asym_delta_7d=0.0, temp_delta_7d=0.0):
    """
    Computes a 0-100 calibrated risk score blending model probability
    and physical subclinical biomarker progression.
    Guarantees smooth progression through the prototype risk bands:
      0-29: LOW RISK
      30-59: MODERATE RISK (Early Alarm)
      60-79: HIGH RISK
      80-100: CRITICAL RISK (Impending/Active Onset)
    """
    # Base probability scaled to 70 points max
    base = probability * 60.0

    # Physiological physical indicators (up to 40 points)
    # 1. Asymmetry magnitude
    asym_score = 0.0
    if asym_curr > 60.0:
        asym_score = 25.0
    elif asym_curr > 40.0:
        asym_score = 18.0
    elif asym_curr > 25.0:
        asym_score = 12.0
    elif asym_curr > 14.0:
        asym_score = 6.0
    elif asym_curr > 8.0:
        asym_score = 2.0

    # 2. 7-day Asymmetry Velocity
    vel_score = 0.0
    if asym_delta_7d > 25.0:
        vel_score = 10.0
    elif asym_delta_7d > 12.0:
        vel_score = 6.0
    elif asym_delta_7d > 5.0:
        vel_score = 3.0

    # 3. Temperature Drift
    temp_score = 0.0
    if temp_delta_7d > 1.5:
        temp_score = 5.0
    elif temp_delta_7d > 0.6:
        temp_score = 2.5

    total = base + asym_score + vel_score + temp_score
    return round(float(np.clip(total, 0.0, 100.0)), 1)


def get_risk_band(risk_score):
    """
    Maps 0-100 risk score to prototype risk bands.
    """
    if risk_score >= 80.0:
        return {
            'band': "CRITICAL RISK",
            'code': "CRITICAL",
            'color': "#dc2626", # Red
            'suggested_action': "Immediate veterinary check, isolate animal, perform California Mastitis Test (CMT) on individual quarters.",
            'forecast_window': "Impending clinical onset within 1-3 days."
        }
    elif risk_score >= 60.0:
        return {
            'band': "HIGH RISK",
            'code': "HIGH",
            'color': "#ea580c", # Orange
            'suggested_action': "High probability of clinical onset in next 4-7 days. Apply barrier teat dips, check quarter conductivity, increase monitoring frequency.",
            'forecast_window': "Predicted onset window: 4-7 days."
        }
    elif risk_score >= 30.0:
        return {
            'band': "MODERATE RISK",
            'code': "MODERATE",
            'color': "#ca8a04", # Yellow
            'suggested_action': "Subclinical inflammatory drift detected. Early warning window (7-14 days). Record quarter milk yield drops, inspect milking cluster alignment.",
            'forecast_window': "Early warning window: 7-14 days before clinical symptoms."
        }
    else:
        return {
            'band': "LOW RISK",
            'code': "LOW",
            'color': "#16a34a", # Green
            'suggested_action': "Normal physiological baseline. Routine milking protocol.",
            'forecast_window': "No onset indicated in 14-day horizon."
        }
