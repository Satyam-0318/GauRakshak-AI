"""
synthetic_data_generator.py - Multivariate normal synthetic data generator preserving correlation structure.
"""

import os
import numpy as np
import pandas as pd

# Published target correlation matrix between pH, EC, SCC
# SCC <-> EC : 0.679
# pH  <-> EC : 0.526
# pH  <-> SCC: 0.411
TARGET_CORR = np.array([
    [1.000, 0.526, 0.411],  # pH
    [0.526, 1.000, 0.679],  # EC
    [0.411, 0.679, 1.000]   # SCC
])

def generate_synthetic_data(
    summary_stats_path="summary_stats.csv",
    output_path="synthetic_dataset.csv",
    samples_per_row=100,
    noise_mult=1.0,
    random_seed=42
):
    """
    Generates synthetic individual-level dairy mastitis observations from summary statistics.
    Preserves correlation structure via Cholesky decomposition.
    """
    np.random.seed(random_seed)
    
    if not os.path.exists(summary_stats_path):
        raise FileNotFoundError(f"Summary stats file '{summary_stats_path}' not found.")
        
    df_stats = pd.read_csv(summary_stats_path)
    
    # Cholesky decomposition: L * L.T = R
    L = np.linalg.cholesky(TARGET_CORR)
    
    records = []
    
    for idx, row in df_stats.iterrows():
        means = np.array([row["pH_mean"], row["EC_mean"], row["SCC_mean"]], dtype=float)
        sds = np.array([row["pH_sd"], row["EC_sd"], row["SCC_sd"]], dtype=float) * noise_mult
        
        # Standard normal samples
        Z = np.random.randn(samples_per_row, 3)
        # Induce target correlation
        Y = Z @ L.T
        # Scale by SD and shift by group mean
        X = means + Y * sds
        
        # Biological clipping
        # pH biologically within ~5.5 to 8.0
        X[:, 0] = np.clip(X[:, 0], 5.5, 8.0)
        # EC (Electrical Conductivity in mS/cm) must be non-negative
        X[:, 1] = np.clip(X[:, 1], 0.0, None)
        # SCC (Somatic Cell Count in x10^5 cells/mL) must be non-negative
        X[:, 2] = np.clip(X[:, 2], 0.0, None)
        
        for i in range(samples_per_row):
            records.append({
                "Season": row["Season"],
                "LactationStage": row["LactationStage"],
                "Parity": row["Parity"],
                "MilkYield": row["MilkYield"],
                "pH": round(float(X[i, 0]), 3),
                "EC": round(float(X[i, 1]), 3),
                "SCC": round(float(X[i, 2]), 3),
                "Stage": row["Stage"]
            })
            
    df_synth = pd.DataFrame(records)
    df_synth.to_csv(output_path, index=False)
    
    print(f"\n[SYNTHETIC GENERATOR] Created '{output_path}' with {len(df_synth)} samples (Noise Mult: {noise_mult}).")
    
    # Validation & summary comparison
    print_reconstruction_diagnostics(df_stats, df_synth, TARGET_CORR)
    
    return df_synth


def print_reconstruction_diagnostics(df_stats, df_synth, target_corr):
    """
    Compares reconstructed synthetic statistics with published paper summary values.
    """
    print("=" * 75)
    print(" RECONSTRUCTION DIAGNOSTICS & FIDELITY CHECK")
    print("=" * 75)
    
    print("\n1. Overall Means & SDs:")
    print(f"{'Metric':<10} | {'Published Mean (pooled)':<25} | {'Synthetic Mean':<18} | {'Synthetic SD':<15}")
    print("-" * 75)
    for col in ["pH", "EC", "SCC"]:
        mean_col = f"{col}_mean"
        published_mean = df_stats[mean_col].mean()
        synth_mean = df_synth[col].mean()
        synth_sd = df_synth[col].std()
        print(f"{col:<10} | {published_mean:<25.3f} | {synth_mean:<18.3f} | {synth_sd:<15.3f}")
        
    print("\n2. Mastitis Stage Distributions:")
    print(f"{'Stage':<15} | {'Count':<8} | {'pH (mean±sd)':<18} | {'EC (mean±sd)':<18} | {'SCC (mean±sd)':<18}")
    print("-" * 85)
    for stage in ["Healthy", "Subclinical", "Clinical"]:
        sub = df_synth[df_synth["Stage"] == stage]
        print(
            f"{stage:<15} | {len(sub):<8} | "
            f"{sub['pH'].mean():.2f} ± {sub['pH'].std():.2f}     | "
            f"{sub['EC'].mean():.2f} ± {sub['EC'].std():.2f}     | "
            f"{sub['SCC'].mean():.2f} ± {sub['SCC'].std():.2f}"
        )
        
    print("\n3. Empirical Correlation vs. Target Paper Correlation:")
    corr_empirical = df_synth[["pH", "EC", "SCC"]].corr()
    print(f"Target:    r(SCC, EC) = {target_corr[1, 2]:.3f} | r(pH, EC) = {target_corr[0, 1]:.3f} | r(pH, SCC) = {target_corr[0, 2]:.3f}")
    print(f"Empirical: r(SCC, EC) = {corr_empirical.loc['SCC', 'EC']:.3f} | r(pH, EC) = {corr_empirical.loc['pH', 'EC']:.3f} | r(pH, SCC) = {corr_empirical.loc['pH', 'SCC']:.3f}")
    print("=" * 75)


if __name__ == "__main__":
    generate_synthetic_data()
