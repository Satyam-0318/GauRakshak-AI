"""
generate_summary_stats.py - Generates summary_stats.csv from reported research paper statistics.
"""

import os
import pandas as pd

def create_summary_stats(output_path="summary_stats.csv"):
    data = [
        # Effect of Season (LactationStage=NA, Parity=NA, MilkYield=NA)
        {"Season": "Winter", "LactationStage": "NA", "Parity": "NA", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.41, "pH_sd": 0.07, "EC_mean": 4.26, "EC_sd": 0.04, "SCC_mean": 0.50, "SCC_sd": 0.02},
        {"Season": "Winter", "LactationStage": "NA", "Parity": "NA", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.64, "pH_sd": 0.09, "EC_mean": 4.70, "EC_sd": 0.05, "SCC_mean": 3.50, "SCC_sd": 0.10},
        {"Season": "Winter", "LactationStage": "NA", "Parity": "NA", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 6.90, "pH_sd": 0.07, "EC_mean": 4.85, "EC_sd": 0.13, "SCC_mean": 13.14, "SCC_sd": 4.20},
        {"Season": "Summer", "LactationStage": "NA", "Parity": "NA", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.65, "pH_sd": 0.02, "EC_mean": 4.30, "EC_sd": 0.02, "SCC_mean": 1.23, "SCC_sd": 0.09},
        {"Season": "Summer", "LactationStage": "NA", "Parity": "NA", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.80, "pH_sd": 0.07, "EC_mean": 4.93, "EC_sd": 0.10, "SCC_mean": 3.52, "SCC_sd": 0.17},
        {"Season": "Summer", "LactationStage": "NA", "Parity": "NA", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 7.01, "pH_sd": 0.02, "EC_mean": 5.74, "EC_sd": 0.19, "SCC_mean": 17.28, "SCC_sd": 4.05},
        {"Season": "Rainy", "LactationStage": "NA", "Parity": "NA", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.75, "pH_sd": 0.02, "EC_mean": 4.48, "EC_sd": 0.06, "SCC_mean": 1.52, "SCC_sd": 0.06},
        {"Season": "Rainy", "LactationStage": "NA", "Parity": "NA", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.91, "pH_sd": 0.01, "EC_mean": 5.01, "EC_sd": 0.06, "SCC_mean": 3.98, "SCC_sd": 0.32},
        {"Season": "Rainy", "LactationStage": "NA", "Parity": "NA", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 7.04, "pH_sd": 0.04, "EC_mean": 5.79, "EC_sd": 0.10, "SCC_mean": 19.04, "SCC_sd": 1.18},

        # Effect of Lactation Stage (Season=NA, Parity=NA, MilkYield=NA)
        {"Season": "NA", "LactationStage": "Early", "Parity": "NA", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.62, "pH_sd": 0.06, "EC_mean": 4.34, "EC_sd": 0.04, "SCC_mean": 0.08, "SCC_sd": 0.09},
        {"Season": "NA", "LactationStage": "Early", "Parity": "NA", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.78, "pH_sd": 0.05, "EC_mean": 4.87, "EC_sd": 0.07, "SCC_mean": 3.27, "SCC_sd": 0.19},
        {"Season": "NA", "LactationStage": "Early", "Parity": "NA", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 6.99, "pH_sd": 0.02, "EC_mean": 5.49, "EC_sd": 0.08, "SCC_mean": 18.50, "SCC_sd": 3.37},
        {"Season": "NA", "LactationStage": "Mid", "Parity": "NA", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.45, "pH_sd": 0.04, "EC_mean": 4.31, "EC_sd": 0.05, "SCC_mean": 1.32, "SCC_sd": 0.12},
        {"Season": "NA", "LactationStage": "Mid", "Parity": "NA", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.77, "pH_sd": 0.04, "EC_mean": 4.98, "EC_sd": 0.08, "SCC_mean": 3.62, "SCC_sd": 0.13},
        {"Season": "NA", "LactationStage": "Mid", "Parity": "NA", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 7.01, "pH_sd": 0.02, "EC_mean": 5.66, "EC_sd": 0.11, "SCC_mean": 17.81, "SCC_sd": 2.12},
        {"Season": "NA", "LactationStage": "Late", "Parity": "NA", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.66, "pH_sd": 0.02, "EC_mean": 4.49, "EC_sd": 0.05, "SCC_mean": 1.48, "SCC_sd": 0.07},
        {"Season": "NA", "LactationStage": "Late", "Parity": "NA", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.88, "pH_sd": 0.02, "EC_mean": 4.92, "EC_sd": 0.05, "SCC_mean": 3.84, "SCC_sd": 0.11},
        {"Season": "NA", "LactationStage": "Late", "Parity": "NA", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 7.05, "pH_sd": 0.02, "EC_mean": 5.98, "EC_sd": 0.13, "SCC_mean": 27.51, "SCC_sd": 1.35},

        # Effect of Parity (Season=NA, LactationStage=NA, MilkYield=NA)
        {"Season": "NA", "LactationStage": "NA", "Parity": "Primiparous", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.68, "pH_sd": 0.06, "EC_mean": 4.28, "EC_sd": 0.11, "SCC_mean": 1.29, "SCC_sd": 0.09},
        {"Season": "NA", "LactationStage": "NA", "Parity": "Primiparous", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.85, "pH_sd": 0.02, "EC_mean": 4.79, "EC_sd": 0.05, "SCC_mean": 3.33, "SCC_sd": 0.13},
        {"Season": "NA", "LactationStage": "NA", "Parity": "Primiparous", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 6.98, "pH_sd": 0.05, "EC_mean": 5.27, "EC_sd": 0.15, "SCC_mean": 10.44, "SCC_sd": 1.07},
        {"Season": "NA", "LactationStage": "NA", "Parity": "2nd", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.56, "pH_sd": 0.02, "EC_mean": 4.31, "EC_sd": 0.06, "SCC_mean": 1.30, "SCC_sd": 0.11},
        {"Season": "NA", "LactationStage": "NA", "Parity": "2nd", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.76, "pH_sd": 0.05, "EC_mean": 4.77, "EC_sd": 0.10, "SCC_mean": 3.48, "SCC_sd": 0.18},
        {"Season": "NA", "LactationStage": "NA", "Parity": "2nd", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 6.94, "pH_sd": 0.04, "EC_mean": 5.25, "EC_sd": 0.13, "SCC_mean": 21.55, "SCC_sd": 2.24},
        {"Season": "NA", "LactationStage": "NA", "Parity": "3rd", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.71, "pH_sd": 0.01, "EC_mean": 4.44, "EC_sd": 0.03, "SCC_mean": 1.46, "SCC_sd": 0.08},
        {"Season": "NA", "LactationStage": "NA", "Parity": "3rd", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.91, "pH_sd": 0.05, "EC_mean": 5.31, "EC_sd": 0.22, "SCC_mean": 3.46, "SCC_sd": 0.17},
        {"Season": "NA", "LactationStage": "NA", "Parity": "3rd", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 7.08, "pH_sd": 0.03, "EC_mean": 6.40, "EC_sd": 0.24, "SCC_mean": 29.76, "SCC_sd": 4.00},
        {"Season": "NA", "LactationStage": "NA", "Parity": "4th and above", "MilkYield": "NA", "Stage": "Healthy", "pH_mean": 6.27, "pH_sd": 0.07, "EC_mean": 4.39, "EC_sd": 0.05, "SCC_mean": 1.49, "SCC_sd": 0.06},
        {"Season": "NA", "LactationStage": "NA", "Parity": "4th and above", "MilkYield": "NA", "Stage": "Subclinical", "pH_mean": 6.76, "pH_sd": 0.05, "EC_mean": 4.93, "EC_sd": 0.04, "SCC_mean": 3.71, "SCC_sd": 0.11},
        {"Season": "NA", "LactationStage": "NA", "Parity": "4th and above", "MilkYield": "NA", "Stage": "Clinical", "pH_mean": 7.01, "pH_sd": 0.01, "EC_mean": 5.71, "EC_sd": 0.07, "SCC_mean": 23.81, "SCC_sd": 1.72},

        # Effect of Milk Production (Season=NA, LactationStage=NA, Parity=NA)
        {"Season": "NA", "LactationStage": "NA", "Parity": "NA", "MilkYield": "0-4", "Stage": "Healthy", "pH_mean": 6.60, "pH_sd": 0.03, "EC_mean": 4.52, "EC_sd": 0.02, "SCC_mean": 1.75, "SCC_sd": 0.06},
        {"Season": "NA", "LactationStage": "NA", "Parity": "NA", "MilkYield": "0-4", "Stage": "Subclinical", "pH_mean": 6.81, "pH_sd": 0.04, "EC_mean": 5.00, "EC_sd": 0.09, "SCC_mean": 3.71, "SCC_sd": 0.17},
        {"Season": "NA", "LactationStage": "NA", "Parity": "NA", "MilkYield": "0-4", "Stage": "Clinical", "pH_mean": 6.99, "pH_sd": 0.02, "EC_mean": 5.91, "EC_sd": 0.10, "SCC_mean": 26.79, "SCC_sd": 1.94},
        {"Season": "NA", "LactationStage": "NA", "Parity": "NA", "MilkYield": "5-10", "Stage": "Healthy", "pH_mean": 6.40, "pH_sd": 0.07, "EC_mean": 4.41, "EC_sd": 0.03, "SCC_mean": 1.47, "SCC_sd": 0.06},
        {"Season": "NA", "LactationStage": "NA", "Parity": "NA", "MilkYield": "5-10", "Stage": "Subclinical", "pH_mean": 6.78, "pH_sd": 0.04, "EC_mean": 4.92, "EC_sd": 0.06, "SCC_mean": 3.40, "SCC_sd": 0.08},
        {"Season": "NA", "LactationStage": "NA", "Parity": "NA", "MilkYield": "5-10", "Stage": "Clinical", "pH_mean": 7.02, "pH_sd": 0.02, "EC_mean": 5.45, "EC_sd": 0.08, "SCC_mean": 19.69, "SCC_sd": 1.41},
        {"Season": "NA", "LactationStage": "NA", "Parity": "NA", "MilkYield": ">10", "Stage": "Healthy", "pH_mean": 6.51, "pH_sd": 0.09, "EC_mean": 4.27, "EC_sd": 0.05, "SCC_mean": 1.22, "SCC_sd": 0.08},
        {"Season": "NA", "LactationStage": "NA", "Parity": "NA", "MilkYield": ">10", "Stage": "Subclinical", "pH_mean": 6.86, "pH_sd": 0.07, "EC_mean": 4.82, "EC_sd": 0.05, "SCC_mean": 3.71, "SCC_sd": 0.25},
        {"Season": "NA", "LactationStage": "NA", "Parity": "NA", "MilkYield": ">10", "Stage": "Clinical", "pH_mean": 7.05, "pH_sd": 0.03, "EC_mean": 5.47, "EC_sd": 0.09, "SCC_mean": 14.70, "SCC_sd": 1.30},
    ]

    cols = ["Season", "LactationStage", "Parity", "MilkYield", "Stage", "pH_mean", "pH_sd", "EC_mean", "EC_sd", "SCC_mean", "SCC_sd"]
    df = pd.DataFrame(data, columns=cols)
    df.to_csv(output_path, index=False)
    print(f"Successfully generated '{output_path}' with {len(df)} group rows.")
    return df

if __name__ == "__main__":
    create_summary_stats()
