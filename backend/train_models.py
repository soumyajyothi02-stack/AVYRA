"""
MotionEase Model Training Script
Trains Baseline Logistic Regression and Random Forest on simulated physiological travel dataset.
Evaluates accuracy, ROC-AUC, and exports serializable models via joblib.
"""

import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score

def generate_synthetic_travel_dataset(n_samples=2400, random_seed=42):
    """Generates synthetic dataset simulating vehicle vestibular conflict parameters."""
    np.random.seed(random_seed)

    # 1. Features
    transport_weight = np.random.choice([0.45, 0.75, 0.95, 1.15, 1.45], size=n_samples) # Train, Plane, Car, Bus, Boat
    seat_factor = np.random.choice([0.70, 0.90, 1.05, 1.10, 1.35], size=n_samples)       # Front, Window, Aisle, Middle, Back
    vent_factor = np.random.choice([0.75, 0.85, 1.40], size=n_samples)                    # AC, Window, Stuffy
    duration_hrs = np.random.uniform(0.2, 4.0, size=n_samples)
    screen_ratio = np.random.uniform(0.0, 1.5, size=n_samples)
    roughness = np.random.uniform(0.4, 2.0, size=n_samples)
    user_prior = np.random.uniform(0.1, 1.0, size=n_samples)

    X = np.column_stack([
        transport_weight,
        seat_factor,
        vent_factor,
        duration_hrs,
        screen_ratio,
        roughness,
        user_prior
    ])

    # 2. Latent sickness probability with realistic non-linearities
    interaction = np.where((seat_factor > 1.2) & (screen_ratio > 0.6), 1.3, 1.0)
    relief = np.where((vent_factor < 0.8) & (seat_factor < 0.8), 0.7, 1.0)

    z = (
        -2.2
        + 0.9 * transport_weight
        + 0.7 * seat_factor
        + 0.6 * vent_factor
        + 0.5 * np.log1p(duration_hrs)
        + 0.8 * screen_ratio
        + 0.65 * roughness
        + 1.1 * user_prior
    ) * interaction * relief

    # Add stochastic physiological noise
    prob = 1.0 / (1.0 + np.exp(-z))
    noise = np.random.normal(0, 0.05, size=n_samples)
    y = ((prob + noise) > 0.5).astype(int)

    return X, y

def main():
    print("=" * 60)
    print("MotionEase: Training Machine Learning Travel Models")
    print("=" * 60)

    X, y = generate_synthetic_travel_dataset(n_samples=2400)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    print(f"Dataset: {len(X)} records (Train: {len(X_train)}, Test: {len(X_test)})")
    print(f"Positive Sickness Prevalence: {np.mean(y):.2%}\n")

    # 1. Baseline Logistic Regression
    print("1. Training Baseline Logistic Regression...")
    logit = LogisticRegression(max_iter=1000, C=1.0)
    logit.fit(X_train, y_train)
    logit_preds = logit.predict(X_test)
    logit_probs = logit.predict_proba(X_test)[:, 1]
    logit_acc = accuracy_score(y_test, logit_preds)
    logit_auc = roc_auc_score(y_test, logit_probs)
    print(f"   Accuracy: {logit_acc:.4f} | ROC-AUC: {logit_auc:.4f}")

    # 2. Random Forest Non-Linear Ensemble
    print("\n2. Training Random Forest Ensemble (100 Trees)...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_probs = rf.predict_proba(X_test)[:, 1]
    rf_acc = accuracy_score(y_test, rf_preds)
    rf_auc = roc_auc_score(y_test, rf_probs)
    print(f"   Accuracy: {rf_acc:.4f} | ROC-AUC: {rf_auc:.4f}")

    # 3. Model Comparison
    print("\n" + "-" * 60)
    print("Model Evaluation Summary:")
    print(f"   Baseline Logistic Regression Accuracy: {logit_acc * 100:.2f}% (AUC: {logit_auc:.3f})")
    print(f"   Random Forest Non-Linear Accuracy:    {rf_acc * 100:.2f}% (AUC: {rf_auc:.3f})")
    print("-" * 60)

    # 4. Save Models
    joblib.dump(logit, "logistic_model.joblib")
    joblib.dump(rf, "rf_model.joblib")
    print("Models successfully persisted to logistic_model.joblib and rf_model.joblib!")

if __name__ == "__main__":
    main()
