# 🌸 Basic Classification Model — Iris Dataset

A beginner-friendly supervised-learning project that builds a **K-Nearest Neighbours (KNN)** classifier on the classic Iris flower dataset.

## What You'll Learn

| Skill | Where in the code |
|---|---|
| Loading & exploring a dataset | Step 1 |
| Data visualisation (pair plots, box plots, heatmaps) | Step 2 |
| Train / test splitting with stratification | Step 3 |
| Feature scaling (`StandardScaler`) | Step 3 |
| Training a classification model (KNN) | Step 4 |
| Model evaluation (accuracy, confusion matrix, report) | Step 5 |
| Hyper-parameter tuning (best *k*) | Bonus |

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the pipeline
python classification_model.py
```

All plots are saved automatically to the `outputs/` folder.

## Project Structure

```
task2/
├── classification_model.py   # main pipeline script
├── requirements.txt          # Python dependencies
├── README.md                 # this file
└── outputs/                  # generated plots (auto-created)
    ├── pair_plot.png
    ├── box_plots.png
    ├── correlation_heatmap.png
    ├── confusion_matrix.png
    └── accuracy_vs_k.png
```

## Dataset

The **Iris dataset** (150 samples, 4 features, 3 classes) is loaded directly from `scikit-learn` — no manual download required.

| Feature | Description |
|---|---|
| sepal length (cm) | Length of the sepal |
| sepal width (cm) | Width of the sepal |
| petal length (cm) | Length of the petal |
| petal width (cm) | Width of the petal |

**Classes**: *setosa*, *versicolor*, *virginica*
