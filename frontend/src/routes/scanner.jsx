import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Shield, Search, Loader2, CheckCircle2, XCircle, AlertTriangle, 
  Calendar, Clock, Globe, Key, ShieldAlert, ShieldCheck, HelpCircle, Link2,
  Binary
} from 'lucide-react';
import { useMeta } from '../hooks/useMeta';

export function head() {
  return {
    title: 'URL Scanner — LinkLens AI',
    description: 'Paste links to run deep-scan diagnostics including machine learning probability distribution and live registry updates.'
  };
}

// --- RiskGauge Component ---
function RiskGauge({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Dynamic color based on score
  let strokeColor = 'var(--color-success)';
  let textColor = 'text-success';
  if (score > 30 && score <= 70) {
    strokeColor = 'var(--color-warning)';
    textColor = 'text-warning';
  } else if (score > 70) {
    strokeColor = 'var(--color-danger)';
    textColor = 'text-danger';
  }

  return (
    <div className="relative flex items-center justify-center select-none shrink-0 w-44 h-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        {/* Background track */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--color-secondary)"
          strokeWidth="12"
        />
        {/* Animated colored gauge */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset,
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-extrabold tracking-tight ${textColor}`}>{Math.round(score)}</span>
        <span className="text-2xs font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Risk Score</span>
      </div>
    </div>
  );
}

export default function Scanner() {
  useMeta(head());
  const [urlInput, setUrlInput] = useState('');


  const scanMutation = useMutation({
    mutationFn: async (urlToScan) => {
      const trimmed = urlToScan.trim();
      if (!trimmed) throw new Error('URL cannot be empty');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${response.status})`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Save scan to history in local storage
      const scans = JSON.parse(localStorage.getItem('linklens_scans') || '[]');
      
      // Determine ML confidence
      const predictedClass = data.predicted_class ?? 0;
      const confidence = data.ml_probabilities && data.ml_probabilities[predictedClass] !== undefined
        ? data.ml_probabilities[predictedClass]
        : data.ml_threat_probability;

      const newScan = {
        id: Math.random().toString(36).substring(2, 9),
        url: data.url,
        verdict: data.verdict,
        threat_type: data.threat_type,
        risk_score: data.risk_score,
        confidence,
        domain_age: data.live_metrics.domain_age_days,
        timestamp: new Date().toISOString(),
        fullResult: data
      };

      localStorage.setItem('linklens_scans', JSON.stringify([newScan, ...scans]));
      toast.success('Threat analysis completed successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to analyze URL');
    }
  });

  const handleScan = (e) => {
    e.preventDefault();
    scanMutation.mutate(urlInput);
  };

  const handleExampleClick = (exampleUrl) => {
    setUrlInput(exampleUrl);
    scanMutation.mutate(exampleUrl);
  };

  const examples = [
    'https://google.com',
    'http://defaced-site.org/index.html',
    'https://paypal-security-update-verification.com/login'
  ];

  const result = scanMutation.data;

  const evasionFeatures = result?.live_metrics?.evasion_features || {};

  const metrics = [
    {
      id: 'base64_target_param',
      name: 'Base64 Parameter',
      desc: 'Detects base64 strings in query parameter keys or values.',
      data: evasionFeatures.base64_target_param,
      renderDetails: (mVal) => mVal?.match && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div className="truncate"><span className="text-muted-foreground font-semibold">Matched:</span> <span className="break-all">{mVal.match}</span></div>
          {mVal.decoded && <div className="truncate"><span className="text-muted-foreground font-semibold">Decoded:</span> <span className="text-primary break-all">{mVal.decoded}</span></div>}
        </div>
      )
    },
    {
      id: 'url_encoding_density',
      name: 'URL Encoding Density',
      desc: 'Flagged if percent-encoding density exceeds 8%.',
      data: evasionFeatures.url_encoding_density,
      renderDetails: (mVal) => mVal && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div><span className="text-muted-foreground font-semibold">Density:</span> <span>{((mVal.density_ratio || 0) * 100).toFixed(1)}%</span></div>
          <div><span className="text-muted-foreground font-semibold">Count:</span> <span>{mVal.percent_count} '%' chars</span></div>
        </div>
      )
    },
    {
      id: 'double_url_encoding',
      name: 'Double URL Encoding',
      desc: 'Detects double-encoded percent signs (%25).',
      data: evasionFeatures.double_url_encoding,
      renderDetails: (mVal) => mVal?.match && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div><span className="text-muted-foreground font-semibold">Sequence:</span> <code className="text-danger">{mVal.match}</code></div>
        </div>
      )
    },
    {
      id: 'hex_obfuscated_path',
      name: 'Hex Path Obfuscation',
      desc: 'Detects hex/percent obfuscation in URL path.',
      data: evasionFeatures.hex_obfuscated_path,
      renderDetails: (mVal) => mVal?.match && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div className="truncate"><span className="text-muted-foreground font-semibold">Matched:</span> <span className="break-all">{mVal.match}</span></div>
          {mVal.decoded && <div className="truncate"><span className="text-muted-foreground font-semibold">Decoded:</span> <span className="text-primary break-all">{mVal.decoded}</span></div>}
        </div>
      )
    },
    {
      id: 'mixed_obfuscation',
      name: 'Mixed Obfuscation',
      desc: 'Multiple encoding types combined to bypass filters.',
      data: evasionFeatures.mixed_obfuscation,
      renderDetails: (mVal) => mVal?.types_found && mVal.types_found.length > 0 && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div><span className="text-muted-foreground font-semibold">Encodings:</span> <span className="text-warning">{mVal.types_found.join(', ')}</span></div>
        </div>
      )
    },
    {
      id: 'high_parameter_entropy',
      name: 'Parameter Entropy',
      desc: 'Measures query parameter randomness (high > 4.2).',
      data: evasionFeatures.high_parameter_entropy,
      renderDetails: (mVal) => mVal && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div><span className="text-muted-foreground font-semibold">Entropy:</span> <span className={mVal.detected ? 'text-danger font-bold' : 'text-success'}>{mVal.entropy}</span></div>
          {mVal.query_string && <div className="truncate"><span className="text-muted-foreground font-semibold">Query:</span> <span className="break-all" title={mVal.query_string}>{mVal.query_string}</span></div>}
        </div>
      )
    },
    {
      id: 'dword_hex_ip',
      name: 'DWORD / Hex IP Host',
      desc: 'Obfuscated IP addresses used as the host domain.',
      data: evasionFeatures.dword_hex_ip,
      renderDetails: (mVal) => mVal?.original && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div><span className="text-muted-foreground font-semibold">Host:</span> <span className="break-all">{mVal.original}</span></div>
          {mVal.canonical && <div><span className="text-muted-foreground font-semibold">Resolves to:</span> <span className="text-primary">{mVal.canonical}</span></div>}
        </div>
      )
    },
    {
      id: 'embedded_data_uri',
      name: 'Embedded Data URI',
      desc: 'Detects data: URI schemas embedded in parameters.',
      data: evasionFeatures.embedded_data_uri,
      renderDetails: (mVal) => mVal?.match && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div className="truncate"><span className="text-muted-foreground font-semibold">Found URI:</span> <span className="break-all text-danger" title={mVal.match}>{mVal.match}</span></div>
        </div>
      )
    },
    {
      id: 'punycode_idn_homograph',
      name: 'Punycode / Homograph',
      desc: 'Detects unicode/Punycode lookalike domain masking.',
      data: evasionFeatures.punycode_idn_homograph,
      renderDetails: (mVal) => mVal && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          {mVal.unicode_domain && <div><span className="text-muted-foreground font-semibold">Unicode:</span> <span className="text-primary">{mVal.unicode_domain}</span></div>}
          <div><span className="text-muted-foreground font-semibold">Type:</span> <span>{mVal.is_punycode ? 'Punycode (xn--)' : 'Unicode Lookalike'}</span></div>
        </div>
      )
    },
    {
      id: 'excessive_padding',
      name: 'Excessive Padding',
      desc: 'Suspicious repeat characters to bypass security checks.',
      data: evasionFeatures.excessive_padding,
      renderDetails: (mVal) => mVal?.char && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div><span className="text-muted-foreground font-semibold">Char:</span> <span>'{mVal.char}'</span></div>
          <div><span className="text-muted-foreground font-semibold">Count:</span> <span className="text-warning">{mVal.max_reps} times</span></div>
        </div>
      )
    },
    {
      id: 'octal_ip_evasion',
      name: 'Octal IP Evasion',
      desc: 'Octal format IP addresses used to hide destination.',
      data: evasionFeatures.octal_ip_evasion,
      renderDetails: (mVal) => mVal?.original && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div><span className="text-muted-foreground font-semibold">Original:</span> <span className="break-all">{mVal.original}</span></div>
          {mVal.canonical && <div><span className="text-muted-foreground font-semibold">Resolves to:</span> <span className="text-primary">{mVal.canonical}</span></div>}
        </div>
      )
    },
    {
      id: 'non_standard_port',
      name: 'Non-Standard Port',
      desc: 'HTTP/HTTPS routed on non-standard ports (not 80/443).',
      data: evasionFeatures.non_standard_port,
      renderDetails: (mVal) => mVal?.port !== undefined && mVal.port !== -1 && (
        <div className="mt-2 text-3xs font-mono space-y-1 border-t border-[var(--color-border)] pt-2">
          <div><span className="text-muted-foreground font-semibold">Port:</span> <span className="text-danger font-bold">{mVal.port}</span></div>
        </div>
      )
    }
  ];

  // Helper functions for displaying threat styles
  const getVerdictStyles = (verdict) => {
    switch (verdict) {
      case 'SAFE':
        return {
          bg: 'bg-success/10 text-success border-success/30',
          badge: 'Verified Clean',
          verdictText: 'SAFE URL',
          icon: ShieldCheck
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-warning/10 text-warning border-warning/30',
          badge: 'Caution Required',
          verdictText: 'SUSPICIOUS LINK',
          icon: AlertTriangle
        };
      case 'DANGEROUS':
        return {
          bg: 'bg-danger/10 text-danger border-danger/30',
          badge: 'Threat Detected',
          verdictText: 'MALICIOUS THREAT',
          icon: ShieldAlert
        };
      default:
        return {
          bg: 'bg-muted/10 text-muted-foreground border-border',
          badge: 'Unknown',
          verdictText: 'UNKNOWN RISK',
          icon: HelpCircle
        };
    }
  };

  // Extract structural properties of the URL for display
  const getStructuralProperties = (url) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
      return {
        length: url.length,
        dots: (url.match(/\./g) || []).length,
        hyphens: (url.match(/-/g) || []).length,
        digits: (url.match(/\d/g) || []).length,
        subdomains: parsed.hostname.split('.').length - 2,
        special: (url.match(/[@%?=&_]/g) || []).length,
        https: url.startsWith('https') ? 'Yes' : 'No',
        ip: /^[0-9.]+$/.test(parsed.hostname) ? 'Yes' : 'No'
      };
    } catch {
      return {
        length: url.length,
        dots: (url.match(/\./g) || []).length,
        hyphens: (url.match(/-/g) || []).length,
        digits: (url.match(/\d/g) || []).length,
        subdomains: 0,
        special: (url.match(/[@%?=&_]/g) || []).length,
        https: url.startsWith('https') ? 'Yes' : 'No',
        ip: 'No'
      };
    }
  };

  return (
    <div className="py-12 px-6 max-w-5xl mx-auto w-full">
      {/* Title Header */}
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-4">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Real-time URL Threat Inspection</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
          URL Threat Scanner
        </h1>
        <p className="text-muted-foreground text-sm max-w-md">
          Inspect any link for phishing signature patterns, defacement vulnerabilities, and active malware payloads.
        </p>
      </div>

      {/* Search Input Container */}
      <div className="glass p-6 md:p-8 mb-8 border border-[var(--color-border)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Paste suspicious URL here... (e.g. PayPal update links, login portals)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={scanMutation.isPending}
              className="w-full bg-secondary/40 border border-[var(--color-border)] rounded-xl pl-12 pr-4 py-4 text-foreground placeholder-muted-foreground font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={scanMutation.isPending || !urlInput.trim()}
            className="bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] text-[oklch(0.14_0.03_250)] glow-primary rounded-xl px-8 py-4 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 text-sm shrink-0"
          >
            {scanMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Link
              </>
            ) : (
              <>
                <Search className="w-5 h-5 stroke-[2.5]" />
                Scan URL
              </>
            )}
          </button>
        </form>

        {/* Example Links */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Try:</span>
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => handleExampleClick(ex)}
              disabled={scanMutation.isPending}
              className="px-2.5 py-1 rounded-md border border-[var(--color-border)] text-muted-foreground hover:text-foreground hover:border-primary/40 bg-secondary/20 hover:bg-secondary/40 transition-all font-mono text-3xs cursor-pointer select-none"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Results Rendering */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          
          {/* Section 1: Verdict Card */}
          <div className="glass p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-[var(--color-border)]">
            <RiskGauge score={result.risk_score} />

            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 overflow-hidden w-full">
              {/* Verdict Header */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase ${getVerdictStyles(result.verdict).bg} flex items-center gap-1.5`}>
                  {React.createElement(getVerdictStyles(result.verdict).icon, { className: 'w-4 h-4' })}
                  {getVerdictStyles(result.verdict).verdictText}
                </div>
                <div className="text-2xs font-mono uppercase tracking-widest text-muted-foreground px-3 py-1 rounded-md border border-[var(--color-border)] bg-secondary/30">
                  {getVerdictStyles(result.verdict).badge}
                </div>
              </div>

              {/* URL */}
              <div className="w-full">
                <p className="text-2xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Target URL</p>
                <p className="font-mono text-sm break-all text-foreground bg-secondary/25 p-3 rounded-lg border border-[var(--color-border)] max-w-full" title={result.url}>
                  {result.url}
                </p>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-6 w-full pt-2">
                <div>
                  <p className="text-2xs font-mono uppercase tracking-wider text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold text-gradient">
                    {result.ml_probabilities && result.ml_probabilities[result.predicted_class] !== undefined
                      ? `${result.ml_probabilities[result.predicted_class]}%`
                      : `${100 - result.ml_threat_probability}%`}
                  </p>
                </div>
                <div>
                  <p className="text-2xs font-mono uppercase tracking-wider text-muted-foreground">ML Threat</p>
                  <p className="text-lg font-bold text-gradient">
                    {result.threat_type || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-2xs font-mono uppercase tracking-wider text-muted-foreground">Domain Age</p>
                  <p className="text-lg font-bold text-gradient">
                    {result.live_metrics.domain_age_days >= 0 
                      ? `${result.live_metrics.domain_age_days}d` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Two-column grid (Reasons + Checklists) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Reasons */}
            <div className="glass p-6 border border-[var(--color-border)]">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Risk Diagnostic Analysis
              </h3>
              
              {result.live_metrics.domain_age_days !== -1 && result.live_metrics.domain_age_days < 30 && (
                <div className="mb-4 p-3.5 rounded-lg border border-danger/30 bg-danger/10 text-danger flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold uppercase tracking-wider">Warning: Newly Registered Domain. </span>
                    This domain was created {result.live_metrics.domain_age_days} days ago. Newly registered domains are statistically highly suspicious.
                  </div>
                </div>
              )}

              <ul className="space-y-3">
                {result.reasons && result.reasons.length > 0 ? (
                  result.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">No specific risk signals triggered. URL appears standard.</li>
                )}
              </ul>
            </div>

            {/* Security Indicators Checklist */}
            <div className="glass p-6 border border-[var(--color-border)]">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Security Indicators
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    label: 'Valid SSL Certificate',
                    condition: result.live_metrics.ssl_valid,
                    desc: result.live_metrics.ssl_valid ? result.live_metrics.ssl_issuer_org : 'No encryption'
                  },
                  {
                    label: 'HTTPS Enabled',
                    condition: result.url.startsWith('https'),
                    desc: result.url.startsWith('https') ? 'Secure transport' : 'Unencrypted HTTP'
                  },
                  {
                    label: 'Public Owner Info',
                    condition: !result.live_metrics.whois_private,
                    desc: result.live_metrics.whois_private ? 'Whois Hidden' : 'Owner registered'
                  },
                  {
                    label: 'No Obfuscation',
                    condition: !(result.live_metrics.has_base64 || result.live_metrics.has_hex || result.live_metrics.has_double_encoding),
                    desc: (result.live_metrics.has_base64 || result.live_metrics.has_hex || result.live_metrics.has_double_encoding) ? 'URL encoding tricks' : 'Plain readable path'
                  },
                  {
                    label: 'Safe Redirect Chain',
                    condition: result.live_metrics.redirect_hops <= 1,
                    desc: `${result.live_metrics.redirect_hops} redirects`
                  },
                  {
                    label: 'Valid Domain Entropy',
                    condition: result.live_metrics.entropy <= 3.8,
                    desc: `Entropy: ${result.live_metrics.entropy.toFixed(2)}`
                  }
                ].map((indicator, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-[var(--color-border)] bg-secondary/10 flex items-start gap-3">
                    {indicator.condition ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{indicator.label}</p>
                      <p className="text-3xs font-mono text-muted-foreground mt-0.5">{indicator.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: WHOIS Domain Intelligence */}
          <div className="glass p-6 border border-[var(--color-border)]">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              WHOIS Domain Intelligence
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Domain Hostname', val: result.url ? new URL(result.url.startsWith('http') ? result.url : `http://${result.url}`).hostname : 'Unknown', icon: Globe },
                { label: 'Domain Registrar', val: result.live_metrics.registrar || 'Unknown', icon: Globe },
                { label: 'SSL Issuer Authority', val: result.live_metrics.ssl_valid ? result.live_metrics.ssl_issuer_org : 'N/A', icon: Key },
                { label: 'Privacy Status', val: result.live_metrics.whois_private ? 'WHOIS Hidden (Suspicious)' : 'Public Registration', icon: Shield },
                { label: 'Creation Date', val: result.live_metrics.creation_date || 'Unknown', icon: Calendar },
                { label: 'SSL Certificate Age', val: result.live_metrics.cert_age_days >= 0 ? `${result.live_metrics.cert_age_days} Days Old` : 'N/A', icon: Clock },
                { label: 'Active Domain Age', val: result.live_metrics.domain_age_days >= 0 ? `${result.live_metrics.domain_age_days} Days` : 'N/A', icon: Clock }
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[var(--color-border)] bg-secondary/15 hover:bg-secondary/25 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <IconComp className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-3xs font-mono uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className="text-xs font-bold text-foreground truncate mt-0.5" title={item.val}>{item.val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: OSINT, Cryptographic & Obfuscation Metrics */}
          <div className="glass p-6 border border-[var(--color-border)] space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground mb-1.5 flex items-center gap-2">
                <Binary className="w-5 h-5 text-primary" />
                OSINT, Cryptographic & Obfuscation Metrics
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time scanning and heuristics checking for advanced evasion attempts, lexical obfuscation, and encoding bypass methods.
              </p>
            </div>

            {/* 12 Heuristics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {metrics.map((m) => {
                const isDetected = m.data?.detected;
                return (
                  <div key={m.id} className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isDetected 
                      ? 'border-danger/30 bg-danger/5 hover:bg-danger/10 shadow-sm shadow-danger/10' 
                      : 'border-[var(--color-border)] bg-secondary/10 hover:bg-secondary/20'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-foreground leading-snug">{m.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-3xs font-mono font-bold tracking-wider uppercase shrink-0 ${
                          isDetected 
                            ? 'bg-danger/15 text-danger border border-danger/25' 
                            : 'bg-success/15 text-success border border-success/25'
                        }`}>
                          {isDetected ? 'Detected' : 'None'}
                        </span>
                      </div>
                      <p className="text-3xs text-muted-foreground leading-normal">{m.desc}</p>
                    </div>
                    {isDetected && m.renderDetails(m.data)}
                  </div>
                );
              })}
            </div>

            {/* Decoded Payloads List */}
            {result.live_metrics.encodings_analysis && result.live_metrics.encodings_analysis.length > 0 && (
              <div className="border-t border-[var(--color-border)] pt-6 space-y-4">
                <h4 className="text-sm font-bold text-foreground">Active Cryptographic/Obfuscated Payload Decoder</h4>
                <div className="space-y-4">
                  {result.live_metrics.encodings_analysis.map((enc, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-[var(--color-border)] bg-secondary/10 hover:border-primary/10 transition-all flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-primary/20 text-primary border border-primary/20">
                            {enc.type}
                          </span>
                          <span className="text-2xs font-mono text-muted-foreground">Active Payload Block</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-3xs font-mono font-bold tracking-wider uppercase flex items-center gap-1 ${
                            enc.verdict === 'SUSPICIOUS' 
                              ? 'bg-danger/10 text-danger border border-danger/20' 
                              : 'bg-success/10 text-success border border-success/20'
                          }`}>
                            {enc.verdict === 'SUSPICIOUS' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {enc.verdict} payload
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-3xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Payload Analysis</span>
                        <p className={`text-xs ${enc.verdict === 'SUSPICIOUS' ? 'text-danger/90 font-medium' : 'text-muted-foreground'}`}>
                          {enc.analysis}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-3xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Original Encoded String</span>
                          <div className="bg-secondary/40 border border-[var(--color-border)] rounded-lg p-2.5 font-mono text-3xs break-all text-muted-foreground max-h-24 overflow-y-auto select-all">
                            {enc.raw_string}
                          </div>
                        </div>
                        <div>
                          <span className="text-3xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Decoded Output</span>
                          <div className="bg-secondary/40 border border-[var(--color-border)] rounded-lg p-2.5 font-mono text-3xs break-all text-foreground max-h-24 overflow-y-auto font-bold select-all">
                            {enc.decoded_text}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Extracted URL Features */}
          <div className="glass p-6 border border-[var(--color-border)]">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-accent" />
              Extracted URL Structural Features
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'URL Length', val: getStructuralProperties(result.url).length },
                { name: 'Dots Count', val: getStructuralProperties(result.url).dots },
                { name: 'Hyphens Count', val: getStructuralProperties(result.url).hyphens },
                { name: 'Digits Count', val: getStructuralProperties(result.url).digits },
                { name: 'Subdomains Count', val: getStructuralProperties(result.url).subdomains },
                { name: 'Special Chars', val: getStructuralProperties(result.url).special },
                { name: 'HTTPS Protocol', val: getStructuralProperties(result.url).https },
                { name: 'IP-as-Host', val: getStructuralProperties(result.url).ip }
              ].map((feat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-[var(--color-border)] bg-secondary/10 hover:border-primary/20 text-center transition-all">
                  <p className="text-3xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{feat.name}</p>
                  <p className="text-base font-extrabold text-foreground">{feat.val}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
