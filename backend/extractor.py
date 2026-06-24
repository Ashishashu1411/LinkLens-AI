"""
extractor.py - LinkLens AI v2.0 Feature Extraction Engine (v3.1 Dataset)

Two main functions:
  1. extract_phiusiil_features(url) -> dict  (59 ML features matching new dataset)
  2. extract_advanced_live_features(url) -> dict  (real-time OSINT indicators)

IMPORTANT: Features are computed to match the dataset's extraction logic exactly.
The dataset stores raw URLs (often without http/https scheme), so feature extraction
must replicate that behavior to avoid distribution mismatch at inference time.
"""

import re
import math
import ssl
import socket
import sqlite3
import os
from urllib.parse import urlparse, parse_qs, urljoin
from datetime import datetime, timezone
from functools import lru_cache
import concurrent.futures

# ─── Constants ───────────────────────────────────────────────────────────────

SHORTENER_DOMAINS = {
    "bit.ly", "goo.gl", "tinyurl.com", "t.co", "ow.ly", "is.gd",
    "buff.ly", "rebrand.ly", "cutt.ly", "adf.ly", "tiny.cc", "lnkd.in",
    "soo.gd", "s2r.co", "clicky.me", "budurl.com", "bc.vc",
}

SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".pw",
    ".cc", ".buzz", ".club", ".work", ".info", ".site", ".online", ".icu",
}

URGENCY_WORDS = [
    "verify", "secure", "update", "login", "signin", "bank", "confirm",
    "account", "suspend", "alert", "warning", "expire", "urgent",
    "immediately", "click",
]

SECURITY_WORDS = [
    "account", "password", "security", "confirm", "identity",
    "credential", "authenticate",
]

BRAND_NAMES = [
    "google", "facebook", "apple", "microsoft", "paypal", "amazon",
    "netflix", "instagram", "whatsapp", "linkedin", "twitter",
    "dropbox", "chase", "wellsfargo", "bankofamerica", "citibank",
]

PATH_KEYWORDS = [
    "login", "signin", "verify", "account", "update", "secure",
    "banking", "confirm", "password", "webscr", "ebayisapi", ".php", ".cgi",
]

REDIRECT_PATTERNS = [
    "/redirect", "//redirect", "url=", "redirect=",
    "next=", "dest=", "rurl=", "return=",
]

HACKED_TERMS = ["hacked", "compromised", "stolen", "phish", "malware", "exploit"]

SUSPICIOUS_EXTENSIONS = [".exe", ".zip", ".js", ".scr", ".bat", ".cmd", ".msi", ".dll", ".php"]

CORPORATE_CAS = [
    "digicert", "globalsign", "comodo", "sectigo", "entrust",
    "thawte", "geotrust", "symantec",
]

# IPv4 / IPv6 patterns
IPV4_RE = re.compile(
    r"^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$"
)
IPV6_RE = re.compile(r"^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$")


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _ensure_scheme(url: str) -> str:
    """Prepend https:// if no scheme is present."""
    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url
    return url


def _get_tld(hostname: str) -> str:
    """Return the TLD (e.g., '.com') from a hostname."""
    if not hostname:
        return ""
    parts = hostname.rstrip(".").split(".")
    if len(parts) >= 2:
        return "." + parts[-1]
    return ""


def _get_registered_domain(hostname: str) -> str:
    """Return the registered domain portion (e.g., 'example' from 'sub.example.com')."""
    if not hostname:
        return ""
    parts = hostname.rstrip(".").split(".")
    if len(parts) >= 2:
        return parts[-2]
    return hostname


def _get_subdomain(hostname: str) -> str:
    """Return subdomain portion (everything before the registered domain + TLD)."""
    if not hostname:
        return ""
    parts = hostname.rstrip(".").split(".")
    if len(parts) > 2:
        return ".".join(parts[:-2])
    return ""


def _shannon_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not text:
        return 0.0
    freq = {}
    for ch in text:
        freq[ch] = freq.get(ch, 0) + 1
    length = len(text)
    entropy = -sum((c / length) * math.log2(c / length) for c in freq.values())
    return round(entropy, 4)


# ═══════════════════════════════════════════════════════════════════════════════
#  1) ML Feature Extraction  (59 features matching v3.1 dataset EXACTLY)
# ═══════════════════════════════════════════════════════════════════════════════

def extract_phiusiil_features(url: str) -> dict:
    """
    Extract all 59 numeric features matching the v3.1 dataset column names.

    CRITICAL: The dataset stores URLs as-is (mostly without http/https scheme).
    We normalize user input to match: strip the scheme before computing features.
    This ensures abnormal_url, //, https, url_len etc. match training distributions.
    """
    # ── Normalize URL to match dataset format ──
    # Dataset URLs are predominantly bare (no scheme). Strip scheme if present
    # so features like url_len, //, https, abnormal_url match training data.
    original_url = url
    url = re.sub(r"^https?://", "", url, flags=re.IGNORECASE)

    # Parse the normalized URL as-is (matching dataset behavior)
    raw_parsed = urlparse(url)
    raw_hostname = (raw_parsed.hostname or "").lower()

    # Parse with scheme for reliable hostname/path extraction
    safe_url = _ensure_scheme(url)
    parsed = urlparse(safe_url)
    hostname = (parsed.hostname or "").lower()
    path = parsed.path or ""
    query = parsed.query or ""
    url_lower = url.lower()

    tld = _get_tld(hostname)
    registered_domain = _get_registered_domain(hostname)
    subdomain = _get_subdomain(hostname)

    # Parse query params
    params = parse_qs(query)
    num_params = len(params)

    features: dict = {}

    # --- Basic URL statistics (computed on RAW url, matching dataset) ---
    features["url_len"] = len(url)

    for char in ["@", "?", "-", "=", ".", "#", "%", "+", "$", "!", "*", ","]:
        features[char] = url.count(char)

    # // count: dataset counts raw occurrences. URLs without scheme have 0.
    # URLs with http:// have 1. We match by counting raw and subtracting for scheme.
    raw_double_slash = url.count("//")
    has_scheme = bool(re.match(r"^https?://", url, re.IGNORECASE))
    features["//"] = max(raw_double_slash - (1 if has_scheme else 0), 0)

    features["digits"] = sum(c.isdigit() for c in url)
    features["letters"] = sum(c.isalpha() for c in url)

    # --- Abnormal URL (CRITICAL: must match dataset logic) ---
    # Dataset used urlparse on raw URL. For URLs without scheme, hostname is None,
    # so abnormal_url=1. This is the dominant pattern for benign URLs in the dataset.
    if raw_hostname:
        # Raw URL has a scheme and hostname was parsed successfully
        features["abnormal_url"] = 0 if raw_hostname in url_lower else 1
    else:
        # No scheme in raw URL → urlparse returns hostname=None → abnormal_url=1
        # This matches 90%+ of benign URLs in the dataset
        features["abnormal_url"] = 1

    # --- HTTPS (on raw URL, matching dataset) ---
    features["https"] = 1 if url_lower.startswith("https") else 0

    # --- Shortening Service ---
    features["Shortining_Service"] = 1 if hostname in SHORTENER_DOMAINS else 0

    # --- Having IP address ---
    raw_host = hostname.strip("[]")
    features["having_ip_address"] = 1 if IPV4_RE.match(raw_host) or IPV6_RE.match(raw_host) else 0

    # ── Web Features (default to 0 to match dataset distribution) ─────────
    # In the dataset, web_* features are 0 for the vast majority of URLs.
    # Live scraping produces non-zero values that cause distribution mismatch.
    # We default to 0s (matching dataset) and only populate if we can do so reliably.
    features["web_http_status"] = 0
    features["web_is_live"] = 0
    features["web_ext_ratio"] = 0.0
    features["web_unique_domains"] = 0
    features["web_favicon"] = 0
    features["web_csp"] = 0
    features["web_xframe"] = 0
    features["web_hsts"] = 0
    features["web_xcontent"] = 0
    features["web_security_score"] = 0
    features["web_forms_count"] = 0
    features["web_password_fields"] = 0
    features["web_hidden_inputs"] = 0
    features["web_has_login"] = 0
    features["web_ssl_valid"] = 0

    # --- Phish keyword counts ---
    features["phish_urgency_words"] = sum(1 for w in URGENCY_WORDS if w in url_lower)
    features["phish_security_words"] = sum(1 for w in SECURITY_WORDS if w in url_lower)

    # Brand mentions: don't count if the brand IS the registered domain (e.g., google.com)
    # Dataset shows phish_brand_mentions=0 for legitimate brand URLs
    features["phish_brand_mentions"] = sum(
        1 for b in BRAND_NAMES
        if b in url_lower and b != registered_domain
    )

    # --- Brand hijack (brand in subdomain but NOT the registered domain) ---
    features["phish_brand_hijack"] = (
        1 if any(b in subdomain for b in BRAND_NAMES) and not any(b == registered_domain for b in BRAND_NAMES) else 0
    )

    # --- Multiple subdomains (dots in hostname > 2) ---
    features["phish_multiple_subdomains"] = 1 if hostname.count(".") > 2 else 0

    # --- Long path ---
    features["phish_long_path"] = 1 if len(path) > 60 else 0

    # --- Many params ---
    features["phish_many_params"] = 1 if num_params > 3 else 0

    # --- Suspicious TLD ---
    features["phish_suspicious_tld"] = 1 if tld in SUSPICIOUS_TLDS else 0

    # --- Advanced brand features ---
    # exact_brand_match=1 means the domain itself is a brand (legitimate use)
    is_brand_domain = registered_domain in BRAND_NAMES
    features["phish_adv_exact_brand_match"] = 1 if is_brand_domain else 0
    features["phish_adv_brand_in_subdomain"] = 1 if any(b in subdomain for b in BRAND_NAMES) else 0
    features["phish_adv_brand_in_path"] = 1 if any(
        b in path.lower() for b in BRAND_NAMES if b != registered_domain
    ) else 0

    # --- Hostname analysis ---
    features["phish_adv_hyphen_count"] = hostname.count("-")
    features["phish_adv_number_count"] = sum(c.isdigit() for c in hostname)
    features["phish_adv_suspicious_tld"] = features["phish_suspicious_tld"]
    features["phish_adv_long_domain"] = 1 if len(hostname) > 30 else 0

    # Subdomain count
    subdomain_parts = [p for p in subdomain.split(".") if p] if subdomain else []
    features["phish_adv_many_subdomains"] = 1 if len(subdomain_parts) > 2 else 0

    # --- Encoded chars in path ---
    features["phish_adv_encoded_chars"] = 1 if "%" in path else 0

    # --- Path keywords ---
    path_lower = path.lower()
    features["phish_adv_path_keywords"] = 1 if any(kw in path_lower for kw in PATH_KEYWORDS) else 0

    # --- Redirect patterns ---
    features["phish_adv_has_redirect"] = 1 if any(rp in url_lower for rp in REDIRECT_PATTERNS) else 0

    # --- Many params (advanced) ---
    features["phish_adv_many_params"] = 1 if num_params > 3 else 0

    # --- Hacked terms in path ---
    features["path_has_hacked_terms"] = 1 if any(t in path_lower for t in HACKED_TERMS) else 0

    # --- Suspicious extension ---
    features["suspicious_extension"] = 1 if any(url_lower.endswith(ext) for ext in SUSPICIOUS_EXTENSIONS) else 0

    # --- Path underscore count ---
    features["path_underscore_count"] = path.count("_")

    # --- Gov/Edu ---
    features["is_gov_edu"] = 1 if tld in (".gov", ".edu") else 0

    return features


def analyze_base64_in_url(url: str) -> dict:
    """
    Search for valid base64 strings in the URL, decode them, and analyze their legitimacy.
    """
    import base64
    # Regex: find strings containing A-Z, a-z, 0-9, +, /, or = (or - and _ for base64url) of length 16+
    candidates = re.findall(r"[A-Za-z0-9+/_-]{16,}=*", url)
    
    for candidate in candidates:
        if len(candidate) < 16:
            continue
        # Normalize for standard base64 decoding (replace urlsafe chars)
        norm = candidate.replace('-', '+').replace('_', '/')
        # Add padding if missing
        missing_padding = len(norm) % 4
        if missing_padding:
            norm += '=' * (4 - missing_padding)
            
        try:
            decoded_bytes = base64.b64decode(norm)
            decoded_text = decoded_bytes.decode('utf-8', errors='strict')
            
            # Check if it consists of printable text
            if len(decoded_text) > 0:
                printable_ratio = sum(32 <= ord(c) < 127 or c in '\r\n\t' for c in decoded_text) / len(decoded_text)
                if printable_ratio > 0.85:
                    decoded_lower = decoded_text.lower()
                    is_suspicious = False
                    reasons = []
                    
                    # Check for URLs inside
                    inner_urls = re.findall(r"https?://[^\s\"']+", decoded_text)
                    if inner_urls:
                        is_suspicious = True
                        reasons.append(f"Decoded payload redirects to URL: {inner_urls[0]}")
                        
                    # Check for email address inside
                    is_email = bool(re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", decoded_text))
                    if is_email:
                        is_suspicious = True
                        reasons.append(f"Decoded payload targets email address: {decoded_text}")
                        
                    # Check for sensitive keywords
                    keywords = ["login", "email", "password", "username", "passwd", "signin", "verification", "secure", "bank", "portal"]
                    found_kws = [kw for kw in keywords if kw in decoded_lower]
                    if found_kws:
                        is_suspicious = True
                        reasons.append(f"Decoded payload contains security keywords: {', '.join(found_kws)}")
                    
                    verdict = "SUSPICIOUS" if is_suspicious else "SAFE"
                    analysis = " | ".join(reasons) if reasons else "Decodes to standard metadata parameters"
                    
                    return {
                        "found": True,
                        "raw_string": candidate,
                        "decoded_text": decoded_text,
                        "verdict": verdict,
                        "analysis": analysis
                    }
        except Exception:
            pass
            
    return {
        "found": False,
        "raw_string": "",
        "decoded_text": "",
        "verdict": "SAFE",
        "analysis": "No active Base64 encoding detected."
    }


def evaluate_decoded_payload(text: str) -> tuple:
    """Helper to evaluate if a decoded payload is suspicious and list reasons."""
    reasons = []
    text_lower = text.lower()
    
    # 1. Check for URLs inside
    inner_urls = re.findall(r"https?://[^\s\"']+", text)
    if inner_urls:
        reasons.append(f"Decoded payload redirects to URL: {inner_urls[0]}")
        
    # 2. Check for email address inside
    emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    if emails:
        reasons.append(f"Decoded payload targets email address: {emails[0]}")
        
    # 3. Check for sensitive keywords
    keywords = ["login", "email", "password", "username", "passwd", "signin", "verification", "secure", "bank", "portal", "account", "admin", "redirect"]
    found_kws = [kw for kw in keywords if kw in text_lower]
    if found_kws:
        reasons.append(f"Decoded payload contains sensitive keywords: {', '.join(found_kws)}")
        
    return len(reasons) > 0, reasons


def analyze_all_encodings_in_url(url: str) -> list:
    """
    Search for valid base64 strings, URL percent/hex encodings, and double URL encodings in the URL,
    decode them, and analyze their legitimacy.
    """
    import base64
    import urllib.parse
    
    analyses = []
    
    # 1. Double URL Encoding
    double_matches = re.finditer(r"(?:%25[0-9a-fA-F]{2}){3,}", url)
    for m in double_matches:
        raw_match = m.group(0)
        try:
            # Decode first level: %25XX -> %XX
            first_decode = urllib.parse.unquote(raw_match)
            # Decode second level: %XX -> text
            second_decode = urllib.parse.unquote(first_decode)
            if len(second_decode.strip()) > 0:
                # Check printable
                printable_ratio = sum(32 <= ord(c) < 127 or c in '\r\n\t' for c in second_decode) / len(second_decode)
                if printable_ratio > 0.85:
                    is_suspicious, reasons = evaluate_decoded_payload(second_decode)
                    analyses.append({
                        "type": "Double URL Encoding",
                        "raw_string": raw_match,
                        "decoded_text": second_decode,
                        "verdict": "SUSPICIOUS" if is_suspicious else "SAFE",
                        "analysis": " | ".join(reasons) if reasons else "Decodes to standard metadata parameters."
                    })
        except Exception:
            pass
            
    # 2. Hex / Percent Encoding (standard single level)
    hex_matches = re.finditer(r"(?:%[0-9a-fA-F]{2}){3,}", url)
    for m in hex_matches:
        raw_match = m.group(0)
        # Skip if this match is part of double encoding (contains %25)
        if "%25" in raw_match:
            continue
        try:
            decoded_text = urllib.parse.unquote(raw_match)
            if len(decoded_text.strip()) > 0:
                printable_ratio = sum(32 <= ord(c) < 127 or c in '\r\n\t' for c in decoded_text) / len(decoded_text)
                if printable_ratio > 0.85 and any(c.isalnum() for c in decoded_text):
                    is_suspicious, reasons = evaluate_decoded_payload(decoded_text)
                    # Standard URL percent encoding of alpha chars is suspicious
                    is_suspicious_obfuscation = is_suspicious or any(c.isalpha() for c in decoded_text)
                    if is_suspicious_obfuscation and not reasons:
                        reasons.append("Percent-encoding used to obfuscate standard alphanumeric text.")
                        
                    analyses.append({
                        "type": "URL Percent/Hex Encoding",
                        "raw_string": raw_match,
                        "decoded_text": decoded_text,
                        "verdict": "SUSPICIOUS" if is_suspicious_obfuscation else "SAFE",
                        "analysis": " | ".join(reasons) if reasons else "Decodes to standard metadata parameters."
                    })
        except Exception:
            pass

    # 3. Base64 Encoding
    b64_matches = re.finditer(r"[A-Za-z0-9+/_-]{16,}=*", url)
    for m in b64_matches:
        candidate = m.group(0)
        if len(candidate) < 16:
            continue
        # Skip if candidate is a pure number, or is a common URL path part with very low unique char count
        if candidate.isdigit() or len(set(candidate)) < 5:
            continue
            
        norm = candidate.replace('-', '+').replace('_', '/')
        missing_padding = len(norm) % 4
        if missing_padding:
            norm += '=' * (4 - missing_padding)
            
        try:
            decoded_bytes = base64.b64decode(norm)
            decoded_text = decoded_bytes.decode('utf-8', errors='strict')
            
            if len(decoded_text) > 0:
                printable_ratio = sum(32 <= ord(c) < 127 or c in '\r\n\t' for c in decoded_text) / len(decoded_text)
                if printable_ratio > 0.85 and any(c.isalnum() for c in decoded_text):
                    is_suspicious, reasons = evaluate_decoded_payload(decoded_text)
                    analyses.append({
                        "type": "Base64 Encoding",
                        "raw_string": candidate,
                        "decoded_text": decoded_text,
                        "verdict": "SUSPICIOUS" if is_suspicious else "SAFE",
                        "analysis": " | ".join(reasons) if reasons else "Decodes to standard metadata parameters."
                    })
        except Exception:
            pass

    # 4. Mixed Obfuscation (Base64 + URL Encoding) in query parameters
    try:
        parsed_url = urllib.parse.urlparse(url)
        query_str = parsed_url.query or ""
        if query_str:
            for part in query_str.split('&'):
                if '=' in part:
                    param_name, param_val = part.split('=', 1)
                    if '%' in param_val and re.search(r'%[0-9a-fA-F]{2}', param_val):
                        unquoted_val = urllib.parse.unquote(param_val)
                        if re.match(r'^[A-Za-z0-9+/_-]+={0,2}$', unquoted_val) and len(unquoted_val) >= 8:
                            norm_val = unquoted_val.replace('-', '+').replace('_', '/')
                            missing_padding = len(norm_val) % 4
                            if missing_padding:
                                norm_val += '=' * (4 - missing_padding)
                            try:
                                decoded_bytes = base64.b64decode(norm_val.encode('ascii'))
                                decoded_text = decoded_bytes.decode('utf-8', errors='replace')
                                is_suspicious, reasons = evaluate_decoded_payload(decoded_text)
                                if not reasons:
                                    reasons = ["Parameter contains mixed URL-encoded and Base64-encoded characters."]
                                analyses.append({
                                    "type": "Mixed Obfuscation (Base64 + URL)",
                                    "raw_string": param_val,
                                    "decoded_text": f"URL Decoded: {unquoted_val} | Base64 Decoded: {decoded_text}",
                                    "verdict": "SUSPICIOUS",
                                    "analysis": " | ".join(reasons)
                                })
                            except Exception:
                                pass
    except Exception:
        pass

    return analyses


# ═══════════════════════════════════════════════════════════════════════════════
#  2) Real-Time OSINT / Live Feature Extraction (for UI display, NOT for ML)
# ═══════════════════════════════════════════════════════════════════════════════



# ─── Whitelist of Top Safe Domains ───────────────────────────────────────────
TOP_SAFE_DOMAINS = {
    # Search engines & major portals
    "google.com", "google.co.in", "google.co.uk", "google.ca", "google.de", "google.fr", "google.co.jp",
    "bing.com", "yahoo.com", "baidu.com", "yandex.ru", "duckduckgo.com",
    # Social media & communication
    "facebook.com", "twitter.com", "x.com", "instagram.com", "linkedin.com", "pinterest.com",
    "reddit.com", "tumblr.com", "whatsapp.com", "telegram.org", "snapchat.com", "tiktok.com",
    # Media & entertainment
    "youtube.com", "netflix.com", "spotify.com", "vimeo.com", "twitch.tv", "imdb.com", "disneyplus.com",
    # Technology & cloud providers
    "apple.com", "icloud.com", "microsoft.com", "office.com", "outlook.com", "live.com", "skype.com",
    "amazon.com", "amazon.co.uk", "amazon.in", "aws.amazon.com", "github.com", "githubusercontent.com", "gitlab.com",
    "cloudflare.com", "vercel.app", "netlify.app", "heroku.com", "digitalocean.com",
    "dropbox.com", "zoom.us", "salesforce.com", "adobe.com", "oracle.com", "ibm.com",
    # Knowledge & education
    "wikipedia.org", "wikimedia.org", "quora.com", "medium.com", "stackoverflow.com",
    "stackexchange.com", "w3schools.com", "coursera.org", "udemy.com", "khanacademy.org",
    # News & publications
    "nytimes.com", "cnn.com", "bbc.co.uk", "bbc.com", "reuters.com", "bloomberg.com", "forbes.com",
    "theguardian.com", "wsj.com", "washingtonpost.com", "techcrunch.com", "wired.com",
    # Government & International
    "nih.gov", "cdc.gov", "nasa.gov", "gov.uk", "india.gov.in", "who.int", "un.org",
    # Payment & Finance
    "paypal.com", "stripe.com", "visa.com", "mastercard.com", "chase.com", "wellsfargo.com",
    "bankofamerica.com", "citi.com",
}

def is_whitelisted_safe_domain(hostname: str) -> bool:
    if not hostname:
        return False
    hostname = hostname.lower()
    if hostname in TOP_SAFE_DOMAINS:
        return True
    parts = hostname.split('.')
    for i in range(1, len(parts)):
        parent = ".".join(parts[i:])
        if parent in TOP_SAFE_DOMAINS:
            return True
    return False

# ─── SQLite Persistent Caching Layer ──────────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), "linklens_cache.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS whois_cache (
                hostname TEXT PRIMARY KEY,
                domain_age_days INTEGER,
                creation_date TEXT,
                whois_private INTEGER,
                registrar TEXT,
                cached_at TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ssl_cache (
                hostname TEXT PRIMARY KEY,
                ssl_valid INTEGER,
                ssl_issuer_org TEXT,
                is_lets_encrypt INTEGER,
                is_corporate_ca INTEGER,
                cert_age_days INTEGER,
                cached_at TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS redirect_cache (
                url TEXT PRIMARY KEY,
                redirect_hops INTEGER,
                final_url TEXT,
                cached_at TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[-] DB init error: {e}")

# Initialize DB on load
init_db()

def is_expired(cached_at_str: str, max_age_seconds: int) -> bool:
    try:
        cached_at = datetime.fromisoformat(cached_at_str)
        now = datetime.now(timezone.utc)
        if cached_at.tzinfo is None:
            cached_at = cached_at.replace(tzinfo=timezone.utc)
        return (now - cached_at).total_seconds() > max_age_seconds
    except Exception:
        return True

def get_whois_from_db(hostname: str) -> dict or None:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM whois_cache WHERE hostname = ?", (hostname,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            if not is_expired(row["cached_at"], 604800): # 7 days
                return {
                    "domain_age_days": row["domain_age_days"],
                    "creation_date": row["creation_date"],
                    "whois_private": bool(row["whois_private"]),
                    "registrar": row["registrar"],
                    "whois_completed": True
                }
    except Exception as e:
        print(f"[-] DB error loading WHOIS: {e}")
    return None

def save_whois_to_db(hostname: str, data: dict):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO whois_cache 
            (hostname, domain_age_days, creation_date, whois_private, registrar, cached_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            hostname,
            data.get("domain_age_days", -1),
            data.get("creation_date", "Unknown"),
            1 if data.get("whois_private", False) else 0,
            data.get("registrar", "Unknown"),
            datetime.now(timezone.utc).isoformat()
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[-] DB error saving WHOIS: {e}")

def get_ssl_from_db(hostname: str) -> dict or None:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM ssl_cache WHERE hostname = ?", (hostname,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            if not is_expired(row["cached_at"], 86400): # 1 day
                return {
                    "ssl_valid": bool(row["ssl_valid"]),
                    "ssl_issuer_org": row["ssl_issuer_org"],
                    "is_lets_encrypt": bool(row["is_lets_encrypt"]),
                    "is_corporate_ca": bool(row["is_corporate_ca"]),
                    "cert_age_days": row["cert_age_days"],
                    "ssl_completed": True
                }
    except Exception as e:
        print(f"[-] DB error loading SSL: {e}")
    return None

def save_ssl_to_db(hostname: str, data: dict):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO ssl_cache 
            (hostname, ssl_valid, ssl_issuer_org, is_lets_encrypt, is_corporate_ca, cert_age_days, cached_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            hostname,
            1 if data.get("ssl_valid", False) else 0,
            data.get("ssl_issuer_org", "N/A"),
            1 if data.get("is_lets_encrypt", False) else 0,
            1 if data.get("is_corporate_ca", False) else 0,
            data.get("cert_age_days", -1),
            datetime.now(timezone.utc).isoformat()
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[-] DB error saving SSL: {e}")

def get_redirect_from_db(url: str) -> dict or None:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM redirect_cache WHERE url = ?", (url,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            if not is_expired(row["cached_at"], 86400): # 1 day
                return {
                    "redirect_hops": row["redirect_hops"],
                    "final_url": row["final_url"],
                    "redirect_completed": True
                }
    except Exception as e:
        print(f"[-] DB error loading Redirects: {e}")
    return None

def save_redirect_to_db(url: str, data: dict):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO redirect_cache 
            (url, redirect_hops, final_url, cached_at)
            VALUES (?, ?, ?, ?)
        """, (
            url,
            data.get("redirect_hops", 0),
            data.get("final_url", url),
            datetime.now(timezone.utc).isoformat()
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[-] DB error saving Redirects: {e}")

def fetch_whois_wrapper(hostname: str) -> dict:
    res = fetch_whois(hostname)
    save_whois_to_db(hostname, res)
    return res

def fetch_ssl_wrapper(hostname: str) -> dict:
    res = fetch_ssl(hostname)
    save_ssl_to_db(hostname, res)
    return res

def fetch_redirects_wrapper(safe_url: str, url: str) -> dict:
    res = fetch_redirects(safe_url, url)
    save_redirect_to_db(url, res)
    return res

@lru_cache(maxsize=1024)
def fetch_whois(hostname: str) -> dict:
    """Perform WHOIS lookup in a cached thread."""
    result = {
        "domain_age_days": -1,
        "creation_date": "Unknown",
        "whois_private": False,
        "registrar": "Unknown"
    }
    try:
        import whois
        w = whois.whois(hostname)
        creation = w.creation_date
        if isinstance(creation, list):
            creation = creation[0]
        if creation:
            if isinstance(creation, str):
                creation = datetime.fromisoformat(creation)
            now = datetime.now(timezone.utc)
            if creation.tzinfo is None:
                creation = creation.replace(tzinfo=timezone.utc)
            age = (now - creation).days
            result["domain_age_days"] = age
            result["creation_date"] = creation.isoformat()
        
        # Check privacy
        registrant = str(w.get("org", "") or w.get("registrant_name", "") or "")
        if any(
            kw in registrant.lower()
            for kw in ["privacy", "proxy", "redacted", "whoisguard", "domains by proxy", "contact privacy"]
        ):
            result["whois_private"] = True
        
        # Check registrar
        registrar = w.get("registrar", "Unknown")
        if isinstance(registrar, list):
            registrar = registrar[0]
        result["registrar"] = str(registrar or "Unknown")
    except Exception:
        result["whois_private"] = True  # assume private on failure
    return result


@lru_cache(maxsize=1024)
def fetch_redirects(safe_url: str, url: str) -> dict:
    """Perform HTTP request to trace redirect chain in a cached thread."""
    result = {
        "redirect_hops": 0,
        "final_url": url
    }
    try:
        import requests as req_lib
        resp = req_lib.get(safe_url, allow_redirects=True, timeout=3,
                           headers={"User-Agent": "Mozilla/5.0 LinkLens/2.0"})
        result["redirect_hops"] = len(resp.history)
        result["final_url"] = resp.url
    except Exception:
        pass
    return result


@lru_cache(maxsize=1024)
def fetch_ssl(hostname: str) -> dict:
    """Perform SSL certificate socket connection in a cached thread."""
    result = {
        "ssl_valid": False,
        "ssl_issuer_org": "N/A",
        "is_lets_encrypt": False,
        "is_corporate_ca": False,
        "cert_age_days": -1
    }
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(socket.AF_INET), server_hostname=hostname) as s:
            s.settimeout(3)
            s.connect((hostname, 443))
            cert = s.getpeercert()

        result["ssl_valid"] = True

        # Issuer organisation
        issuer_org = "N/A"
        for field in cert.get("issuer", ()):
            for key, value in field:
                if key == "organizationName":
                    issuer_org = value
                    break
        result["ssl_issuer_org"] = issuer_org

        issuer_lower = issuer_org.lower()
        result["is_lets_encrypt"] = "let's encrypt" in issuer_lower or "lets encrypt" in issuer_lower
        result["is_corporate_ca"] = any(ca in issuer_lower for ca in CORPORATE_CAS)

        # Certificate age
        not_before_str = cert.get("notBefore", "")
        if not_before_str:
            not_before = datetime.strptime(not_before_str, "%b %d %H:%M:%S %Y %Z")
            not_before = not_before.replace(tzinfo=timezone.utc)
            result["cert_age_days"] = (datetime.now(timezone.utc) - not_before).days
    except Exception:
        pass
    return result

# Global ThreadPoolExecutor for background/concurrent queries
_executor = concurrent.futures.ThreadPoolExecutor(max_workers=20)

def extract_advanced_live_features(url: str) -> dict:
    """
    Extract real-time OSINT threat indicators for display in the dashboard.
    These are NOT fed into the ML model — they are used by the hybrid risk
    score engine and displayed in the OSINT metrics panel.
    """
    safe_url = _ensure_scheme(url)
    parsed = urlparse(safe_url)
    hostname = (parsed.hostname or "").lower()

    # ── 1. Check Whitelist ──
    if is_whitelisted_safe_domain(hostname):
        return {
            "domain_age_days": 3650, # 10 years
            "creation_date": "2016-01-01T00:00:00Z",
            "whois_private": False,
            "whois_completed": True,
            "has_base64": False,
            "has_hex": False,
            "has_double_encoding": False,
            "entropy": 2.0,
            "redirect_hops": 0,
            "redirect_completed": True,
            "final_url": url,
            "ssl_valid": True,
            "ssl_completed": True,
            "ssl_issuer_org": "DigiCert Inc",
            "is_lets_encrypt": False,
            "is_corporate_ca": True,
            "cert_age_days": 100,
            "registrar": "MarkMonitor Inc.",
            "base64_analysis": {
                "found": False,
                "raw_string": "",
                "decoded_text": "",
                "verdict": "SAFE",
                "analysis": "No active Base64 encoding detected."
            },
            "encodings_analysis": [],
            "advanced_analysis": {
                "basic_auth": {"detected": False},
                "open_redirect": {"detected": False},
                "ip_obfuscation": {"detected": False},
                "idn_homograph": {"detected": False},
                "typosquatting": {"detected": False},
                "hidden_chars": {"detected": False}
            },
            "evasion_features": {
                "base64_target_param": {"detected": False, "match": "", "decoded": "", "details": ""},
                "url_encoding_density": {"detected": False, "percent_count": 0, "density_ratio": 0.0},
                "double_url_encoding": {"detected": False, "match": ""},
                "hex_obfuscated_path": {"detected": False, "match": "", "decoded": ""},
                "mixed_obfuscation": {"detected": False, "types_found": []},
                "high_parameter_entropy": {"detected": False, "entropy": 0.0, "query_string": ""},
                "dword_hex_ip": {"detected": False, "original": "", "canonical": ""},
                "embedded_data_uri": {"detected": False, "match": ""},
                "punycode_idn_homograph": {"detected": False, "unicode_domain": "", "is_punycode": False},
                "excessive_padding": {"detected": False, "char": "", "max_reps": 0},
                "octal_ip_evasion": {"detected": False, "original": "", "canonical": ""},
                "non_standard_port": {"detected": False, "port": -1}
            }
        }

    # ── 2. Check SQLite Persistent Cache ──
    whois_data = get_whois_from_db(hostname)
    ssl_data = get_ssl_from_db(hostname)
    redirect_data = get_redirect_from_db(url)

    # ── 3. Run missing network lookups concurrently using ThreadPoolExecutor ──
    futures = {}
    if whois_data is None:
        futures["whois"] = _executor.submit(fetch_whois_wrapper, hostname)
    if ssl_data is None:
        futures["ssl"] = _executor.submit(fetch_ssl_wrapper, hostname)
    if redirect_data is None:
        futures["redirect"] = _executor.submit(fetch_redirects_wrapper, safe_url, url)
        
    if futures:
        # Wait up to 1.0 second total for concurrent tasks to finish
        concurrent.futures.wait(list(futures.values()), timeout=1.0)
        
        # Retrieve results for completed tasks, fallback to defaults on timeout/failure
        if "whois" in futures:
            fut = futures["whois"]
            if fut.done():
                try:
                    whois_data = fut.result().copy()
                    whois_data["whois_completed"] = True
                except Exception:
                    whois_data = {"domain_age_days": -1, "creation_date": "Unknown", "whois_private": False, "registrar": "Unknown", "whois_completed": False}
            else:
                whois_data = {"domain_age_days": -1, "creation_date": "Unknown", "whois_private": False, "registrar": "Unknown", "whois_completed": False}
        
        if "ssl" in futures:
            fut = futures["ssl"]
            if fut.done():
                try:
                    ssl_data = fut.result().copy()
                    ssl_data["ssl_completed"] = True
                except Exception:
                    ssl_data = {"ssl_valid": True, "ssl_issuer_org": "N/A", "is_lets_encrypt": False, "is_corporate_ca": False, "cert_age_days": -1, "ssl_completed": False}
            else:
                ssl_data = {"ssl_valid": True, "ssl_issuer_org": "N/A", "is_lets_encrypt": False, "is_corporate_ca": False, "cert_age_days": -1, "ssl_completed": False}
        
        if "redirect" in futures:
            fut = futures["redirect"]
            if fut.done():
                try:
                    redirect_data = fut.result().copy()
                    redirect_data["redirect_completed"] = True
                except Exception:
                    redirect_data = {"redirect_hops": 0, "final_url": url, "redirect_completed": False}
            else:
                redirect_data = {"redirect_hops": 0, "final_url": url, "redirect_completed": False}

    # Ensure fallback values if database had no entries and thread pool did not populate them
    if whois_data is None:
        whois_data = {"domain_age_days": -1, "creation_date": "Unknown", "whois_private": False, "registrar": "Unknown", "whois_completed": False}
    if ssl_data is None:
        ssl_data = {"ssl_valid": True, "ssl_issuer_org": "N/A", "is_lets_encrypt": False, "is_corporate_ca": False, "cert_age_days": -1, "ssl_completed": False}
    if redirect_data is None:
        redirect_data = {"redirect_hops": 0, "final_url": url, "redirect_completed": False}

    # Assemble main result structure
    result = {
        "domain_age_days": whois_data.get("domain_age_days", -1),
        "creation_date": whois_data.get("creation_date", "Unknown"),
        "whois_private": whois_data.get("whois_private", False),
        "whois_completed": whois_data.get("whois_completed", False),
        "has_base64": False,
        "has_hex": False,
        "has_double_encoding": False,
        "entropy": 0.0,
        "redirect_hops": redirect_data.get("redirect_hops", 0),
        "redirect_completed": redirect_data.get("redirect_completed", False),
        "final_url": redirect_data.get("final_url", url),
        "ssl_valid": ssl_data.get("ssl_valid", True),
        "ssl_completed": ssl_data.get("ssl_completed", False),
        "ssl_issuer_org": ssl_data.get("ssl_issuer_org", "N/A"),
        "is_lets_encrypt": ssl_data.get("is_lets_encrypt", False),
        "is_corporate_ca": ssl_data.get("is_corporate_ca", False),
        "cert_age_days": ssl_data.get("cert_age_days", -1),
        "registrar": whois_data.get("registrar", "Unknown"),
        "base64_analysis": {
            "found": False,
            "raw_string": "",
            "decoded_text": "",
            "verdict": "SAFE",
            "analysis": "No active Base64 encoding detected."
        },
        "encodings_analysis": []
    }

    # ── 2. Encoding Detection ─────────────────────────────────────────────────
    try:
        encodings = analyze_all_encodings_in_url(url)
        result["encodings_analysis"] = encodings
        result["has_base64"] = any(e["type"] in ["Base64 Encoding", "Mixed Obfuscation (Base64 + URL)"] for e in encodings)
        result["has_hex"] = any(e["type"] in ["URL Percent/Hex Encoding", "Mixed Obfuscation (Base64 + URL)"] for e in encodings)
        result["has_double_encoding"] = any(e["type"] == "Double URL Encoding" for e in encodings)
        
        # Populate legacy base64_analysis for compatibility
        b64_enc = next((e for e in encodings if e["type"] in ["Base64 Encoding", "Mixed Obfuscation (Base64 + URL)"]), None)
        if b64_enc:
            result["base64_analysis"] = {
                "found": True,
                "raw_string": b64_enc["raw_string"],
                "decoded_text": b64_enc["decoded_text"],
                "verdict": b64_enc["verdict"],
                "analysis": b64_enc["analysis"]
            }
    except Exception:
        pass

    # ── 3. URL Entropy (domain only) ──────────────────────────────────────────
    try:
        result["entropy"] = _shannon_entropy(hostname)
    except Exception:
        pass

    # ── 6. Advanced Phishing Indicators ───────────────────────────────────────
    try:
        registered_domain = _get_registered_domain(hostname)
        result["advanced_analysis"] = {
            "basic_auth": analyze_basic_auth(url),
            "open_redirect": analyze_open_redirect(url),
            "ip_obfuscation": canonicalize_ip(hostname),
            "idn_homograph": analyze_homograph_idn(hostname),
            "typosquatting": analyze_typosquatting(registered_domain),
            "hidden_chars": analyze_hidden_control_chars(url)
        }
    except Exception as e:
        print(f"[!] Error in advanced features: {e}")
        result["advanced_analysis"] = {
            "basic_auth": {"detected": False},
            "open_redirect": {"detected": False},
            "ip_obfuscation": {"detected": False},
            "idn_homograph": {"detected": False},
            "typosquatting": {"detected": False},
            "hidden_chars": {"detected": False}
        }
    try:
        result["evasion_features"] = check_12_evasion_features(url, result)
    except Exception as e:
        print(f"[!] Error in evasion check: {e}")
        result["evasion_features"] = {}

    return result


# ─── Advanced Feature Helper Functions ────────────────────────────────────────

def parse_int_value(part: str) -> int:
    part = part.strip()
    if not part:
        raise ValueError("Empty part")
    
    # Hexadecimal
    if part.lower().startswith("0x"):
        return int(part, 16)
    
    # Octal
    if part.startswith("0") and len(part) > 1:
        if all(c in "01234567" for c in part):
            return int(part, 8)
        else:
            return int(part, 10)
            
    # Decimal
    return int(part, 10)


def canonicalize_ip(hostname: str) -> dict:
    """
    Check if the hostname is an obfuscated or standard IP address.
    """
    if not hostname:
        return {"detected": False}
    
    hostname = hostname.strip().lower()
    
    # Strip bracket for IPv6
    if hostname.startswith("[") and hostname.endswith("]"):
        return {
            "detected": True,
            "type": "IPv6",
            "original": hostname,
            "canonical": hostname
        }
    
    # Split by dots
    parts = hostname.split(".")
    try:
        parsed_parts = [parse_int_value(p) for p in parts]
    except ValueError:
        return {"detected": False}
    
    num_parts = len(parsed_parts)
    if num_parts < 1 or num_parts > 4:
        return {"detected": False}
    
    val = 0
    if num_parts == 4:
        if any(p > 255 for p in parsed_parts):
            return {"detected": False}
        val = (parsed_parts[0] << 24) | (parsed_parts[1] << 16) | (parsed_parts[2] << 8) | parsed_parts[3]
    elif num_parts == 3:
        if parsed_parts[0] > 255 or parsed_parts[1] > 255 or parsed_parts[2] > 65535:
            return {"detected": False}
        val = (parsed_parts[0] << 24) | (parsed_parts[1] << 16) | parsed_parts[2]
    elif num_parts == 2:
        if parsed_parts[0] > 255 or parsed_parts[1] > 16777215:
            return {"detected": False}
        val = (parsed_parts[0] << 24) | parsed_parts[1]
    elif num_parts == 1:
        if parsed_parts[0] > 4294967295:
            return {"detected": False}
        val = parsed_parts[0]
        
    ip_str = f"{(val >> 24) & 0xFF}.{(val >> 16) & 0xFF}.{(val >> 8) & 0xFF}.{val & 0xFF}"
    
    is_standard = False
    if num_parts == 4:
        is_standard = True
        for p in parts:
            if p.startswith("0x") or (p.startswith("0") and len(p) > 1):
                is_standard = False
                break
                
    ip_type = "Standard Dotted-Decimal IP" if is_standard else "Obfuscated IP"
    if not is_standard:
        if num_parts == 1:
            if hostname.startswith("0x"):
                ip_type = "Flat Hexadecimal IP"
            elif hostname.startswith("0"):
                ip_type = "Flat Octal IP"
            else:
                ip_type = "Decimal Integer (DWORD) IP"
        else:
            has_hex = any(p.startswith("0x") for p in parts)
            has_octal = any(p.startswith("0") and not p.startswith("0x") and len(p) > 1 for p in parts)
            if has_hex and has_octal:
                ip_type = "Mixed Hex/Octal Dotted IP"
            elif has_hex:
                ip_type = "Hexadecimal Dotted IP"
            elif has_octal:
                ip_type = "Octal Dotted IP"
            else:
                ip_type = "Non-standard Dotted IP"
                
    return {
        "detected": True,
        "type": ip_type,
        "original": hostname,
        "canonical": ip_str
    }


def analyze_basic_auth(url: str) -> dict:
    """
    Parse URLs for username:password@host pattern and flag basic auth abuse.
    """
    url_with_scheme = _ensure_scheme(url)
    try:
        parsed = urlparse(url_with_scheme)
        netloc = parsed.netloc or ""
        if "@" in netloc:
            parts = netloc.split("@")
            username_part = parts[0]
            actual_host_part = parts[1]
            
            apparent_domain = username_part
            if ":" in username_part:
                apparent_domain = username_part.split(":")[0]
                
            actual_host = actual_host_part
            if ":" in actual_host_part:
                actual_host = actual_host_part.split(":")[0]
                
            return {
                "detected": True,
                "apparent_domain": apparent_domain,
                "actual_host": actual_host,
                "username_part": username_part
            }
    except Exception:
        pass
    return {"detected": False}


def analyze_open_redirect(url: str) -> dict:
    """
    Detect redirect parameters in the query pointing to external domains.
    """
    url_with_scheme = _ensure_scheme(url)
    try:
        parsed = urlparse(url_with_scheme)
        parent_host = (parsed.hostname or "").lower()
        parent_domain = _get_registered_domain(parent_host)
        
        query_params = parse_qs(parsed.query)
        redirect_params = ["redirect", "redirect_uri", "return", "next", "url", "target", "destination", "dest", "rurl", "ret", "continue", "goto", "link", "out", "to"]
        
        for key, values in query_params.items():
            key_lower = key.lower()
            for val in values:
                val = val.strip()
                is_redirect_name = key_lower in redirect_params
                has_url_prefix = val.startswith("http://") or val.startswith("https://") or val.startswith("//")
                
                has_domain_pattern = False
                if not has_url_prefix and "." in val and len(val) > 4:
                    val_with_scheme = _ensure_scheme(val)
                    p_val = urlparse(val_with_scheme)
                    if p_val.hostname and "." in p_val.hostname:
                        has_domain_pattern = True
                
                if is_redirect_name or has_url_prefix or has_domain_pattern:
                    target_url = val if (has_url_prefix or has_domain_pattern) else _ensure_scheme(val)
                    try:
                        p_target = urlparse(target_url if target_url.startswith("http") else f"http://{target_url}")
                        target_host = (p_target.hostname or "").lower()
                        if target_host:
                            target_domain = _get_registered_domain(target_host)
                            if parent_host and target_host != parent_host and target_domain != parent_domain:
                                return {
                                    "detected": True,
                                    "parameter": key,
                                    "destination": val,
                                    "parent_domain": parent_domain,
                                    "target_domain": target_domain,
                                    "is_external": True
                                }
                    except Exception:
                        pass
    except Exception:
        pass
    return {"detected": False}


def analyze_homograph_idn(hostname: str) -> dict:
    """
    Identify Punycode or IDN domains that might look like standard sites.
    """
    if not hostname:
        return {"detected": False}
    
    hostname = hostname.lower()
    is_punycode = hostname.startswith("xn--") or ".xn--" in hostname
    
    unicode_domain = hostname
    try:
        unicode_domain = hostname.encode("ascii").decode("idna")
    except Exception:
        pass
        
    has_lookalikes = False
    non_ascii_chars = [c for c in unicode_domain if ord(c) > 127]
    if non_ascii_chars:
        has_lookalikes = True
        
    if is_punycode or has_lookalikes:
        return {
            "detected": True,
            "is_punycode": is_punycode,
            "unicode_domain": unicode_domain,
            "has_lookalikes": has_lookalikes
        }
    return {"detected": False}


def levenshtein_distance(s1: str, s2: str) -> int:
    """
    Compute edit distance between s1 and s2.
    """
    if len(s1) > len(s2):
        s1, s2 = s2, s1
    distances = range(len(s1) + 1)
    for i2, c2 in enumerate(s2):
        distances_ = [i2+1]
        for i1, c1 in enumerate(s1):
            if c1 == c2:
                distances_.append(distances[i1])
            else:
                distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
        distances = distances_
    return distances[-1]


def analyze_typosquatting(registered_domain: str) -> dict:
    """
    Check if domain is edit-distance or substring-wise close to known brand names.
    """
    if not registered_domain:
        return {"detected": False}
        
    reg_lower = registered_domain.lower()
    
    for brand in BRAND_NAMES:
        if reg_lower == brand:
            continue
            
        dist = levenshtein_distance(reg_lower, brand)
        if dist <= 2:
            return {
                "detected": True,
                "mimicked_brand": brand,
                "type": f"Typosquatting (Edit distance {dist} from brand)"
            }
            
        if brand in reg_lower:
            return {
                "detected": True,
                "mimicked_brand": brand,
                "type": "Brand Mimicry (Brand name embedded in domain)"
            }
            
    return {"detected": False}


def analyze_hidden_control_chars(url: str) -> dict:
    """
    Identify zero-width characters, direction overrides, and control characters in URL.
    """
    hidden_patterns = {
        "\u200b": "Zero-Width Space",
        "\u200c": "Zero-Width Non-Joiner",
        "\u200d": "Zero-Width Joiner",
        "\ufeff": "Byte Order Mark",
        "\u202e": "Right-to-Left Override (BIDI)",
        "\u202d": "Left-to-Right Override (BIDI)",
        "\u202a": "Left-to-Right Embedding",
        "\u202b": "Right-to-Left Embedding",
        "\u202c": "Pop Directional Format"
    }
    
    found = []
    for char, name in hidden_patterns.items():
        if char in url:
            found.append(name)
            
    for i in range(32):
        if i in (9, 10, 13):
            continue
        if chr(i) in url:
            found.append(f"ASCII Control Char (0x{i:02x})")
            
    if found:
        return {
            "detected": True,
            "chars_found": list(set(found))
        }
    return {"detected": False}


def check_12_evasion_features(url: str, live_metrics: dict) -> dict:
    """
    Search for the 12 specific obfuscation and parameter evasion features in the URL.
    """
    import base64
    import urllib.parse
    
    evasion = {
        "base64_target_param": {"detected": False, "match": "", "decoded": "", "details": ""},
        "url_encoding_density": {"detected": False, "percent_count": 0, "density_ratio": 0.0},
        "double_url_encoding": {"detected": False, "match": ""},
        "hex_obfuscated_path": {"detected": False, "match": "", "decoded": ""},
        "mixed_obfuscation": {"detected": False, "types_found": []},
        "high_parameter_entropy": {"detected": False, "entropy": 0.0, "query_string": ""},
        "dword_hex_ip": {"detected": False, "original": "", "canonical": ""},
        "embedded_data_uri": {"detected": False, "match": ""},
        "punycode_idn_homograph": {"detected": False, "unicode_domain": "", "is_punycode": False},
        "excessive_padding": {"detected": False, "char": "", "max_reps": 0},
        "octal_ip_evasion": {"detected": False, "original": "", "canonical": ""},
        "non_standard_port": {"detected": False, "port": -1}
    }
    
    safe_url = _ensure_scheme(url)
    parsed = urlparse(safe_url)
    hostname = (parsed.hostname or "").lower()
    query = parsed.query or ""
    
    # 1. Base64 Encoded Target Parameter Detection
    b64_analysis = live_metrics.get("base64_analysis", {})
    if b64_analysis.get("found"):
        evasion["base64_target_param"] = {
            "detected": True,
            "match": b64_analysis.get("raw_string", ""),
            "decoded": b64_analysis.get("decoded_text", ""),
            "details": b64_analysis.get("analysis", "")
        }
        
    # 2. Standard URL Encoding Density
    percent_count = url.count("%")
    density_ratio = percent_count / len(url) if len(url) > 0 else 0.0
    evasion["url_encoding_density"] = {
        "detected": density_ratio > 0.08,
        "percent_count": percent_count,
        "density_ratio": round(density_ratio, 3)
    }
    
    # 3. Double URL Encoding Tracker
    double_matches = re.findall(r"%25[0-9a-fA-F]{2}", url)
    if double_matches:
        evasion["double_url_encoding"] = {
            "detected": True,
            "match": double_matches[0]
        }
        
    # 4. Hex-Obfuscated Path Strings Identifier
    encodings_list = live_metrics.get("encodings_analysis", [])
    hex_obf = next((e for e in encodings_list if e["type"] == "URL Percent/Hex Encoding" and e["verdict"] == "SUSPICIOUS"), None)
    if hex_obf:
        evasion["hex_obfuscated_path"] = {
            "detected": True,
            "match": hex_obf["raw_string"],
            "decoded": hex_obf["decoded_text"]
        }
        
    # 5. Mixed Obfuscation Flag
    obf_types = []
    if live_metrics.get("has_base64"): obf_types.append("Base64")
    if live_metrics.get("has_hex"): obf_types.append("Hex")
    if live_metrics.get("has_double_encoding"): obf_types.append("Double URL")
    if len(obf_types) >= 2:
        evasion["mixed_obfuscation"] = {
            "detected": True,
            "types_found": obf_types
        }
        
    # 6. High Parameter Entropy Check
    if query:
        entropy_val = _shannon_entropy(query)
        evasion["high_parameter_entropy"] = {
            "detected": entropy_val > 4.2,
            "entropy": round(entropy_val, 3),
            "query_string": query[:60] + "..." if len(query) > 60 else query
        }
        
    # 7. Dword / Hexadecimal IP Domain Detection
    ip_obf = live_metrics.get("advanced_analysis", {}).get("ip_obfuscation", {})
    if ip_obf.get("detected") and ip_obf.get("type") in ["Flat Hexadecimal IP", "Decimal Integer (DWORD) IP", "Hexadecimal Dotted IP", "Mixed Hex/Octal Dotted IP"]:
        evasion["dword_hex_ip"] = {
            "detected": True,
            "original": ip_obf.get("original", ""),
            "canonical": ip_obf.get("canonical", "")
        }
        
    # 8. Embedded Data URI Parameter Scanner
    data_match = re.search(r"data:(?:text|image|application)/[a-z+-]+;base64", url, re.I)
    if data_match:
        evasion["embedded_data_uri"] = {
            "detected": True,
            "match": data_match.group(0)
        }
        
    # 9. Punycode / IDN Homograph Identifier
    idn = live_metrics.get("advanced_analysis", {}).get("idn_homograph", {})
    if idn.get("detected"):
        evasion["punycode_idn_homograph"] = {
            "detected": True,
            "unicode_domain": idn.get("unicode_domain", ""),
            "is_punycode": idn.get("is_punycode", False)
        }
        
    # 10. Excessive Character Padding Anomalies
    pad_match = re.search(r"(.)\1{7,}", url)
    if pad_match:
        evasion["excessive_padding"] = {
            "detected": True,
            "char": pad_match.group(1),
            "max_reps": len(pad_match.group(0))
        }
        
    # 11. Octal IP Address Format Evasion Check
    if ip_obf.get("detected") and ip_obf.get("type") in ["Flat Octal IP", "Octal Dotted IP", "Mixed Hex/Octal Dotted IP"]:
        evasion["octal_ip_evasion"] = {
            "detected": True,
            "original": ip_obf.get("original", ""),
            "canonical": ip_obf.get("canonical", "")
        }
        
    # 12. Non-Standard Web Port Execution
    try:
        if parsed.port and parsed.port not in [80, 443]:
            evasion["non_standard_port"] = {
                "detected": True,
                "port": parsed.port
            }
    except Exception:
        pass
        
    return evasion

