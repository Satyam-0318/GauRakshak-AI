"""
eda.py - Exploratory Data Analysis for the Bovine Mastitis Synthetic Dataset.
Generates comprehensive visual plots: class balance, feature distributions, and correlation heatmap.
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid", font_scale=1.1)

def run_eda(
    data_path="synthetic_dataset.csv",
    output_dir="."
):
    """
    Performs EDA on the synthetic mastitis dataset and saves visualization plots.
    """
    df = pd.read_csv(data_path)
    print("\n" + "=" * 60)
    print(" EXPLORATORY DATA ANALYSIS (EDA)")
    print("=" * 60)
    print(f"Dataset shape: {df.shape}")
    print(f"\nMissing values per column:\n{df.isnull().sum()}")
    print(f"\nClass counts:\n{df['Stage'].value_counts()}")
    
    # 1. Class Balance Plot
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Total Stage count
    palette = {"Healthy": "#2ecc71", "Subclinical": "#f39c12", "Clinical": "#e74c3c"}
    sns.countplot(data=df, x="Stage", hue="Stage", palette=palette, ax=axes[0], legend=False)
    axes[0].set_title("Target Class Distribution (Stage)", fontsize=14, fontweight="bold")
    axes[0].set_ylabel("Number of Samples")
    for p in axes[0].patches:
        axes[0].annotate(f"{int(p.get_height())}", (p.get_x() + p.get_width() / 2., p.get_height() / 2),
                         ha='center', va='center', fontsize=12, color='white', fontweight='bold')
        
    # Group counts across covariates
    cov_counts = {
        "Season": df[df["Season"] != "NA"]["Season"].nunique(),
        "LactationStage": df[df["LactationStage"] != "NA"]["LactationStage"].nunique(),
        "Parity": df[df["Parity"] != "NA"]["Parity"].nunique(),
        "MilkYield": df[df["MilkYield"] != "NA"]["MilkYield"].nunique()
    }
    axes[1].bar(cov_counts.keys(), cov_counts.values(), color="#3498db")
    axes[1].set_title("Categorical Group Levels in Study Design", fontsize=14, fontweight="bold")
    axes[1].set_ylabel("Number of Factor Levels")
    for i, v in enumerate(cov_counts.values()):
        axes[1].text(i, v / 2, str(v), ha='center', va='center', color='white', fontweight='bold', fontsize=12)
        
    plt.tight_layout()
    balance_path = os.path.join(output_dir, "eda_class_balance.png")
    plt.savefig(balance_path, dpi=300)
    plt.close()
    print(f"[EDA] Saved: {balance_path}")
    
    # 2. Distributions of pH, EC, SCC per Stage
    fig, axes = plt.subplots(2, 3, figsize=(16, 10))
    stages = ["Healthy", "Subclinical", "Clinical"]
    
    # Boxplots (Row 0)
    sns.boxplot(data=df, x="Stage", y="pH", hue="Stage", palette=palette, ax=axes[0, 0], legend=False)
    axes[0, 0].set_title("Milk pH by Mastitis Stage", fontweight="bold")
    axes[0, 0].set_ylabel("pH")
    
    sns.boxplot(data=df, x="Stage", y="EC", hue="Stage", palette=palette, ax=axes[0, 1], legend=False)
    axes[0, 1].set_title("Electrical Conductivity (EC) by Stage", fontweight="bold")
    axes[0, 1].set_ylabel("EC (mS/cm)")
    
    sns.boxplot(data=df, x="Stage", y="SCC", hue="Stage", palette=palette, ax=axes[0, 2], legend=False)
    axes[0, 2].set_title("Somatic Cell Count (SCC) by Stage", fontweight="bold")
    axes[0, 2].set_ylabel("SCC (×10⁵ cells/mL)")
    # Diagnostic thresholds for SCC
    axes[0, 2].axhline(2.0, color="orange", linestyle="--", alpha=0.7, label="Threshold 2.0 (Subclinical)")
    axes[0, 2].axhline(5.0, color="red", linestyle="--", alpha=0.7, label="Threshold 5.0 (Clinical)")
    axes[0, 2].legend(loc="upper left")
    
    # KDE Distributions (Row 1)
    for stage in stages:
        sub = df[df["Stage"] == stage]
        sns.kdeplot(sub["pH"], ax=axes[1, 0], label=stage, color=palette[stage], fill=True, alpha=0.25)
        sns.kdeplot(sub["EC"], ax=axes[1, 1], label=stage, color=palette[stage], fill=True, alpha=0.25)
        sns.kdeplot(sub["SCC"], ax=axes[1, 2], label=stage, color=palette[stage], fill=True, alpha=0.25)
        
    axes[1, 0].set_title("Density Distribution: pH", fontweight="bold")
    axes[1, 0].legend()
    axes[1, 1].set_title("Density Distribution: EC (mS/cm)", fontweight="bold")
    axes[1, 1].legend()
    axes[1, 2].set_title("Density Distribution: SCC (×10⁵ cells/mL)", fontweight="bold")
    axes[1, 2].legend()
    
    plt.tight_layout()
    dist_path = os.path.join(output_dir, "eda_distributions.png")
    plt.savefig(dist_path, dpi=300)
    plt.close()
    print(f"[EDA] Saved: {dist_path}")
    
    # 3. Correlation Heatmap (Empirical vs Known Target)
    corr_empirical = df[["pH", "EC", "SCC"]].corr()
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Published Known Target Matrix
    target_matrix = pd.DataFrame([
        [1.000, 0.526, 0.411],
        [0.526, 1.000, 0.679],
        [0.411, 0.679, 1.000]
    ], index=["pH", "EC", "SCC"], columns=["pH", "EC", "SCC"])
    
    sns.heatmap(target_matrix, annot=True, fmt=".3f", cmap="coolwarm", vmin=0.2, vmax=1.0, ax=axes[0], cbar=False)
    axes[0].set_title("Published Known Correlation Target (r)", fontsize=13, fontweight="bold")
    
    sns.heatmap(corr_empirical, annot=True, fmt=".3f", cmap="coolwarm", vmin=0.2, vmax=1.0, ax=axes[1])
    axes[1].set_title("Empirical Synthetic Dataset Correlation (r)", fontsize=13, fontweight="bold")
    
    plt.tight_layout()
    corr_path = os.path.join(output_dir, "eda_correlations.png")
    plt.savefig(corr_path, dpi=300)
    plt.close()
    print(f"[EDA] Saved: {corr_path}")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    run_eda()
