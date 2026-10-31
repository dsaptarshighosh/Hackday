"""Generate a reproducible synthetic Zoo Sentinel dataset and export its RF for Node."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
MODEL_DIR = ROOT / "model2"
CSV_PATH = DATA_DIR / "zoo_sentinel_synthetic.csv"
MODEL_PATH = MODEL_DIR / "zoo_sentinel_random_forest.json"

ANIMALS = ["Crocodile", "Elephant", "Flamingo", "Giraffe"]
BEHAVIOURS = [
    "Abnormal grouping",
    "Abnormal vocalization",
    "Burrowing animals emerging",
    "Repeated agitation",
    "Sudden fleeing",
    "Sudden movement",
    "Unusual silence",
]


def make_dataset(rows: int = 2800, seed: int = 100) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    animals = rng.choice(ANIMALS, size=rows)
    behaviours = rng.choice(BEHAVIOURS, size=rows)
    intensity = rng.integers(1, 11, size=rows)
    abnormality = rng.integers(5, 101, size=rows)
    # Mostly short observations, with a smaller number of longer events.
    duration = np.clip(np.rint(rng.exponential(9, size=rows) + 1), 1, 60).astype(int)

    animal_effect = {"Crocodile": 3, "Elephant": 9, "Flamingo": 5, "Giraffe": 7}
    behaviour_effect = {
        "Abnormal grouping": 12,
        "Abnormal vocalization": 14,
        "Burrowing animals emerging": 8,
        "Repeated agitation": 19,
        "Sudden fleeing": 24,
        "Sudden movement": 17,
        "Unusual silence": 10,
    }
    # Synthetic teaching labels only. These are not real hazard observations.
    hazard = (
        2
        + intensity * 3.05
        + abnormality * 0.34
        + np.log1p(duration) * 3.2
        + np.array([animal_effect[a] for a in animals])
        + np.array([behaviour_effect[b] for b in behaviours])
        + intensity * abnormality * 0.012
        + rng.normal(0, 6, size=rows)
    )
    hazard = np.clip(np.rint(hazard), 0, 100).astype(int)

    return pd.DataFrame(
        {
            "Animal_Name": animals,
            "Behaviour": behaviours,
            "Intensity": intensity,
            "Abnormality_Percentage": abnormality,
            "Duration_Minutes": duration,
            "Hazard_Probability": hazard,
        }
    )


def train_and_export(df: pd.DataFrame) -> dict[str, float | int]:
    x = pd.get_dummies(
        df.drop(columns="Hazard_Probability"),
        columns=["Animal_Name", "Behaviour"],
    ).astype(float)
    y = df["Hazard_Probability"]
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=100
    )

    model = RandomForestRegressor(n_estimators=200, random_state=100)
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    metrics = {
        "rows": int(len(df)),
        "features": int(x.shape[1]),
        "test_r2": round(float(r2_score(y_test, predictions)), 4),
        "test_mae": round(float(mean_absolute_error(y_test, predictions)), 2),
        "test_rmse": round(float(mean_squared_error(y_test, predictions) ** 0.5), 2),
    }

    trees = []
    for estimator in model.estimators_:
        tree = estimator.tree_
        trees.append(
            {
                "left": tree.children_left.tolist(),
                "right": tree.children_right.tolist(),
                "feature": tree.feature.tolist(),
                "threshold": tree.threshold.tolist(),
                "value": tree.value[:, 0, 0].tolist(),
            }
        )

    artifact = {
        "metadata": {
            "name": "Zoo Sentinel synthetic Random Forest regressor",
            "synthetic_training_data": True,
            "dataset": "data/zoo_sentinel_synthetic.csv",
            "target": "Hazard_Probability (0-100)",
            "estimator": "RandomForestRegressor",
            "n_estimators": 200,
            "random_state": 100,
            "metrics": metrics,
        },
        "feature_names": x.columns.tolist(),
        "animals": ANIMALS,
        "behaviours": BEHAVIOURS,
        "trees": trees,
    }
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_PATH.write_text(json.dumps(artifact, separators=(",", ":")), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    dataset = make_dataset()
    dataset.to_csv(CSV_PATH, index=False)
    metrics = train_and_export(dataset)
    print(json.dumps({"dataset": str(CSV_PATH), "model": str(MODEL_PATH), **metrics}, indent=2))
