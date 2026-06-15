"""
===========================================================
 Basic Classification Model — Iris Dataset
===========================================================
This script demonstrates a complete supervised‑learning
classification pipeline:

  1. Load & explore the Iris dataset
  2. Visualise feature distributions
  3. Split into training / testing sets
  4. Train a K‑Nearest Neighbours (KNN) classifier
  5. Evaluate with accuracy, confusion matrix & report
  6. Save all plots to the /outputs folder

Requirements:
    pip install scikit-learn matplotlib seaborn pandas numpy
===========================================================
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────
RANDOM_STATE = 42          # reproducibility seed
TEST_SIZE = 0.2            # 20 % held out for testing
K_NEIGHBOURS = 5           # KNN hyper‑parameter
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ──────────────────────────────────────────────
# 1. LOAD & UNDERSTAND THE DATASET
# ──────────────────────────────────────────────
print("=" * 60)
print(" STEP 1 - Loading the Iris dataset")
print("=" * 60)

iris = load_iris()

# Build a tidy DataFrame for exploration
df = pd.DataFrame(data=iris.data, columns=iris.feature_names)
df["species"] = pd.Categorical.from_codes(iris.target, iris.target_names)

print(f"\n[*] Dataset shape : {df.shape[0]} samples x {df.shape[1] - 1} features")
print(f"[*] Classes        : {list(iris.target_names)}")
print(f"\n-- First 5 rows --")
print(df.head().to_string(index=False))

print(f"\n-- Statistical summary --")
print(df.describe().round(2).to_string())

print(f"\n-- Class distribution --")
print(df["species"].value_counts().to_string())

# ──────────────────────────────────────────────
# 2. VISUALISE THE DATA
# ──────────────────────────────────────────────
print("\n" + "=" * 60)
print(" STEP 2 - Visualising feature distributions")
print("=" * 60)

# 2a. Pair‑plot (shows feature relationships per class)
sns.set_theme(style="whitegrid", palette="Set2")
pair_grid = sns.pairplot(df, hue="species", diag_kind="kde", corner=True)
pair_grid.figure.suptitle("Iris - Feature Pair Plot", y=1.02, fontsize=14)
pair_path = os.path.join(OUTPUT_DIR, "pair_plot.png")
pair_grid.savefig(pair_path, dpi=150, bbox_inches="tight")
print(f"  [OK] Saved pair plot -> {pair_path}")

# 2b. Box‑plots for each feature
fig, axes = plt.subplots(1, 4, figsize=(16, 4))
for i, col in enumerate(iris.feature_names):
    sns.boxplot(x="species", y=col, data=df, ax=axes[i], palette="Set2")
    axes[i].set_title(col.replace('\u00a0', ' '), fontsize=10)
    axes[i].set_xlabel("")
fig.suptitle("Feature Distribution by Species", fontsize=14, y=1.02)
fig.tight_layout()
box_path = os.path.join(OUTPUT_DIR, "box_plots.png")
fig.savefig(box_path, dpi=150, bbox_inches="tight")
print(f"  [OK] Saved box plots -> {box_path}")

# 2c. Correlation heat‑map
fig_corr, ax_corr = plt.subplots(figsize=(6, 5))
corr = df.drop(columns="species").corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", ax=ax_corr)
ax_corr.set_title("Feature Correlation Matrix")
corr_path = os.path.join(OUTPUT_DIR, "correlation_heatmap.png")
fig_corr.savefig(corr_path, dpi=150, bbox_inches="tight")
print(f"  [OK] Saved correlation heatmap -> {corr_path}")

plt.close("all")

# ──────────────────────────────────────────────
# 3. SPLIT DATA — TRAINING / TESTING
# ──────────────────────────────────────────────
print("\n" + "=" * 60)
print(" STEP 3 - Splitting data into train / test sets")
print("=" * 60)

X = iris.data          # features  (150 x 4)
y = iris.target        # labels    (150,)

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE,
    stratify=y,          # keep class proportions balanced
)

print(f"  Training set : {X_train.shape[0]} samples")
print(f"  Testing set  : {X_test.shape[0]} samples")

# Optional: scale features (good practice for distance‑based models)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ──────────────────────────────────────────────
# 4. TRAIN THE CLASSIFIER (KNN)
# ──────────────────────────────────────────────
print("\n" + "=" * 60)
print(" STEP 4 - Training the K-Nearest Neighbours classifier")
print("=" * 60)

knn = KNeighborsClassifier(n_neighbors=K_NEIGHBOURS)
knn.fit(X_train_scaled, y_train)

print(f"  [OK] KNN model trained  (k = {K_NEIGHBOURS})")

# ──────────────────────────────────────────────
# 5. EVALUATE THE MODEL
# ──────────────────────────────────────────────
print("\n" + "=" * 60)
print(" STEP 5 - Evaluating the model")
print("=" * 60)

y_pred = knn.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n  Accuracy : {accuracy:.2%}\n")
print("-- Classification Report --")
print(classification_report(y_test, y_pred, target_names=iris.target_names))

# Confusion matrix plot
cm = confusion_matrix(y_test, y_pred)
fig_cm, ax_cm = plt.subplots(figsize=(6, 5))
disp = ConfusionMatrixDisplay(cm, display_labels=iris.target_names)
disp.plot(cmap="Blues", ax=ax_cm, colorbar=False)
ax_cm.set_title("Confusion Matrix - KNN Classifier")
cm_path = os.path.join(OUTPUT_DIR, "confusion_matrix.png")
fig_cm.savefig(cm_path, dpi=150, bbox_inches="tight")
print(f"  [OK] Saved confusion matrix -> {cm_path}")

# ──────────────────────────────────────────────
# 6. BONUS — Accuracy vs. K (hyper‑parameter search)
# ──────────────────────────────────────────────
print("\n" + "=" * 60)
print(" BONUS - Finding the best K value")
print("=" * 60)

k_range = range(1, 21)
k_scores = []
for k in k_range:
    model = KNeighborsClassifier(n_neighbors=k)
    model.fit(X_train_scaled, y_train)
    k_scores.append(accuracy_score(y_test, model.predict(X_test_scaled)))

best_k = list(k_range)[np.argmax(k_scores)]
best_acc = max(k_scores)
print(f"  Best k = {best_k}  ->  accuracy = {best_acc:.2%}")

fig_k, ax_k = plt.subplots(figsize=(8, 4))
ax_k.plot(k_range, k_scores, marker="o", linewidth=2, color="#4c72b0")
ax_k.axvline(best_k, color="tomato", linestyle="--", label="Best k = {}".format(best_k))
ax_k.set_xlabel("Number of Neighbours (k)")
ax_k.set_ylabel("Test Accuracy")
ax_k.set_title("KNN - Accuracy vs. Number of Neighbours")
ax_k.legend()
ax_k.set_xticks(list(k_range))
fig_k.tight_layout()
k_path = os.path.join(OUTPUT_DIR, "accuracy_vs_k.png")
fig_k.savefig(k_path, dpi=150, bbox_inches="tight")
print(f"  [OK] Saved accuracy-vs-k plot -> {k_path}")

plt.close("all")

# ──────────────────────────────────────────────
# DONE
# ──────────────────────────────────────────────
print("\n" + "=" * 60)
print(" ALL DONE - outputs saved to ./outputs/")
print("=" * 60)
