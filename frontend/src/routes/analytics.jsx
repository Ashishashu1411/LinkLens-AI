import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid
} from 'recharts';
import { 
  BarChart3, Activity, ShieldCheck, ShieldAlert, AlertTriangle, 
  Percent, ArrowRight, Library
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useMeta } from '../hooks/useMeta';

export function head() {
  return {
    title: 'Analytics — LinkLens AI',
    description: 'Visual insights, threat classification distribution ratios, risk bucket metrics, and historical daily trends.'
  };
}

// oklch theme helper mappings for colors
const THEME_COLORS = {
  legitimate: 'oklch(0.72 0.18 155)', // success
  phishing: 'oklch(0.65 0.25 25)',   // danger
  defacement: 'oklch(0.78 0.17 65)', // warning
  malware: 'oklch(0.6 0.2 280)'      // accent / violet
};

export default function Analytics() {
  useMeta(head());
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const stored = localStorage.getItem('linklens_scans');
    if (stored) {
      setScans(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="py-20 px-6 max-w-6xl mx-auto w-full flex flex-col items-center justify-center">
        <Activity className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-muted-foreground text-sm font-mono">Compiling threat metrics...</p>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="py-20 px-6 max-w-6xl mx-auto w-full flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center mb-6">
          <BarChart3 className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">No Analytics Available</h1>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          You need to analyze URLs first before LinkLens AI can generate security metrics and distribution dashboards.
        </p>
        <Link
          to="/scanner"
          className="bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] text-[oklch(0.14_0.03_250)] glow-primary rounded-xl px-5 py-2.5 font-bold transition-all text-xs flex items-center gap-1.5 active:scale-95"
        >
          Launch Threat Scanner
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>
    );
  }

  // 1. KPI calculations
  const totalScans = scans.length;
  const legitimateCount = scans.filter(s => s.threat_type === 'Benign' || s.verdict === 'SAFE').length;
  const phishingCount = scans.filter(s => s.threat_type === 'Phishing').length;
  const defacementCount = scans.filter(s => s.threat_type === 'Defacement').length;
  const malwareCount = scans.filter(s => s.threat_type === 'Malware').length;
  
  const avgRiskScore = totalScans > 0 
    ? Math.round(scans.reduce((sum, s) => sum + s.risk_score, 0) / totalScans) 
    : 0;

  // 2. Pie Chart: Threat Distribution
  const pieData = [
    { name: 'Legitimate', value: legitimateCount, color: THEME_COLORS.legitimate },
    { name: 'Phishing', value: phishingCount, color: THEME_COLORS.phishing },
    { name: 'Defacement', value: defacementCount, color: THEME_COLORS.defacement },
    { name: 'Malware', value: malwareCount, color: THEME_COLORS.malware }
  ].filter(d => d.value > 0);

  // 3. Bar Chart: Risk Score Distribution (5 buckets: 0-20, 21-40, 41-60, 61-80, 81-100)
  const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  scans.forEach(s => {
    if (s.risk_score <= 20) buckets['0-20']++;
    else if (s.risk_score <= 40) buckets['21-40']++;
    else if (s.risk_score <= 60) buckets['41-60']++;
    else if (s.risk_score <= 80) buckets['61-80']++;
    else buckets['81-100']++;
  });

  const barData = Object.keys(buckets).map(key => ({
    bucket: key,
    count: buckets[key]
  }));

  // 4. Line Chart: Daily Scan Trend (last 14 days)
  const trendData = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const keyString = d.toDateString();
    
    // count scans matches keyString
    const count = scans.filter(s => new Date(s.timestamp).toDateString() === keyString).length;
    trendData.push({
      date: label,
      scans: count
    });
  }

  // Reusable custom tooltip styled to match semantic color values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-popover)] border border-[var(--color-border)] rounded-lg p-3 shadow-xl backdrop-blur-md">
          <p className="text-2xs font-mono text-muted-foreground uppercase mb-1">{label || payload[0].name}</p>
          <p className="text-xs font-bold text-foreground">
            {payload[0].name ? `${payload[0].name}: ` : 'Scans: '}
            <span className="text-primary">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto w-full">
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Analytics Platform</h1>
        <p className="text-muted-foreground text-sm mt-1">Global security dashboards and machine learning performance logs.</p>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        
        {/* Total Scans */}
        <div className="glass p-5 border border-[var(--color-border)] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-muted-foreground text-3xs font-mono uppercase tracking-widest leading-none">Total Scans</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{totalScans}</p>
          <p className="text-3xs text-muted-foreground mt-1.5">Logged audit requests</p>
        </div>

        {/* Legitimate */}
        <div className="glass p-5 border border-[var(--color-border)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-muted-foreground text-3xs font-mono uppercase tracking-widest leading-none">Legitimate</span>
            <ShieldCheck className="w-4 h-4 text-success" />
          </div>
          <p className="text-3xl font-extrabold text-success">{legitimateCount}</p>
          <p className="text-3xs text-muted-foreground mt-1.5">No threat signals found</p>
        </div>

        {/* Phishing */}
        <div className="glass p-5 border border-[var(--color-border)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-muted-foreground text-3xs font-mono uppercase tracking-widest leading-none">Phishing</span>
            <ShieldAlert className="w-4 h-4 text-danger" />
          </div>
          <p className="text-3xl font-extrabold text-danger">{phishingCount}</p>
          <p className="text-3xs text-muted-foreground mt-1.5">Social engineering links</p>
        </div>

        {/* Defacement */}
        <div className="glass p-5 border border-[var(--color-border)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-muted-foreground text-3xs font-mono uppercase tracking-widest leading-none">Defacement</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-3xl font-extrabold text-warning">{defacementCount}</p>
          <p className="text-3xs text-muted-foreground mt-1.5">Compromised target sites</p>
        </div>

        {/* Avg Risk Score */}
        <div className="glass p-5 border border-[var(--color-border)] flex flex-col justify-between relative overflow-hidden col-span-2 md:col-span-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-muted-foreground text-3xs font-mono uppercase tracking-widest leading-none">Avg Risk</span>
            <Percent className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-extrabold text-accent">{avgRiskScore}%</p>
          <p className="text-3xs text-muted-foreground mt-1.5">Average score compiled</p>
        </div>
      </div>

      {/* Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        
        {/* Pie Chart: Threat Distribution (2 cols) */}
        <div className="glass p-6 border border-[var(--color-border)] lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-mono uppercase tracking-wider text-foreground mb-4">Threat Distribution</h3>
          <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/15 px-3 py-2 rounded-lg border border-[var(--color-border)]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-foreground truncate">{item.name}</span>
                <span className="ml-auto font-mono text-3xs text-muted-foreground">({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Risk Score Distribution (3 cols) */}
        <div className="glass p-6 border border-[var(--color-border)] lg:col-span-3 flex flex-col">
          <h3 className="text-sm font-mono uppercase tracking-wider text-foreground mb-4">Risk Score Distribution</h3>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="bucket" 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false} 
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="oklch(0.78 0.16 200)" // primary (cyan)
                  radius={[6, 6, 0, 0]}
                  name="Scans" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Full-width Line Chart: Daily Scan Trend */}
      <div className="glass p-6 border border-[var(--color-border)] w-full flex flex-col">
        <h3 className="text-sm font-mono uppercase tracking-wider text-foreground mb-4">Daily Scan Volume (Last 14 Days)</h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-muted-foreground)" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false} 
              />
              <YAxis 
                stroke="var(--color-muted-foreground)" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="scans" 
                stroke="oklch(0.78 0.16 200)" // primary
                strokeWidth={3}
                dot={{ fill: 'oklch(0.18 0.03 250)', stroke: 'oklch(0.78 0.16 200)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Total Scans"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
