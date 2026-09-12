"""
model_service.py - Loads mastitis_model.pkl once and provides inference,
explanations, physiological benchmark evaluations, and model metrics.
"""

import os
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

# Expected feature lists matching ColumnTransformer
NUMERICAL_COLS = ["pH", "EC", "SCC"]
CATEGORICAL_COLS = ["Season", "LactationStage", "Parity", "MilkYield"]
REQUIRED_COLS = NUMERICAL_COLS + CATEGORICAL_COLS

# Reference thresholds derived from dairy veterinary science & research dataset
PHYSIOLOGICAL_BENCHMARKS = {
    "SCC": {
        "unit": "×10⁵ cells/mL",
        "healthy_max": 2.0,
        "subclinical_max": 5.0,
        "typical_healthy": "< 2.0",
        "description": "Somatic Cell Count (leukocytes & epithelial cells indicates immune response)",
    },
    "EC": {
        "unit": "mS/cm",
        "healthy_min": 4.0,
        "healthy_max": 4.8,
        "subclinical_max": 5.4,
        "typical_healthy": "4.0 - 4.8",
        "description": "Electrical Conductivity (rises when Na⁺ and Cl⁻ leak into milk)",
    },
    "pH": {
        "unit": "",
        "healthy_min": 6.4,
        "healthy_max": 6.7,
        "subclinical_max": 6.85,
        "typical_healthy": "6.4 - 6.7",
        "description": "Milk pH (shifts alkaline due to blood serum bicarbonate influx)",
    }
}


class MastitisModelService:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or self._locate_model()
        self.bundle: Dict[str, Any] = {}
        self.model = None
        self.preprocessor = None
        self.reverse_label_map = {0: "Healthy", 1: "Subclinical", 2: "Clinical"}
        self.label_map = {"Healthy": 0, "Subclinical": 1, "Clinical": 2}
        self.feature_names = []
        self.test_accuracy = 0.8103
        self.best_hyperparams = {}
        self.model_name = "Random Forest"
        self._load_model()

    def _locate_model(self) -> str:
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "mastitis_model.pkl"),
            os.path.join(os.path.dirname(__file__), "mastitis_model.pkl"),
            "mastitis_model.pkl",
        ]
        for c in candidates:
            if os.path.exists(c):
                return os.path.abspath(c)
        raise FileNotFoundError("Could not find 'mastitis_model.pkl' in workspace.")

    def _load_model(self):
        print(f"[ModelService] Loading model bundle from: {self.model_path}")
        with open(self.model_path, "rb") as f:
            self.bundle = pickle.load(f)

        self.model = self.bundle["model"]
        self.preprocessor = self.bundle["preprocessor"]
        self.reverse_label_map = self.bundle.get("reverse_label_map", self.reverse_label_map)
        self.label_map = self.bundle.get("label_map", self.label_map)
        self.feature_names = self.bundle.get("feature_names", [])
        self.test_accuracy = float(self.bundle.get("test_accuracy", 0.8103))
        self.best_hyperparams = self.bundle.get("best_hyperparameters", {})
        self.model_name = self.bundle.get("model_name", "Random Forest")
        print(f"[ModelService] Model successfully loaded: {self.model_name} (Test Acc: {self.test_accuracy:.2%})")

    def _analyze_biomarkers(self, ph: float, ec: float, scc: float) -> Dict[str, Any]:
        """Analyzes physiological markers against standard dairy benchmarks."""
        # SCC Analysis
        if scc < 2.0:
            scc_status = "Normal"
            scc_severity = "low"
        elif scc <= 5.0:
            scc_status = "Elevated (Subclinical range)"
            scc_severity = "medium"
        else:
            scc_status = "Severely Elevated (Clinical range)"
            scc_severity = "high"

        # EC Analysis
        if ec <= 4.8:
            ec_status = "Normal"
            ec_severity = "low"
        elif ec <= 5.5:
            ec_status = "Elevated"
            ec_severity = "medium"
        else:
            ec_status = "High (Tissue Damage)"
            ec_severity = "high"

        # pH Analysis
        if ph <= 6.7:
            ph_status = "Normal"
            ph_severity = "low"
        elif ph <= 6.85:
            ph_status = "Slightly Alkaline"
            ph_severity = "medium"
        else:
            ph_status = "Alkaline (Inflammation)"
            ph_severity = "high"

        return {
            "SCC": {
                "value": round(scc, 3),
                "unit": "×10⁵ cells/mL",
                "status": scc_status,
                "severity": scc_severity,
                "reference": "< 2.0",
                "deviation_percent": round(max(0.0, (scc - 2.0) / 2.0 * 100), 1) if scc > 2.0 else 0.0,
            },
            "EC": {
                "value": round(ec, 3),
                "unit": "mS/cm",
                "status": ec_status,
                "severity": ec_severity,
                "reference": "4.0 - 4.8",
                "deviation_percent": round(max(0.0, (ec - 4.8) / 4.8 * 100), 1) if ec > 4.8 else 0.0,
            },
            "pH": {
                "value": round(ph, 3),
                "unit": "pH",
                "status": ph_status,
                "severity": ph_severity,
                "reference": "6.4 - 6.7",
                "deviation_percent": round(max(0.0, (ph - 6.7) / 6.7 * 100), 1) if ph > 6.7 else 0.0,
            }
        }

    def _generate_explanation(self, stage: str, ph: float, ec: float, scc: float,
                              season: str, lactation: str, parity: str, milk_yield: str,
                              confidence: float) -> Dict[str, Any]:
        """Generates plain-language clinical reasoning and actionable veterinary steps."""
        drivers = []

        if scc > 5.0:
            drivers.append(f"markedly elevated Somatic Cell Count ({scc:.2f} ×10⁵ cells/mL vs normal <2.0)")
        elif scc >= 2.0:
            drivers.append(f"moderately elevated Somatic Cell Count ({scc:.2f} ×10⁵ cells/mL)")
        else:
            drivers.append(f"healthy somatic cell count ({scc:.2f} ×10⁵ cells/mL)")

        if ec > 5.4:
            drivers.append(f"high electrical conductivity ({ec:.2f} mS/cm), indicating epithelial cell barrier leakage and electrolyte infiltration")
        elif ec > 4.8:
            drivers.append(f"mildly elevated electrical conductivity ({ec:.2f} mS/cm)")
        else:
            drivers.append(f"normal conductivity ({ec:.2f} mS/cm)")

        if ph > 6.85:
            drivers.append(f"alkaline milk pH ({ph:.2f}), reflecting vascular permeability and systemic serum transfer")
        elif ph > 6.7:
            drivers.append(f"borderline milk pH ({ph:.2f})")
        else:
            drivers.append(f"normal physiological pH ({ph:.2f})")

        if stage == "Healthy":
            summary = (
                f"The cow is classified as Healthy with {confidence:.1%} model confidence. "
                f"All primary milk biomarkers ({', '.join(drivers[:2])}) fall safely within standard physiological baselines."
            )
            recommendation = "Maintain routine milking hygiene and schedule standard monthly DHIA herd test monitoring."
            action_code = "MONITOR"
            color_theme = "emerald"

        elif stage == "Subclinical":
            summary = (
                f"Subclinical mastitis detected ({confidence:.1%} confidence). "
                f"The prediction is predominantly driven by {drivers[0]} alongside {drivers[1]}. "
                "While physical milk abnormalities may not yet be visibly evident in the bucket, udder inflammation is already active."
            )
            recommendation = (
                "Conduct a California Mastitis Test (CMT) on all four individual quarters to identify the specific infected quarter. "
                "Check post-milking teat dips, isolate milking order if feasible, and retest conductivity in 48 hours."
            )
            action_code = "INSPECT_CMT"
            color_theme = "amber"

        else: # Clinical
            summary = (
                f"Clinical mastitis detected with high urgency ({confidence:.1%} confidence). "
                f"Driven decisively by {drivers[0]}, {drivers[1]}, and {drivers[2]}. "
                "These biomarker levels indicate active bacterial colonization, tissue necrosis or vascular permeability."
            )
            recommendation = (
                "Immediately isolate the cow from the main milking line to prevent bulk tank contamination and pathogen spread. "
                "Perform physical udder palpation for heat, swelling, and pain. Inspect foremilk for clots, flakes, or watery secretions. "
                "Engage the herd veterinarian for quarter culture, targeted intramammary antibiotic infusion, and supportive anti-inflammatory therapy."
            )
            action_code = "ISOLATE_TREAT"
            color_theme = "rose"

        return {
            "summary": summary,
            "key_drivers": drivers,
            "veterinary_recommendation": recommendation,
            "action_code": action_code,
            "color_theme": color_theme,
        }

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Runs single-cow prediction with complete clinical diagnostic payload."""
        # Ensure correct column naming and formats
        row = {
            "pH": float(input_data["pH"]),
            "EC": float(input_data["EC"]),
            "SCC": float(input_data["SCC"]),
            "Season": str(input_data.get("Season", "Winter")),
            "LactationStage": str(input_data.get("LactationStage", "Mid")),
            "Parity": str(input_data.get("Parity", "2nd")),
            "MilkYield": str(input_data.get("MilkYield", "5-10")),
        }

        df = pd.DataFrame([row])
        X_proc = self.preprocessor.transform(df)

        pred_idx = int(self.model.predict(X_proc)[0])
        pred_label = self.reverse_label_map[pred_idx]
        probas = self.model.predict_proba(X_proc)[0]

        # Construct probability dictionary
        probability_map = {
            "Healthy": float(probas[self.label_map["Healthy"]]),
            "Subclinical": float(probas[self.label_map["Subclinical"]]),
            "Clinical": float(probas[self.label_map["Clinical"]]),
        }

        confidence = probability_map[pred_label]
        biomarkers = self._analyze_biomarkers(row["pH"], row["EC"], row["SCC"])
        clinical_analysis = self._generate_explanation(
            stage=pred_label,
            ph=row["pH"],
            ec=row["EC"],
            scc=row["SCC"],
            season=row["Season"],
            lactation=row["LactationStage"],
            parity=row["Parity"],
            milk_yield=row["MilkYield"],
            confidence=confidence,
        )

        return {
            "predicted_stage": pred_label,
            "predicted_class_index": pred_idx,
            "confidence": round(confidence, 4),
            "probabilities": {k: round(v, 4) for k, v in probability_map.items()},
            "biomarkers": biomarkers,
            "clinical_explanation": clinical_analysis["summary"],
            "key_drivers": clinical_analysis["key_drivers"],
            "veterinary_recommendation": clinical_analysis["veterinary_recommendation"],
            "action_code": clinical_analysis["action_code"],
            "color_theme": clinical_analysis["color_theme"],
            "input_parameters": row,
        }

    def predict_batch(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Efficient batch prediction for multiple cows."""
        if not records:
            return []

        rows = []
        for i, rec in enumerate(records):
            rows.append({
                "id": rec.get("id", f"COW-{i+1:03d}"),
                "pH": float(rec["pH"]),
                "EC": float(rec["EC"]),
                "SCC": float(rec["SCC"]),
                "Season": str(rec.get("Season", "Winter")),
                "LactationStage": str(rec.get("LactationStage", "Mid")),
                "Parity": str(rec.get("Parity", "2nd")),
                "MilkYield": str(rec.get("MilkYield", "5-10")),
            })

        df = pd.DataFrame(rows)
        X_proc = self.preprocessor.transform(df[CATEGORICAL_COLS + NUMERICAL_COLS])
        preds = self.model.predict(X_proc)
        probas = self.model.predict_proba(X_proc)

        results = []
        for i, r in enumerate(rows):
            pred_idx = int(preds[i])
            pred_label = self.reverse_label_map[pred_idx]
            p_healthy = float(probas[i][self.label_map["Healthy"]])
            p_subclinical = float(probas[i][self.label_map["Subclinical"]])
            p_clinical = float(probas[i][self.label_map["Clinical"]])
            conf = max(p_healthy, p_subclinical, p_clinical)

            results.append({
                **r,
                "predicted_stage": pred_label,
                "confidence": round(conf, 4),
                "p_healthy": round(p_healthy, 4),
                "p_subclinical": round(p_subclinical, 4),
                "p_clinical": round(p_clinical, 4),
                "color_theme": "emerald" if pred_label == "Healthy" else ("amber" if pred_label == "Subclinical" else "rose")
            })

        return results

    def get_metrics_payload(self) -> Dict[str, Any]:
        """Provides verified training metrics, feature importance, and confusion matrix."""
        # Top feature importance extracted from trained model
        if hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            feat_imp = [
                {"feature": feat, "importance": round(float(imp), 4)}
                for feat, imp in zip(self.feature_names, importances)
            ]
            feat_imp = sorted(feat_imp, key=lambda x: x["importance"], reverse=True)
        else:
            feat_imp = []

        return {
            "model_name": self.model_name,
            "test_accuracy": round(self.test_accuracy, 4),
            "hyperparameters": self.best_hyperparams,
            "feature_importance": feat_imp[:10],
            "benchmark_scores": {
                "Healthy": {"precision": 0.7559, "recall": 0.8577, "f1": 0.8036, "support": 260},
                "Subclinical": {"precision": 0.7608, "recall": 0.7462, "f1": 0.7534, "support": 260},
                "Clinical": {"precision": 0.9348, "recall": 0.8269, "f1": 0.8776, "support": 260},
                "MacroAverage": {"precision": 0.8172, "recall": 0.8103, "f1": 0.8115, "support": 780},
            },
            "confusion_matrix": [
                {"true_stage": "Healthy", "pred_healthy": 223, "pred_subclinical": 34, "pred_clinical": 3},
                {"true_stage": "Subclinical", "pred_healthy": 56, "pred_subclinical": 194, "pred_clinical": 10},
                {"true_stage": "Clinical", "pred_healthy": 16, "pred_subclinical": 29, "pred_clinical": 215},
            ]
        }


# Singleton service instance
model_service = MastitisModelService()
