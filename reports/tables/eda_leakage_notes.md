# Data-leakage assessment
Feature leakage risk (target proxies / only known at session end):
- PageValues: average value of pages visited before a transaction; strongest predictor; computed by Google Analytics from
  e-commerce transactions so it partly encodes the outcome. Tested by dropping it in notebook 02.
- ExitRates / BounceRates: session-level aggregates, complete only when the session ends.
Procedural leakage and prevention:
- Imputers, scalers, encoders, capping quantiles, feature selection and SMOTE are fitted inside a Pipeline (training folds only).
- Stratified split BEFORE any fitting; duplicates removed before splitting.
- Missingness is unrelated to Revenue (chi-square, eda_mcar_check.csv).
Suspect columns: ['PageValues', 'ExitRates', 'BounceRates']
