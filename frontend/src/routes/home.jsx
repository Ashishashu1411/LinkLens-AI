import React from 'react';
import { Link } from '@tanstack/react-router';
import { Search, BarChart3, Brain, Globe, AlertTriangle, Lock, Zap, ArrowRight } from 'lucide-react';
import { useMeta } from '../hooks/useMeta';

export function head() {
  return {
    title: 'LinkLens AI — Advanced Threat Intelligence',
    description: 'AI-Powered phishing & defacement link detection platform utilizing Random Forest machine learning and live OSINT diagnostics.'
  };
}

export default function Home() {
  useMeta(head());

  const stats = [
    { value: '99.2%', label: 'Detection Accuracy' },
    { value: '< 1s', label: 'Scan Latency' },
    { value: '30+', label: 'Deep OSINT Signals' },
    { value: '24/7', label: 'Uptime Monitoring' },
  ];

  const features = [
    {
      icon: Brain,
      title: 'Four-Class ML Model',
      description: 'Powered by an ensemble Random Forest model classifying URLs into Legitimate, Defacement, Phishing, or Malware threat classes.',
    },
    {
      icon: Globe,
      title: 'Live OSINT Diagnostics',
      description: 'Performs live scans on WHOIS databases, DNS servers, domain registration dates, and security certificate (SSL) validity.',
    },
    {
      icon: AlertTriangle,
      title: 'Obfuscation Defense',
      description: 'Detects sneaky evasion tactics like Base64 encoding, Hex conversions, double URL encoding, and high-entropy domain naming.',
    },
    {
      icon: Lock,
      title: 'SSL Trust Analysis',
      description: 'Inspects certificate issuer authority, SSL age, validity window, and distinguishes corporate authorities from temporary certs.',
    },
    {
      icon: Zap,
      title: 'Real-Time Risk Engine',
      description: 'Calculates a dynamic risk score from 0 to 100 in real-time, matching ML output with active live security indicators.',
    },
    {
      icon: BarChart3,
      title: 'Visual Security Metrics',
      description: 'Get deep breakdowns of threat classification ratios, score distributions, and daily scanning trends inside your dashboard.',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full py-20 px-6 cyber-grid border-b border-[var(--color-border)] flex flex-col items-center text-center overflow-hidden">
        {/* Animated grid overlay to make it pop */}
        <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 30%, var(--color-background) 80%) pointer-events-none" />

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground mb-6 z-10">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Threat intelligence engine online</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.05] mb-6 z-10">
          Neutralize digital threats <br />
          <span className="text-gradient">before they strike.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground max-w-2xl text-lg sm:text-xl mb-10 z-10 leading-relaxed">
          LinkLens AI analyzes URLs using a hybrid engine combining a four-class Random Forest machine learning classifier and live OSINT threat feeds.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 z-10">
          <Link
            to="/scanner"
            className="bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] text-[oklch(0.14_0.03_250)] glow-primary rounded-xl px-8 py-4 font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 text-base"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            Scan a URL
          </Link>
          <Link
            to="/analytics"
            className="rounded-xl px-8 py-4 font-semibold border border-[var(--color-border)] hover:bg-secondary/60 hover:text-foreground text-muted-foreground transition-all flex items-center justify-center gap-2 active:scale-95 text-base"
          >
            <BarChart3 className="w-5 h-5" />
            View Analytics
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl z-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass p-5 text-center flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-gradient mb-1">{stat.value}</span>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Advanced Security Diagnostics
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our multi-layered inspection engine evaluates URLs against both predictive ML models and live DNS records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass p-6 flex flex-col hover:border-primary/45 transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Block */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full mb-10">
        <div className="glass p-8 md:p-12 relative overflow-hidden cyber-grid border border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-8">
          {/* radial gradient for styling */}
          <div className="absolute inset-0 bg-radial-gradient(circle at right, transparent, var(--color-background) 90%) pointer-events-none" />

          <div className="z-10 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Ready to verify a link?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md">
              Enter any suspicious domain, IP address, or URL pathway to receive instant analysis.
            </p>
          </div>

          <div className="z-10 shrink-0">
            <Link
              to="/scanner"
              className="bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] text-[oklch(0.14_0.03_250)] glow-primary rounded-xl px-8 py-4 font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Launch Scanner
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
