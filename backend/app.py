import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from extractor import extract_phiusiil_features, extract_advanced_live_features

# ----- Config -----
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "phishing_model.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_names.pkl")

# Label mapping: 0=Benign, 1=Defacement, 2=Phishing, 3=Malware
LABEL_MAP = {0: "SAFE", 1: "DEFACEMENT", 2: "PHISHING", 3: "MALWARE"}
LABEL_DESCRIPTIONS = {
    0: "Benign",
    1: "Defacement",
    2: "Phishing",
    3: "Malware",
}

# ----- Load Model -----
if not os.path.exists(MODEL_PATH) or not os.path.exists(FEATURES_PATH):
    raise FileNotFoundError(
        "Model files not found. Run 'python train.py' first."
    )

model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURES_PATH)
print(f"[+] Model loaded. Features: {len(feature_names)}")
print(f"[+] Classes: {list(model.classes_)}")

# ----- FastAPI App -----
app = FastAPI(
    title="LinkLens AI v2.0",
    description="AI-Powered Phishing Link Detection API",
    version="2.0.0"
)

# Configure CORS
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in allowed_origins else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "LinkLens AI v2.0"}

@app.post("/api/analyze")
def analyze_url(payload: URLRequest):
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    # --- 1. ML Prediction (4-class) ---
    ml_probabilities = {}
    predicted_class = 0
    try:
        raw_features = extract_phiusiil_features(url)
        # Align features to training column order
        feature_vector = pd.DataFrame([raw_features])[feature_names]
        proba = model.predict_proba(feature_vector)[0]
        for i, cls in enumerate(model.classes_):
            ml_probabilities[int(cls)] = round(float(proba[i]) * 100, 1)
        predicted_class = int(model.classes_[np.argmax(proba)])
    except Exception as e:
        ml_probabilities = {0: 25.0, 1: 25.0, 2: 25.0, 3: 25.0}
        predicted_class = 0
        print(f"[!] ML extraction error: {e}")

    # --- Compute base risk score from ML probabilities ---
    benign_prob = ml_probabilities.get(0, 0.0)

    if predicted_class == 0:
        # Model says Benign. We cap the base risk score at 30 so it stays in the
        # SAFE range (<40) unless OSINT live metrics add significant penalties.
        max_threat_prob = max(
            ml_probabilities.get(1, 0.0),
            ml_probabilities.get(2, 0.0),
            ml_probabilities.get(3, 0.0)
        )
        base_risk_score = min(30.0, max_threat_prob)
        threat_probability = round(max_threat_prob, 1)
    else:
        # Model says Threat. Base risk is the probability of the predicted threat class.
        threat_probability = round(ml_probabilities.get(predicted_class, 50.0), 1)
        base_risk_score = threat_probability

    # --- 2. Live OSINT Features ---
    try:
        live = extract_advanced_live_features(url)
    except Exception as e:
        live = {
            "domain_age_days": -1, "creation_date": "Unknown", "whois_private": True,
            "has_base64": False, "has_hex": False, "has_double_encoding": False,
            "entropy": 0.0, "redirect_hops": 0, "final_url": url,
            "ssl_valid": False, "ssl_issuer_org": "N/A",
            "is_lets_encrypt": False, "is_corporate_ca": False, "cert_age_days": -1,
            "advanced_analysis": {
                "basic_auth": {"detected": False},
                "open_redirect": {"detected": False},
                "ip_obfuscation": {"detected": False},
                "idn_homograph": {"detected": False},
                "typosquatting": {"detected": False},
                "hidden_chars": {"detected": False}
            }
        }
        print(f"[!] Live feature error: {e}")

    # --- 3. Dynamic Hybrid Risk Score Engine ---
    risk_score = base_risk_score
    reasons = []

    # ML classification result
    if predicted_class == 0:
        reasons.append(f"ML model classifies as Benign ({benign_prob:.1f}% confidence)")
    elif predicted_class == 1:
        reasons.append(f"ML model detects Defacement attack ({ml_probabilities.get(1, 0.0):.1f}% confidence)")
    elif predicted_class == 2:
        reasons.append(f"ML model detects Phishing attempt ({ml_probabilities.get(2, 0.0):.1f}% confidence)")
    elif predicted_class == 3:
        reasons.append(f"ML model detects Malware distribution ({ml_probabilities.get(3, 0.0):.1f}% confidence)")

    # --- Live signal adjustments ---
    ml_confident_benign = (predicted_class == 0 and benign_prob > 60)

    # ── Advanced Heuristics Scoring ──
    advanced = live.get("advanced_analysis", {})
    
    # 1. Basic Auth abuse
    basic_auth = advanced.get("basic_auth", {})
    if basic_auth.get("detected"):
        risk_score += 35
        reasons.append(f"Basic Auth URL abuse: masquerades as '{basic_auth.get('apparent_domain')}' but redirects to '{basic_auth.get('actual_host')}'")

    # 2. Open Redirect
    open_redir = advanced.get("open_redirect", {})
    if open_redir.get("detected"):
        risk_score += 25
        reasons.append(f"Open Redirect: targets external domain '{open_redir.get('target_domain')}' via parameter '{open_redir.get('parameter')}'")

    # 3. IP Obfuscation
    ip_obf = advanced.get("ip_obfuscation", {})
    if ip_obf.get("detected"):
        ip_type = ip_obf.get("type", "Standard Dotted-Decimal IP")
        if "Standard" in ip_type:
            risk_score += 15
            reasons.append(f"Direct IP Hostname: targets IP address '{ip_obf.get('canonical')}' instead of a standard hostname")
        else:
            risk_score += 35
            reasons.append(f"Obfuscated IP Hostname: '{ip_obf.get('original')}' ({ip_type}) decodes to '{ip_obf.get('canonical')}'")

    # 4. IDN Homograph
    idn = advanced.get("idn_homograph", {})
    if idn.get("detected"):
        risk_score += 30
        reasons.append(f"Unicode IDN Lookalike: uses Punycode/homograph characters representing '{idn.get('unicode_domain')}'")

    # 5. Typosquatting
    typosquat = advanced.get("typosquatting", {})
    if typosquat.get("detected"):
        risk_score += 25
        reasons.append(f"Typosquatting/Mimicry: domain resembles brand '{typosquat.get('mimicked_brand')}' ({typosquat.get('type')})")

    # 6. Hidden Characters
    hidden_ch = advanced.get("hidden_chars", {})
    if hidden_ch.get("detected"):
        risk_score += 30
        reasons.append(f"Hidden/Control Characters: URL contains suspicious characters: {', '.join(hidden_ch.get('chars_found', []))}")

    # Standard Domain age / WHOIS privacy
    if live.get("domain_age_days", -1) != -1 and live["domain_age_days"] < 90:
        if live.get("whois_completed", False):
            risk_score += 10
            reasons.append(f"Domain is only {live['domain_age_days']} days old (< 90 days — suspicious)")
    elif live.get("whois_private", False) and not ml_confident_benign:
        if live.get("whois_completed", False):
            risk_score += 10
            reasons.append("WHOIS information is private/hidden — ownership cannot be verified")

    # ── Evasion / Obfuscation Scoring (12 Advanced Features) ──
    evasion = live.get("evasion_features", {})
    
    # 1. Base64
    if evasion.get("base64_target_param", {}).get("detected"):
        b64 = evasion["base64_target_param"]
        risk_score += 25
        reasons.append(f"Base64 obfuscated target parameter: {b64.get('details') or 'Obfuscated text payload detected.'}")
            
    # 2. URL Density
    if evasion.get("url_encoding_density", {}).get("detected"):
        risk_score += 12
        reasons.append(f"High URL percent-encoding density ({evasion['url_encoding_density']['density_ratio']*100:.1f}%)")
        
    # 3. Double URL Encoding
    if evasion.get("double_url_encoding", {}).get("detected"):
        risk_score += 25
        reasons.append(f"Double URL encoding sequence '{evasion['double_url_encoding']['match']}' detected")
        
    # 4. Hex Path Obfuscation
    if evasion.get("hex_obfuscated_path", {}).get("detected"):
        risk_score += 20
        reasons.append(f"Hex path obfuscation decodes to: '{evasion['hex_obfuscated_path']['decoded']}'")
        
    # 5. Mixed Obfuscation
    if evasion.get("mixed_obfuscation", {}).get("detected"):
        risk_score += 20
        reasons.append(f"Mixed obfuscation: combined {', '.join(evasion['mixed_obfuscation']['types_found'])} encodings")
        
    # 6. High query parameter entropy
    if evasion.get("high_parameter_entropy", {}).get("detected"):
        risk_score += 15
        reasons.append(f"High query parameters entropy ({evasion['high_parameter_entropy']['entropy']})")
        
    # 7. DWORD / Hex IP Hostname
    if evasion.get("dword_hex_ip", {}).get("detected"):
        risk_score += 30
        reasons.append(f"Obfuscated DWORD/Hex host: {evasion['dword_hex_ip']['original']} maps to {evasion['dword_hex_ip']['canonical']}")
        
    # 8. Embedded Data URI
    if evasion.get("embedded_data_uri", {}).get("detected"):
        risk_score += 35
        reasons.append("Embedded executing data URI found in parameter")
        
    # 9. Punycode IDN Homograph
    if evasion.get("punycode_idn_homograph", {}).get("detected"):
        risk_score += 30
        reasons.append(f"Unicode IDN homograph representation: '{evasion['punycode_idn_homograph']['unicode_domain']}'")
        
    # 10. Excessive Character Padding
    if evasion.get("excessive_padding", {}).get("detected"):
        risk_score += 15
        reasons.append(f"Excessive character padding: character '{evasion['excessive_padding']['char']}' repeated {evasion['excessive_padding']['max_reps']} times")
        
    # 11. Octal IP Hostname
    if evasion.get("octal_ip_evasion", {}).get("detected"):
        risk_score += 30
        reasons.append(f"Obfuscated Octal host: {evasion['octal_ip_evasion']['original']} maps to {evasion['octal_ip_evasion']['canonical']}")
        
    # 12. Non-standard Web Port
    if evasion.get("non_standard_port", {}).get("detected"):
        risk_score += 15
        reasons.append(f"Non-standard web port execution on port: {evasion['non_standard_port']['port']}")
 
    # Redirect hops
    if live.get("redirect_hops", 0) > 2:
        if live.get("redirect_completed", False):
            risk_score += 8
            reasons.append(f"Excessive redirect chain detected ({live['redirect_hops']} hops)")
 
    # SSL / Let's Encrypt + young cert
    is_http_only = url.lower().startswith("http://")
    if not live.get("ssl_valid", False) and not ml_confident_benign:
        if is_http_only or live.get("ssl_completed", False):
            risk_score += 12
            reasons.append("No valid SSL/TLS certificate — connection is not encrypted")
    elif live.get("is_lets_encrypt", False) and live.get("cert_age_days", 999) < 15:
        if live.get("ssl_completed", False):
            risk_score += 8
            reasons.append(f"SSL issued by Let's Encrypt with very new certificate ({live['cert_age_days']} days old)")

    # Entropy
    if live.get("entropy", 0) > 4.0:
        reasons.append(f"High domain entropy ({live['entropy']:.2f}) — possible random/generated domain")

    # Clamp
    risk_score = max(0.0, min(100.0, risk_score))

    # --- 4. Verdict ---
    if predicted_class == 0 and risk_score < 40:
        verdict = "SAFE"
    elif predicted_class == 3 or risk_score >= 70:
        verdict = "DANGEROUS"
    elif predicted_class != 0 or risk_score >= 40:
        verdict = "SUSPICIOUS"
    else:
        verdict = "SAFE"

    # Threat type label
    threat_type = LABEL_DESCRIPTIONS.get(predicted_class, "Unknown")

    return {
        "url": url,
        "risk_score": round(risk_score, 1),
        "verdict": verdict,
        "threat_type": threat_type,
        "predicted_class": predicted_class,
        "reasons": reasons,
        "ml_probabilities": ml_probabilities,
        "live_metrics": {
            "domain_age_days": live.get("domain_age_days", -1),
            "creation_date": live.get("creation_date", "Unknown"),
            "whois_private": live.get("whois_private", True),
            "ssl_valid": live.get("ssl_valid", False),
            "ssl_issuer_org": live.get("ssl_issuer_org", "N/A"),
            "is_lets_encrypt": live.get("is_lets_encrypt", False),
            "is_corporate_ca": live.get("is_corporate_ca", False),
            "cert_age_days": live.get("cert_age_days", -1),
            "redirect_hops": live.get("redirect_hops", 0),
            "final_url": live.get("final_url", url),
            "entropy": live.get("entropy", 0.0),
            "has_base64": live.get("has_base64", False),
            "has_hex": live.get("has_hex", False),
            "has_double_encoding": live.get("has_double_encoding", False),
            "registrar": live.get("registrar", "Unknown"),
            "encodings_analysis": live.get("encodings_analysis", []),
            "advanced_analysis": live.get("advanced_analysis", {}),
            "evasion_features": live.get("evasion_features", {})
        },
        "ml_threat_probability": threat_probability
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

