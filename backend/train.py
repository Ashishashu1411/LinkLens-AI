import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# ----- Config -----
DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset", "final_dataset_with_all_features_v3.1.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "phishing_model.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_names.pkl")

# Columns to drop (non-numeric / non-feature)
DROP_COLS = ["url", "type", "domain", "scan_date", "label"]

# Label mapping: 0=Benign, 1=Defacement, 2=Phishing, 3=Malware
LABEL_NAMES = ["Benign (0)", "Defacement (1)", "Phishing (2)", "Malware (3)"]


def main():
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("[*] Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"    Shape: {df.shape}")
    print(f"    Label distribution:\n{df['label'].value_counts().sort_index()}")

    # Separate features and label
    X = df.drop(columns=[c for c in DROP_COLS if c in df.columns])
    y = df["label"]

    feature_names = list(X.columns)
    print(f"\n    Features ({len(feature_names)}): {feature_names[:10]}...")

    # Save feature names for inference-time alignment
    joblib.dump(feature_names, FEATURES_PATH)
    print(f"[+] Feature names saved to {FEATURES_PATH}")

    # Handle any remaining NaN values
    if X.isnull().any().any():
        null_cols = X.columns[X.isnull().any()].tolist()
        print(f"[!] Filling NaN in columns: {null_cols}")
        X = X.fillna(0)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"    Train: {X_train.shape}, Test: {X_test.shape}")

    # Train Random Forest
    print("[*] Training Random Forest Classifier (4-class)...")
    model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1,
    max_depth=20,
    min_samples_split=10,
    min_samples_leaf=5

    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n[+] Accuracy: {acc:.4f}")
    print(f"\n[+] Classification Report:\n{classification_report(y_test, y_pred, target_names=LABEL_NAMES)}")
    print(f"[+] Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

    # Feature importance (top 15)
    importances = sorted(
        zip(feature_names, model.feature_importances_),
        key=lambda x: x[1], reverse=True
    )
    print("\n[+] Top 15 Feature Importances:")
    for name, imp in importances[:15]:
        print(f"    {name:35s} {imp:.4f}")

    # Save model
    joblib.dump(model, MODEL_PATH, compress=3)
    print(f"\n[+] Model saved to {MODEL_PATH}")
    print("[✓] Training complete.")


if __name__ == "__main__":
    main()
