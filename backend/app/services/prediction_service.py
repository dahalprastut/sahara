import pickle, numpy as np, os

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml_training', 'model.pkl')

with open(MODEL_PATH, 'rb') as f:
    bundle = pickle.load(f)
    model = bundle['model']
    FEATURES = bundle['features']
    explainer = bundle['explainer']

def predict(data: dict) -> dict:
    d = data.copy()
    d['rmssd_deviation'] = d['rmssd'] - d['rmssd_7d']
    d['hr_deviation']    = d['resting_hr'] - d['hr_7d']
    d['sleep_deviation'] = d['sleep_duration_hrs'] - d['sleep_7d']

    X = np.array([[d[f] for f in FEATURES]])
    risk_score = float(model.predict_proba(X)[0][1])

    shap_vals = explainer.shap_values(X)
    if isinstance(shap_vals, list):
        shap_vals = shap_vals[1]

    top_factors = sorted(
        zip(FEATURES, shap_vals[0]),
        key=lambda x: abs(x[1]), reverse=True
    )[:3]

    return {
        "risk_score": round(risk_score, 3),
        "send_notification": risk_score > 0.65,
        "top_factors": [{"feature": f, "impact": round(float(v), 3)} for f, v in top_factors],
        "suggested_agent": get_agent(top_factors, risk_score)
    }

def get_agent(top_factors, score):
    top_features = [f for f, _ in top_factors]
    if score > 0.85:
        return "pragati"
    return "kulman"