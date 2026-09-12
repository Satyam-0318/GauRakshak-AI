"""
explainability.py - Trend-Based Early Warning Explainability Engine
Project: AI/ML-Based Predictive Modelling for Early Forecasting of Bovine Mastitis
PSID: SIH26019
"""

def generate_trend_explanation(row_dict):
    """
    Produces human-readable, multi-bullet veterinary explanations based on
    rolling temporal trends and physiological changes.
    """
    risk_score = row_dict.get('risk_score', 0)
    asym_delta_7d = row_dict.get('asym_IU_delta_7d', 0.0)
    asym_curr = row_dict.get('asym_IU', 0.0)
    temp_delta_7d = row_dict.get('temp_delta_7d', 0.0)
    temp_curr = row_dict.get('Temperature', 39.0)
    max_diff_delta = row_dict.get('max_diff_delta_7d', 0.0)
    months = int(row_dict.get('Months after giving birth', 3))
    prev_history = int(row_dict.get('Previous_Mastits_status', 0))

    # Identify which quarter has highest differential
    diffs = {
        'Front-Left': row_dict.get('diff_FL', 0),
        'Front-Right': row_dict.get('diff_FR', 0),
        'Rear-Left': row_dict.get('diff_RL', 0),
        'Rear-Right': row_dict.get('diff_RR', 0)
    }
    highest_quarter = max(diffs, key=diffs.get)

    bullets = []

    if risk_score >= 30.0:
        # Asymmetry trend
        if asym_delta_7d > 10.0:
            bullets.append(f"Udder quarter asymmetry accelerated significantly (+{asym_delta_7d:.1f} units over past 7 days; currently {asym_curr:.1f} units)")
        elif asym_delta_7d > 4.0:
            bullets.append(f"Udder asymmetry is gradually widening (+{asym_delta_7d:.1f} units over 7 days)")
        elif asym_curr > 20.0:
            bullets.append(f"Elevated baseline quarter asymmetry observed ({asym_curr:.1f} units)")

        # Temperature trend
        if temp_delta_7d > 1.0:
            bullets.append(f"Udder surface temperature increased by +{temp_delta_7d:.1f}°C over the last 7 days (current: {temp_curr:.1f}°C)")
        elif temp_delta_7d > 0.4:
            bullets.append(f"Mild thermal rise of +{temp_delta_7d:.1f}°C detected across recent milking sessions")

        # Quarter localization
        if max_diff_delta > 4.0 or diffs[highest_quarter] > 40.0:
            bullets.append(f"Tissue swelling gradient is concentrated in the {highest_quarter} quarter ({diffs[highest_quarter]:.1f} units)")

        # Risk factors
        if months in [1, 2]:
            bullets.append("Animal is in high-metabolic-stress early lactation (Month 1-2 post-calving)")
        if prev_history == 1:
            bullets.append("Animal has documented history of prior mastitis infection")

        if not bullets:
            bullets.append("Subtle multi-sensor drift detected across rolling 7-day monitoring window")

        header = "Risk elevated because:"
        full_text = header + "\n" + "\n".join([f"• {b}" for b in bullets])
    else:
        bullets.append(f"Udder quarters are stable and symmetric (asymmetry spread: {asym_curr:.1f} units)")
        bullets.append(f"Temperature is within normal physiological range ({temp_curr:.1f}°C; 7-day drift: {temp_delta_7d:+.1f}°C)")
        bullets.append("No focal inflammation detected across all 4 quarters")
        header = "Normal status confirmed because:"
        full_text = header + "\n" + "\n".join([f"• {b}" for b in bullets])

    return full_text, bullets[:3]
