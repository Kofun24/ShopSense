"""Streamlit frontend.   Start the API first, then:  streamlit run frontend/streamlit_app.py"""
import os

import requests
import streamlit as st

API_URL = os.getenv("API_URL", "http://localhost:8000")
st.set_page_config(page_title="Shopper Intent Predictor", page_icon="🛒", layout="wide")
st.title("🛒 Online Shopper Purchase-Intent Predictor")
st.caption("Enter what you know about a browsing session. Unknown fields are estimated automatically.")

PRESETS = {
    "Custom": {},
    "Casual browser": dict(Administrative=0, Informational=0, ProductRelated=4, ProductRelated_Duration=120.0,
                           BounceRates=0.05, ExitRates=0.08, PageValues=0.0, Month="Mar",
                           VisitorType="New_Visitor", Weekend=False),
    "Serious shopper": dict(Administrative=3, Informational=1, ProductRelated=45, ProductRelated_Duration=2100.0,
                            BounceRates=0.005, ExitRates=0.02, PageValues=35.0, Month="Nov",
                            VisitorType="Returning_Visitor", Weekend=False),
}
preset_name = st.sidebar.selectbox("Load an example session", list(PRESETS))
P = PRESETS[preset_name]
k = preset_name  # widget keys change with preset so the values refresh
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
VISITORS = ["Returning_Visitor", "New_Visitor", "Other"]

st.sidebar.markdown("**Tip:** tick *Unknown* to leave a field out; the model imputes it.")


def num(label, key, default, mn, mx, step, help_=None, is_int=False):
    c1, c2 = st.columns([4, 1])
    unknown = c2.checkbox("Unknown", key=f"u_{key}_{k}", value=False)
    val = c1.number_input(label, min_value=mn, max_value=mx, value=type(mn)(P.get(key, default)), step=step,
                          key=f"{key}_{k}", help=help_, disabled=unknown)
    return None if unknown else (int(val) if is_int else float(val))


left, right = st.columns(2)
with left:
    st.subheader("Browsing behaviour")
    data = {
        "Administrative": num("Account/admin pages viewed", "Administrative", 0, 0, 100, 1, is_int=True),
        "Administrative_Duration": num("Time on admin pages (s)", "Administrative_Duration", 0.0, 0.0, 100000.0, 10.0),
        "Informational": num("Info pages viewed", "Informational", 0, 0, 100, 1, is_int=True),
        "Informational_Duration": num("Time on info pages (s)", "Informational_Duration", 0.0, 0.0, 100000.0, 10.0),
        "ProductRelated": num("Product pages viewed", "ProductRelated", 10, 0, 5000, 1, is_int=True),
        "ProductRelated_Duration": num("Time on product pages (s)", "ProductRelated_Duration", 300.0, 0.0, 500000.0, 10.0),
    }
with right:
    st.subheader("Session metrics")
    data.update({
        "BounceRates": num("Bounce rate (0-1)", "BounceRates", 0.02, 0.0, 1.0, 0.01),
        "ExitRates": num("Exit rate (0-1)", "ExitRates", 0.04, 0.0, 1.0, 0.01),
        "PageValues": num("Page value", "PageValues", 0.0, 0.0, 1000.0, 1.0, "Average value of pages visited"),
        "SpecialDay": num("Closeness to special day (0-1)", "SpecialDay", 0.0, 0.0, 1.0, 0.2),
    })
    st.subheader("Visitor context")
    c1, c2, c3 = st.columns(3)
    data["Month"] = c1.selectbox("Month", MONTHS, index=MONTHS.index(P.get("Month", "May")), key=f"m_{k}")
    data["VisitorType"] = c2.selectbox("Visitor type", VISITORS, index=VISITORS.index(P.get("VisitorType", VISITORS[0])),
                                       key=f"v_{k}")
    data["Weekend"] = c3.checkbox("Weekend", value=P.get("Weekend", False), key=f"w_{k}")

if st.button("Predict purchase intent", type="primary", use_container_width=True):
    payload = {key: v for key, v in data.items() if v is not None}
    try:
        r = requests.post(f"{API_URL}/predict", json=payload, timeout=20)
    except requests.exceptions.ConnectionError:
        st.error(f"Cannot reach the backend at {API_URL}. Start it with: uvicorn backend.api:app --port 8000")
        st.stop()
    if r.status_code != 200:
        st.error(f"Request rejected: {r.json().get('detail', r.text)}")
        st.stop()
    res = r.json()
    p = res["purchase_probability"]
    st.divider()
    a, b, c = st.columns(3)
    a.metric("Purchase probability", f"{p:.0%}")
    b.metric("Prediction", "Will buy ✅" if res["will_purchase"] else "Will not buy ❌")
    c.metric("Intent level", res["intent_level"])
    st.progress(min(max(p, 0.0), 1.0))
    (st.success if res["will_purchase"] else st.warning)(f"**Recommended action:** {res['recommended_action']}")
    if res["fields_imputed"]:
        st.info("Estimated automatically (not provided): " + ", ".join(res["fields_imputed"]))
    st.caption(f"Model: {res['model']} | decision threshold: {res['decision_threshold']}")