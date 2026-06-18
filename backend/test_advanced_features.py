import os
import sys

# Add directory to python path
sys.path.append(os.path.dirname(__file__))

from extractor import (
    canonicalize_ip,
    analyze_basic_auth,
    analyze_open_redirect,
    analyze_homograph_idn,
    analyze_typosquatting,
    analyze_hidden_control_chars
)

def run_tests():
    print("=== STARTING ADVANCED HEURISTICS TESTS ===")
    
    # 1. IP Obfuscation Tests
    print("\nTesting IP Obfuscation...")
    assert canonicalize_ip("192.168.1.1")["type"] == "Standard Dotted-Decimal IP"
    assert canonicalize_ip("0xC0.0xA8.0x01.0x01")["canonical"] == "192.168.1.1"
    assert canonicalize_ip("0xC0.0xA8.0x01.0x01")["type"] == "Hexadecimal Dotted IP"
    assert canonicalize_ip("0300.0250.0001.0001")["canonical"] == "192.168.1.1"
    assert canonicalize_ip("0300.0250.0001.0001")["type"] == "Octal Dotted IP"
    assert canonicalize_ip("3232235777")["canonical"] == "192.168.1.1"
    assert canonicalize_ip("3232235777")["type"] == "Decimal Integer (DWORD) IP"
    assert canonicalize_ip("0xC0A80101")["canonical"] == "192.168.1.1"
    assert canonicalize_ip("0xC0A80101")["type"] == "Flat Hexadecimal IP"
    assert not canonicalize_ip("google.com")["detected"]
    print("[+] IP Obfuscation tests passed!")

    # 2. Basic Auth Tests
    print("\nTesting Basic Auth...")
    assert analyze_basic_auth("https://paypal.com@google.com")["detected"]
    assert analyze_basic_auth("https://paypal.com@google.com")["apparent_domain"] == "paypal.com"
    assert analyze_basic_auth("https://paypal.com@google.com")["actual_host"] == "google.com"
    assert analyze_basic_auth("https://user:pass@google.com")["detected"]
    assert analyze_basic_auth("https://user:pass@google.com")["apparent_domain"] == "user"
    assert not analyze_basic_auth("https://google.com/search?q=paypal@google.com")["detected"]
    print("[+] Basic Auth tests passed!")

    # 3. Open Redirect Tests
    print("\nTesting Open Redirects...")
    assert analyze_open_redirect("https://legitimate.com/login?redirect=https://evil.com")["detected"]
    assert analyze_open_redirect("https://legitimate.com/login?redirect=https://evil.com")["target_domain"] == "evil"
    assert analyze_open_redirect("https://legitimate.com/login?url=https://evil.com")["detected"]
    # Same domain redirect should not trigger
    assert not analyze_open_redirect("https://legitimate.com/login?redirect=https://sub.legitimate.com")["detected"]
    print("[+] Open Redirect tests passed!")

    # 4. Homograph / IDN Tests
    print("\nTesting Homograph/IDN...")
    assert analyze_homograph_idn("xn--gp-mia.com")["detected"]
    assert analyze_homograph_idn("xn--gp-mia.com")["unicode_domain"] == "gáp.com"
    assert not analyze_homograph_idn("google.com")["detected"]
    print("[+] Homograph/IDN tests passed!")

    # 5. Typosquatting Tests
    print("\nTesting Typosquatting...")
    assert analyze_typosquatting("paypa1")["detected"]
    assert analyze_typosquatting("paypa1")["mimicked_brand"] == "paypal"
    assert analyze_typosquatting("g00gle")["detected"]
    assert analyze_typosquatting("g00gle")["mimicked_brand"] == "google"
    # Embedded brand name
    assert analyze_typosquatting("secure-paypal")["detected"]
    assert analyze_typosquatting("secure-paypal")["mimicked_brand"] == "paypal"
    # Exact brand name should not typosquat
    assert not analyze_typosquatting("paypal")["detected"]
    print("[+] Typosquatting tests passed!")

    # 6. Hidden Control Characters Tests
    print("\nTesting Hidden Characters...")
    assert analyze_hidden_control_chars("https://google.com/login\u200b")["detected"]
    assert "Zero-Width Space" in analyze_hidden_control_chars("https://google.com/login\u200b")["chars_found"]
    assert analyze_hidden_control_chars("https://google.com/\u202elogin")["detected"]
    assert "Right-to-Left Override (BIDI)" in analyze_hidden_control_chars("https://google.com/\u202elogin")["chars_found"]
    print("[+] Hidden Characters tests passed!")

    print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
