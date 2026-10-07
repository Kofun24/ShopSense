# ShopSense — React Frontend

A modern, responsive, production-quality single-page application built with React 18, Vite, TypeScript, and Tailwind CSS. This frontend interfaces with the FastAPI machine learning backend to predict online shopper purchase intent in real time and in batch mode.

> **Note:** The FastAPI backend must be running separately before starting this application:
> ```bash
> uvicorn backend.api:app --reload --port 8000
> ```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18 or later (tested on Node v22)
- **npm**: v9 or later (tested on npm v10)
- **Python backend**: running with the trained model at `http://localhost:8000`

### 2. Installation
Navigate to the `frontend-react` directory and install dependencies:
```bash
cd frontend-react
npm install
```

### 3. Environment Configuration
The application reads the backend URL from the `VITE_API_URL` environment variable. By default, it connects to `http://localhost:8000`.

To customize the backend endpoint, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Inside `.env`:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Running the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## Application Navigation & Pages

The application features five complete, fully-functioning views with no dead-end navigation:

1. **Dashboard (`#dashboard`)**:
   - Project overview and live model status indicator.
   - SVG visualization of the training data's class balance (`84.5% non-purchase vs 15.5% purchase`) with metric rationale.
   - Candidate model performance summary comparing 5-fold CV PR-AUC scores.
   - Quick-action cards leading directly to Single Session Predictor and Batch Prediction.

2. **Predict (`#predict`)**:
   - Interactive single-session predictor supporting **Casual browser**, **Serious shopper**, and **Custom** presets.
   - **Collapsed Technical Fields**: `OperatingSystems`, `Browser`, `Region`, and `TrafficType` are organized under an optional collapsible disclosure.
   - **Segmented Weekend Toggle**: Clean `Weekday` vs `Weekend` selector styled in primary brand color.
   - **Live Debounced Estimate**: Lightweight preview line (*"Live estimate: Medium-high intent..."*) debounced at ~600ms as fields are completed.
   - **"Reset to preset" Quick-Link**: Easily return to the original preset values when customizations have been made.
   - **Ranked Key Factors**: Top 5 model features presented in a ranked list with rank badges and relative weight bars.
   - **Prominent Low-Confidence Safety Gate**: High-visibility bordered banner with gauge de-emphasis (85% opacity) when ≥8 fields are imputed.

3. **Batch Prediction (`#batch`)**:
   - Drag-and-drop or click-to-upload CSV drop zone for processing up to 5,000 session rows.
   - Downloadable sample CSV template conforming to the 17-feature schema.
   - Direct integration with `POST /predict/batch` for vectorized backend inference.
   - Summary banner highlighting flagged records (`low_confidence` when ≥8 fields are imputed).
   - Paginated, filterable results table (20 rows/page) with client-side CSV export functionality.

4. **Model Intelligence (`#intelligence`)**:
   - **Section 1 — Model Card**: Live metadata from `GET /model-info` (algorithm, decision threshold, hyperparameters, test metrics stat-grid).
   - **Section 2 — Candidate Model Comparison**: Horizontal bar chart comparing cross-validated PR-AUC across 7 tuned models, highlighting Random Forest.
   - **Section 3 — Permutation Feature Importance**: Dominant influence analysis demonstrating PageValues' role in late-stage funnel prediction.

5. **Model Performance (`#performance`)**:
   - Full evaluation metric grid on the untouched 20% hold-out test set (Accuracy: 89.7%, Precision: 65.6%, Recall: 72.0%, F1: 68.7%, ROC-AUC: 93.8%, PR-AUC: 77.2%).
   - 2x2 Confusion Matrix visual with colored cells and row/column totals for True Negatives, False Positives, False Negatives, and True Positives.
