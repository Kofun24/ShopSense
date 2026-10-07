# Online Shoppers Purchase-Intent Prediction

**Module:** IT3051 – Fundamentals of Data Mining | Mini Project 2026

Predicts whether an online shopping session will end in a purchase, using real-time session behavior, so that marketing/UX teams can trigger timely interventions for at-risk sessions.

## Problem Scenario
An online retailer wants to know, while a customer is still browsing, whether the session is likely to convert into a purchase — enabling real-time discount prompts, live-chat offers, or personalized content for sessions showing signs of abandonment.

- **Task type:** Binary classification
- **Target variable:** `Revenue` (True = purchase made, False = no purchase)

## Dataset
**Online Shoppers Purchasing Intention Dataset** — UCI Machine Learning Repository
12,330 sessions, 17 features (10 numerical, 8 categorical/boolean) + target.

- Source: https://archive.ics.uci.edu/dataset/468/online+shoppers+purchasing+intention+dataset
- Citation: Sakar, C. & Kastro, Y. (2018). Online Shoppers Purchasing Intention Dataset [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5F88Q
- License: CC BY 4.0

## Repository Structure
```
.
├── data/
│   ├── raw/                # Original dataset (unmodified)
│   └── processed/          # Cleaned/preprocessed data
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_preprocessing.ipynb
│   └── 03_model_development.ipynb
|   └──04_model_optimization.ipynb
├── src/
│   ├── preprocessing.py    # Reusable cleaning/encoding/scaling functions
│   ├── train.py            # Model training script
│   └── evaluate.py         # Evaluation/metrics utilities
├── models/                 # Saved trained models (.pkl/.joblib)
├── backend/                # API service that loads the model and serves predictions
├── frontend/               # User-facing prediction interface
├── reports/
│   ├── dataset_proposal.docx
│   └── technical_report.docx
├── requirements.txt
├── .gitignore
└── README.md
```

## Setup
```bash
git clone <repo-url>
cd <repo-folder>
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
