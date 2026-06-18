import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Search, Filter, Trash2, Shield, AlertTriangle, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useMeta } from '../hooks/useMeta';

export function head() {
  return {
    title: 'Scan History — LinkLens AI',
    description: 'Audit logs, risk assessments, threat types, classification confidence, and domain creation times.'
  };
}

// Mock scans to seed if localStorage is empty
const MOCK_SCANS = [
  {
    id: 'm1',
    url: 'https://github.com/login',
    verdict: 'SAFE',
    threat_type: 'Benign',
    risk_score: 12.0,
    confidence: 99.1,
    domain_age: 6205,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'm2',
    url: 'http://bankofamerica-login-verification-support.net/secure/auth.html',
    verdict: 'DANGEROUS',
    threat_type: 'Phishing',
    risk_score: 95.0,
    confidence: 96.4,
    domain_age: 4,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'm3',
    url: 'http://my-blog-hacked.ru/wp-content/themes/',
    verdict: 'SUSPICIOUS',
    threat_type: 'Defacement',
    risk_score: 55.0,
    confidence: 78.2,
    domain_age: 340,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'm4',
    url: 'http://malware-download-portal-unzipped.cc/installers/update.exe',
    verdict: 'DANGEROUS',
    threat_type: 'Malware',
    risk_score: 98.0,
    confidence: 91.5,
    domain_age: 18,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  }
];

export default function History() {
  useMeta(head());
  const [scans, setScans] = useState([]);
  const [search, setSearch] = useState('');
  const [threatFilter, setThreatFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed initial mock scans if storage empty
    const stored = localStorage.getItem('linklens_scans');
    if (!stored) {
      localStorage.setItem('linklens_scans', JSON.stringify(MOCK_SCANS));
      setScans(MOCK_SCANS);
    } else {
      setScans(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local scan history?')) {
      localStorage.removeItem('linklens_scans');
      setScans([]);
      toast.success('Scan history cleared successfully');
    }
  };

  // Filter functionality
  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.url.toLowerCase().includes(search.toLowerCase());
    
    const matchesThreat = threatFilter === 'All' || 
      (threatFilter === 'Legitimate' && (scan.threat_type === 'Benign' || scan.verdict === 'SAFE')) ||
      scan.threat_type.toLowerCase() === threatFilter.toLowerCase() ||
      scan.verdict.toLowerCase() === threatFilter.toLowerCase();

    let matchesRisk = true;
    if (riskFilter === 'Low') {
      matchesRisk = scan.risk_score <= 30;
    } else if (riskFilter === 'Medium') {
      matchesRisk = scan.risk_score > 30 && scan.risk_score <= 70;
    } else if (riskFilter === 'High') {
      matchesRisk = scan.risk_score > 70;
    }

    return matchesSearch && matchesThreat && matchesRisk;
  });

  const getVerdictBadgeClass = (verdict) => {
    switch (verdict) {
      case 'SAFE':
        return 'bg-success/10 text-success border-success/30';
      case 'SUSPICIOUS':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'DANGEROUS':
        return 'bg-danger/10 text-danger border-danger/30';
      default:
        return 'bg-secondary text-muted-foreground border-[var(--color-border)]';
    }
  };

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto w-full flex-1">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Scan Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Audit previous link scans and generated diagnostic risk reports.</p>
        </div>
        {scans.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-danger/30 text-danger hover:bg-danger/10 active:scale-95 transition-all flex items-center gap-2 max-w-fit cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear Audit Log
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by URL or domain name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/35 border border-[var(--color-border)] rounded-lg pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all font-mono"
          />
        </div>

        {/* Threat Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-2xs font-mono uppercase text-muted-foreground">Threat:</label>
          <select
            value={threatFilter}
            onChange={(e) => setThreatFilter(e.target.value)}
            className="flex-1 bg-secondary/35 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
          >
            <option value="All">All Threat Types</option>
            <option value="Legitimate">Legitimate</option>
            <option value="Phishing">Phishing</option>
            <option value="Defacement">Defacement</option>
            <option value="Malware">Malware</option>
          </select>
        </div>

        {/* Risk Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-2xs font-mono uppercase text-muted-foreground">Risk:</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="flex-1 bg-secondary/35 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk (≤30)</option>
            <option value="Medium">Medium Risk (31-70)</option>
            <option value="High">High Risk (&gt;70)</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="glass p-12 text-center flex flex-col items-center justify-center border border-[var(--color-border)]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-muted-foreground text-sm font-mono">Loading local threat records...</p>
        </div>
      ) : filteredScans.length === 0 ? (
        /* Empty State */
        <div className="glass p-16 text-center border border-[var(--color-border)] flex flex-col items-center max-w-full">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <Filter className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No Audit Logs Found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            {scans.length === 0 
              ? "You haven't run any URL scans yet. Start scanning to log threat diagnostic entries."
              : "No logs match the current search filters. Try adjusting your query parameters."}
          </p>
          {scans.length === 0 && (
            <a
              href="/scanner"
              className="bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] text-[oklch(0.14_0.03_250)] glow-primary rounded-xl px-5 py-2.5 font-bold transition-all text-xs flex items-center gap-1.5 active:scale-95"
            >
              Analyze a URL
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </a>
          )}
        </div>
      ) : (
        /* Results Table */
        <div className="glass overflow-hidden border border-[var(--color-border)] shadow-xl">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-secondary/20">
                  <th className="px-5 py-3.5 text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Target URL</th>
                  <th className="px-5 py-3.5 text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Threat Verdict</th>
                  <th className="px-5 py-3.5 text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">ML Class</th>
                  <th className="px-5 py-3.5 text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Confidence</th>
                  <th className="px-5 py-3.5 text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Risk Score</th>
                  <th className="px-5 py-3.5 text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Domain Age</th>
                  <th className="px-5 py-3.5 text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Scan Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-secondary/35 transition-colors group">
                    {/* URL */}
                    <td className="px-5 py-4 font-mono text-xs max-w-xs md:max-w-sm truncate text-foreground" title={scan.url}>
                      {scan.url}
                    </td>
                    
                    {/* Verdict */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-2xs font-mono font-bold tracking-wider uppercase ${getVerdictBadgeClass(scan.verdict)}`}>
                        {scan.verdict}
                      </span>
                    </td>

                    {/* Threat Type */}
                    <td className="px-5 py-4 text-xs font-semibold text-foreground">
                      {scan.threat_type}
                    </td>

                    {/* Confidence */}
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {scan.confidence ? `${scan.confidence.toFixed(1)}%` : 'N/A'}
                    </td>

                    {/* Risk Score */}
                    <td className="px-5 py-4 font-mono text-xs">
                      <span className="font-bold text-foreground">{Math.round(scan.risk_score)}</span>
                      <span className="text-muted-foreground text-3xs font-light">/100</span>
                    </td>

                    {/* Domain Age */}
                    <td className="px-5 py-4 text-xs text-muted-foreground font-mono">
                      {scan.domain_age >= 0 ? `${scan.domain_age}d` : 'N/A'}
                    </td>

                    {/* Relative Scan Time */}
                    <td className="px-5 py-4 text-xs text-muted-foreground font-mono">
                      {formatDistanceToNow(new Date(scan.timestamp), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
