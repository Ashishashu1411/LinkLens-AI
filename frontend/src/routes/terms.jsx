import React from 'react';
import { Shield, FileText, CheckCircle, AlertTriangle, Lock, Globe, Cpu, Terminal } from 'lucide-react';
import { useMeta } from '../hooks/useMeta';

export function head() {
  return {
    title: 'Terms of Service — LinkLens AI',
    description: 'Terms of Service for the LinkLens AI website security scanner and browser extension platform.'
  };
}

export default function Terms() {
  useMeta(head());

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto w-full">
      {/* Page Title */}
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-4">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>Last Updated: June 2026</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg">
          Please read these terms carefully before accessing or using our security diagnostics suite, browser extension, or APIs.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        
        {/* Acceptance of Terms */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            By accessing or using LinkLens AI, including the web application, browser extension, APIs, and related services, you agree to comply with and be bound by these Terms of Service.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you do not agree with these terms, please do not use the service.
          </p>
        </div>

        {/* Description of Service */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">2. Description of Service</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            LinkLens AI is an AI-powered cybersecurity platform designed to analyze website URLs and provide risk assessments related to phishing, malicious websites, and suspicious online activity.
            The platform utilizes machine learning, domain intelligence analysis, and automated threat detection techniques to generate security insights.
          </p>
        </div>

        {/* Permitted Use */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">3. Permitted Use</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Users may use LinkLens AI for website security analysis, cybersecurity research, educational purposes, threat awareness, and personal online safety.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All users must comply with all applicable local, national, and international laws and regulations while using the platform.
          </p>
        </div>

        {/* Prohibited Activities */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[oklch(0.63_0.22_20)]" />
            </div>
            <h2 className="text-lg font-bold text-foreground">4. Prohibited Activities</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Users are strictly prohibited from engaging in the following actions:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-sm text-muted-foreground">
            <li>Using the platform or API endpoints for illegal or unauthorized activities.</li>
            <li>Attempting to disrupt or interfere with the operational infrastructure of our analysis engines.</li>
            <li>Reverse engineering, scraping, or exploiting code scripts and trained machine learning files.</li>
            <li>Deploying bots, spiders, or automated scrapers to overload backend servers.</li>
            <li>Distributing malware, phishing landing templates, or other exploits through LinkLens portals.</li>
            <li>Attempting unauthorized authentication bypasses or database exploits.</li>
          </ul>
        </div>

        {/* Accuracy of Results */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">5. Accuracy of Results</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            LinkLens AI generates risk assessments using heuristic evaluations, active SSL certificates, and Random Forest machine learning models.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            While we continuously refine detection models:
          </p>
          <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted-foreground mb-3">
            <li>Outputs may return false positive readings on benign sites.</li>
            <li>Outputs may return false negative readings on advanced evasive phishing kits.</li>
            <li>Diagnostics should be utilized for informational audits rather than absolute security guarantees.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
            Users are strongly advised to independently verify website host credibility before inputting sensitive credentials or financial details.
          </p>
        </div>

        {/* Intellectual Property */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">6. Intellectual Property</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All code libraries, visual components, styling schemes, logos, trained classification model files (.pkl), heuristics parameters, and documentation associated with LinkLens AI remain the exclusive intellectual property of the project owner unless stated otherwise. Unauthorized redistribution, copying, or commercial exploitation is strictly prohibited without authorization.
          </p>
        </div>

        {/* Browser Extension Usage */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">7. Browser Extension Usage</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            By installing the browser extension, you authorize it to:
          </p>
          <ul className="space-y-2 pl-4 list-disc text-xs text-muted-foreground">
            <li>Inspect the hostnames of active tabs to query threat analysis endpoints.</li>
            <li>Display alert warning cards and browser-level system notifications.</li>
            <li>Store whitelisted domains and history tables locally.</li>
            <li>Communicate with verified local or remote backend gateways.</li>
          </ul>
        </div>

        {/* Limitation of Liability */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[oklch(0.63_0.22_20)]" />
            </div>
            <h2 className="text-lg font-bold text-foreground">8. Limitation of Liability</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 font-semibold text-[oklch(0.63_0.22_20)]">
            LinkLens AI is provided on an "as is" and "as available" basis without warranty of any kind.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Under no circumstances shall the developers, contributors, or project administrators be held liable for:
          </p>
          <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted-foreground">
            <li>Financial losses or transaction thefts from external phishing campaigns.</li>
            <li>Data breach exposures or security incidents occurring on visited websites.</li>
            <li>Business interruptions or downtime associated with blocked domains.</li>
            <li>Decisions regarding web access made by users relying on extension badges or warning pages.</li>
          </ul>
        </div>

        {/* Term details */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-foreground mb-3">9. Availability, Whitelists &amp; Service Disruption</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong>Service Availability:</strong> We do not guarantee 100% uptime for local or remote API gateways. Services, classifications, and parameters may be updated, suspended, or discontinued without prior warning.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong>Third-Party Links:</strong> Threat intelligence may integrate with third-party domain lookup engines. We do not assume responsibility for third-party practices.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Privacy Policy:</strong> Use of our analysis engine is simultaneously governed by our <a href="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</a>, which details how data remains anonymized and localized.
          </p>
        </div>

        {/* Contact */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)] text-center">
          <h2 className="text-base font-bold text-foreground mb-2">Terms Modification &amp; Termination</h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            We reserve the right to suspend API key permissions or modify these Terms of Service. Continued usage of our website portals or extension packages constitutes full acceptance of updated terms.
          </p>
        </div>

      </div>
    </div>
  );
}
