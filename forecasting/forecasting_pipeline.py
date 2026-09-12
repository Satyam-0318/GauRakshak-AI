"""
forecasting_pipeline.py - End-to-End Early Mastitis Forecasting & Case Study Pipeline
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
from forecasting.forecasting_model import build_temporal_features, get_forecasting_feature_names
from forecasting.risk_scoring import compute_risk_score, get_risk_band
from forecasting.explainability import generate_trend_explanation


def generate_svg_timeline(timeline_df, cow_id, onset_day, output_path="forecasting/risk_timeline.svg"):
    """
    Generates a clean vector SVG graphic visualizing the 0-100 risk score
    trajectory and 7-14 day early warning window for the showcase cow.
    """
    df_cow = timeline_df.sort_values(by='Day').copy()
    days = df_cow['Day'].values
    scores = df_cow['risk_score'].values
    days_to_onset = df_cow['days_to_onset'].values

    # SVG Canvas dimensions
    width = 900
    height = 420
    margin_left = 70
    margin_right = 50
    margin_top = 60
    margin_bottom = 60

    plot_w = width - margin_left - margin_right
    plot_h = height - margin_top - margin_bottom

    min_day = min(days)
    max_day = max(days)

    def x_scale(d):
        return margin_left + ((d - min_day) / (max_day - min_day)) * plot_w

    def y_scale(s):
        return margin_top + plot_h - (s / 100.0) * plot_h

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" style="background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">']

    # Title & Subtitle
    svg.append(f'<text x="{width/2}" y="28" fill="#f8fafc" font-size="16" font-weight="bold" text-anchor="middle">7–14 Day Early Mastitis Forecasting Trajectory ({cow_id})</text>')
    svg.append(f'<text x="{width/2}" y="48" fill="#94a3b8" font-size="12" text-anchor="middle">Prototype Simulation Grounded in Empirical Bovine Quarter Asymmetry</text>')

    # Background Risk Bands
    # 80-100: Critical
    y80 = y_scale(80)
    y100 = y_scale(100)
    svg.append(f'<rect x="{margin_left}" y="{y100}" width="{plot_w}" height="{y80 - y100}" fill="#ef4444" fill-opacity="0.12"/>')
    svg.append(f'<text x="{width - margin_right - 10}" y="{y100 + 15}" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="end">CRITICAL RISK (80-100)</text>')

    # 60-80: High
    y60 = y_scale(60)
    svg.append(f'<rect x="{margin_left}" y="{y80}" width="{plot_w}" height="{y60 - y80}" fill="#f97316" fill-opacity="0.10"/>')
    svg.append(f'<text x="{width - margin_right - 10}" y="{y80 + 15}" fill="#f97316" font-size="10" font-weight="bold" text-anchor="end">HIGH RISK (60-79)</text>')

    # 30-60: Moderate (Early Alarm)
    y30 = y_scale(30)
    svg.append(f'<rect x="{margin_left}" y="{y60}" width="{plot_w}" height="{y30 - y60}" fill="#eab308" fill-opacity="0.10"/>')
    svg.append(f'<text x="{width - margin_right - 10}" y="{y60 + 15}" fill="#eab308" font-size="10" font-weight="bold" text-anchor="end">MODERATE RISK / EARLY ALARM (30-59)</text>')

    # 0-30: Low
    y0 = y_scale(0)
    svg.append(f'<rect x="{margin_left}" y="{y30}" width="{plot_w}" height="{y0 - y30}" fill="#22c55e" fill-opacity="0.08"/>')
    svg.append(f'<text x="{width - margin_right - 10}" y="{y30 + 15}" fill="#22c55e" font-size="10" font-weight="bold" text-anchor="end">LOW RISK (0-29)</text>')

    # Highlight 7-14 Day Early Warning Zone (from Day onset - 14 to Day onset - 7)
    day_m14 = onset_day - 14
    day_m7 = onset_day - 7
    if day_m14 >= min_day and day_m7 <= max_day:
        x_m14 = x_scale(day_m14)
        x_m7 = x_scale(day_m7)
        svg.append(f'<rect x="{x_m14}" y="{margin_top}" width="{x_m7 - x_m14}" height="{plot_h}" fill="#38bdf8" fill-opacity="0.15" stroke="#38bdf8" stroke-dasharray="4,4" stroke-width="1"/>')
        svg.append(f'<text x="{(x_m14 + x_m7)/2}" y="{margin_top + 18}" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">★ 7–14 DAY FORECAST HORIZON</text>')

    # Clinical Onset Vertical Line
    if min_day <= onset_day <= max_day:
        x_ons = x_scale(onset_day)
        svg.append(f'<line x1="{x_ons}" y1="{margin_top}" x2="{x_ons}" y2="{margin_top + plot_h}" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,3"/>')
        svg.append(f'<text x="{x_ons + 5}" y="{margin_top + 35}" fill="#f43f5e" font-size="11" font-weight="bold">CLINICAL ONSET (Day {onset_day})</text>')

    # Grid Lines & Y-Axis Labels
    for score_tick in [0, 30, 60, 80, 100]:
        yt = y_scale(score_tick)
        svg.append(f'<line x1="{margin_left}" y1="{yt}" x2="{width - margin_right}" y2="{yt}" stroke="#334155" stroke-width="1"/>')
        svg.append(f'<text x="{margin_left - 10}" y="{yt + 4}" fill="#94a3b8" font-size="11" text-anchor="end">{score_tick}</text>')

    # X-Axis Labels
    for d in range(int(min_day), int(max_day) + 1, 5):
        xt = x_scale(d)
        svg.append(f'<line x1="{xt}" y1="{margin_top + plot_h}" x2="{xt}" y2="{margin_top + plot_h + 6}" stroke="#64748b" stroke-width="1"/>')
        dto = d - onset_day
        lbl = f"D{d}" if dto != 0 else f"D{d}(Onset)"
        svg.append(f'<text x="{xt}" y="{margin_top + plot_h + 20}" fill="#94a3b8" font-size="10" text-anchor="middle">{lbl}</text>')

    svg.append(f'<text x="{margin_left + plot_w/2}" y="{height - 15}" fill="#94a3b8" font-size="11" font-weight="bold" text-anchor="middle">Monitoring Timeline (Days)</text>')
    svg.append(f'<text x="22" y="{margin_top + plot_h/2}" fill="#94a3b8" font-size="11" font-weight="bold" text-anchor="middle" transform="rotate(-90, 22, {margin_top + plot_h/2})">Risk Score (0–100)</text>')

    # Draw Risk Line
    points = []
    for d, s in zip(days, scores):
        points.append(f"{x_scale(d):.1f},{y_scale(s):.1f}")
    svg.append(f'<polyline points="{" ".join(points)}" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round"/>')

    # Data Points & Milestones
    milestones = {
        -14: ("Day -14 (Score {:.1f})", "#22c55e"),
        -10: ("Day -10 (Score {:.1f})", "#22c55e"),
        -7: ("Day -7 Early Alarm (Score {:.1f})", "#eab308"),
        -3: ("Day -3 High Risk (Score {:.1f})", "#f97316"),
        0: ("Day 0 Onset (Score {:.1f})", "#ef4444")
    }

    for d, s, dto in zip(days, scores, days_to_onset):
        cx = x_scale(d)
        cy = y_scale(s)
        # Point color by risk band
        if s >= 80:
            pt_col = "#ef4444"
        elif s >= 60:
            pt_col = "#f97316"
        elif s >= 30:
            pt_col = "#eab308"
        else:
            pt_col = "#22c55e"

        svg.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="4.5" fill="{pt_col}" stroke="#0f172a" stroke-width="1.5"/>')

        if dto in milestones:
            fmt, col = milestones[dto]
            txt = fmt.format(s)
            svg.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="7" fill="none" stroke="{col}" stroke-width="2"/>')
            # Text position
            ty = cy - 14 if cy > margin_top + 40 else cy + 20
            svg.append(f'<text x="{cx:.1f}" y="{ty:.1f}" fill="{col}" font-size="10" font-weight="bold" text-anchor="middle">{txt}</text>')

    svg.append('</svg>')
    svg_content = "\n".join(svg)

    with open(output_path, "w") as f:
        f.write(svg_content)
    print(f"Generated Risk Timeline SVG: {output_path}")


def run_forecasting_pipeline(
    csv_path="forecasting/synthetic_longitudinal_cows.csv",
    model_path="models/forecasting_model.joblib"
):
    print("=" * 70)
    print("STEP 5: RUNNING FORECASTING PIPELINE & PRODUCING CASE STUDIES")
    print("=" * 70)

    raw_df = pd.read_csv(csv_path)
    df = build_temporal_features(raw_df)
    feature_cols = get_forecasting_feature_names()

    model = joblib.load(model_path)
    X = df[feature_cols].values

    df['prob_onset_14d'] = model.predict_proba(X)[:, 1]

    # Compute calibrated 0-100 risk score
    risk_scores = []
    risk_bands = []
    explanations = []
    top_factors = []

    for idx, row in df.iterrows():
        p = row['prob_onset_14d']
        asym_c = row['asym_IU']
        asym_d = row['asym_IU_delta_7d']
        temp_d = row['temp_delta_7d']
        score = compute_risk_score(p, asym_curr=asym_c, asym_delta_7d=asym_d, temp_delta_7d=temp_d)
        band_info = get_risk_band(score)

        row_dict = row.to_dict()
        row_dict['risk_score'] = score
        full_exp, top_3 = generate_trend_explanation(row_dict)

        risk_scores.append(score)
        risk_bands.append(band_info['band'])
        explanations.append(full_exp)
        top_factors.append(" | ".join(top_3))

    df['risk_score'] = risk_scores
    df['risk_band'] = risk_bands
    df['explanation'] = explanations
    df['top_factors'] = top_factors

    # Save sample results CSV
    out_csv = "forecasting/sample_forecasting_results.csv"
    output_cols = [
        'Cow_ID', 'Day', 'days_to_onset', 'is_clinical_active',
        'Temperature', 'asym_IU', 'asym_IU_delta_7d', 'temp_delta_7d',
        'prob_onset_14d', 'risk_score', 'risk_band', 'top_factors'
    ]
    df[output_cols].to_csv(out_csv, index=False)
    print(f"Saved forecasting predictions table to: {out_csv}")

    # Case Studies Generation (Step 5.9)
    print("\n" + "=" * 70)
    print("STEP 5.9: SYNTHETIC COW CASE STUDIES DEMONSTRATION")
    print("=" * 70)

    # 1. Showcase Cow: synth_cow_010 exhibits the canonical Day -14 -> -10 -> -7 -> -3 -> 0 progression
    showcase_cow_id = 'synth_cow_010'
    cow_df = df[df['Cow_ID'] == showcase_cow_id]
    onset_d = cow_df['onset_day'].iloc[0]

    print(f"\n★ SHOWCASE CASE 1: CANONICAL PRE-CLINICAL PROGRESSION ({showcase_cow_id}, Onset on Day {onset_d})")
    milestone_days = [onset_d - 14, onset_d - 10, onset_d - 7, onset_d - 3, onset_d]
    for d in milestone_days:
        r = cow_df[cow_df['Day'] == d].iloc[0]
        dto = r['days_to_onset']
        lbl = f"Day {dto}" if dto != 0 else "Day 0 (Clinical Onset)"
        print(f"  [{lbl:22s} | Day {d:2d}]: Score = {r['risk_score']:4.1f} ({r['risk_band']:14s}) | Prob = {r['prob_onset_14d']*100:4.1f}% | Asym_IU = {r['asym_IU']:4.1f} (7d Δ: {r['asym_IU_delta_7d']:+4.1f}) | Temp = {r['Temperature']:.1f}°C")
        print(f"    Top Drivers: {r['top_factors']}")

    # Generate timeline SVG for showcase cow
    generate_svg_timeline(cow_df, showcase_cow_id, onset_d, "forecasting/risk_timeline.svg")

    # 2. Case 2: Acute Rapid Onset Cow
    case2_cow_id = 'synth_cow_006'
    c2_df = df[df['Cow_ID'] == case2_cow_id]
    c2_onset = c2_df['onset_day'].iloc[0]
    print(f"\n★ CASE 2: RAPID ONSET PREDICTED EARLY ({case2_cow_id}, Onset on Day {c2_onset})")
    for d in [c2_onset - 10, c2_onset - 7, c2_onset - 3, c2_onset]:
        r = c2_df[c2_df['Day'] == d].iloc[0]
        print(f"  Day {d} (Onset - {c2_onset - d}d): Risk Score = {r['risk_score']:.1f} [{r['risk_band']}] | Drivers: {r['top_factors']}")

    # 3. Case 3: High Risk Cow with Previous Mastitis History
    hist_sick_cows = df[(df['is_sick_cow'] == 1) & (df['Previous_Mastits_status'] == 1)]['Cow_ID'].unique()
    case3_cow_id = hist_sick_cows[0] if len(hist_sick_cows) > 0 else sick_cows[2]
    c3_df = df[df['Cow_ID'] == case3_cow_id]
    c3_onset = c3_df['onset_day'].iloc[0]
    print(f"\n★ CASE 3: HIGH-RISK ANIMAL WITH PREVIOUS MASTITIS ({case3_cow_id}, Onset on Day {c3_onset})")
    for d in [c3_onset - 12, c3_onset - 7, c3_onset - 1]:
        r = c3_df[c3_df['Day'] == d].iloc[0]
        print(f"  Day {d} (Onset - {c3_onset - d}d): Risk Score = {r['risk_score']:.1f} [{r['risk_band']}] | Drivers: {r['top_factors']}")

    # 4. Case 4: True Healthy Control Cow (Stable Low Risk)
    healthy_cows = df[df['is_sick_cow'] == 0]['Cow_ID'].unique()
    case4_cow_id = healthy_cows[0]
    c4_df = df[df['Cow_ID'] == case4_cow_id]
    print(f"\n★ CASE 4: TRUE HEALTHY CONTROL COW ({case4_cow_id}, 45 Days Healthy)")
    for d in [10, 20, 30, 40]:
        r = c4_df[c4_df['Day'] == d].iloc[0]
        print(f"  Day {d}: Risk Score = {r['risk_score']:.1f} [{r['risk_band']}] | Asym = {r['asym_IU']:.1f} | Drivers: {r['top_factors']}")

    # 5. Case 5: Healthy Cow with Symmetric Heat Stress (False Alarm Resistance)
    # Cow index divisible by 15 had heat stress between Day 18 and 21
    heat_cows = [c for c in healthy_cows if int(c.split('_')[-1]) % 15 == 0]
    case5_cow_id = heat_cows[0] if heat_cows else healthy_cows[1]
    c5_df = df[df['Cow_ID'] == case5_cow_id]
    print(f"\n★ CASE 5: FALSE ALARM RESISTANCE DURING TRANSIENT HEAT STRESS ({case5_cow_id})")
    for d in [15, 19, 23]:
        r = c5_df[c5_df['Day'] == d].iloc[0]
        print(f"  Day {d}: Risk Score = {r['risk_score']:.1f} [{r['risk_band']}] | Temp = {r['Temperature']:.1f}°C | Asym = {r['asym_IU']:.1f} | Drivers: {r['top_factors']}")

    # Collect case summary dict
    cases_summary = {
        'showcase_case_1': {
            'cow_id': showcase_cow_id,
            'onset_day': int(onset_d),
            'milestones': [
                {'day_to_onset': int(d - onset_d), 'day': int(d), 'score': float(cow_df[cow_df['Day'] == d]['risk_score'].iloc[0]), 'band': str(cow_df[cow_df['Day'] == d]['risk_band'].iloc[0])}
                for d in milestone_days
            ]
        },
        'case_2_acute': {'cow_id': case2_cow_id, 'onset_day': int(c2_onset)},
        'case_3_history': {'cow_id': case3_cow_id, 'onset_day': int(c3_onset)},
        'case_4_control': {'cow_id': case4_cow_id, 'mean_score': float(c4_df['risk_score'].mean())},
        'case_5_heat_stress': {'cow_id': case5_cow_id, 'peak_heat_score': float(c5_df[c5_df['Day'] == 19]['risk_score'].iloc[0])}
    }

    with open("forecasting/case_studies_summary.json", "w") as f:
        json.dump(cases_summary, f, indent=2)

    return df, cases_summary


if __name__ == "__main__":
    run_forecasting_pipeline()
