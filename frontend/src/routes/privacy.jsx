import React from 'react';
import { Shield, Eye, Lock, FileText, CheckCircle, Cpu, Terminal, AlertTriangle } from 'lucide-react';
import { useMeta } from '../hooks/useMeta';

export function head() {
  return {
    title: 'Privacy Policy — LinkLens AI',
    description: 'Privacy Policy for the LinkLens AI website security scanner and browser extension platform.'
  };
}

export default function Privacy() {
  useMeta(head());

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto w-full">
      {/* Page Title */}
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-4">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>Last Updated: June 2026</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg">
          Learn how LinkLens AI collects, processes, and protects your information across our web applications and browser extensions.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        
        {/* Introduction */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">1. Introduction</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            LinkLens AI is an AI-powered phishing URL detection and website security analysis platform available as both a web application and browser extension. The platform is designed to help users identify potentially malicious, phishing, and suspicious websites through machine learning and domain intelligence analysis.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This Privacy Policy explains how LinkLens AI collects, processes, stores, and protects information when users interact with the web application or browser extension.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            LinkLens AI only processes information necessary to perform website security analysis.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Data We May Process
              </h3>
              <ul className="space-y-2">
                <li className="text-xs text-muted-foreground">• URLs submitted by users for scanning</li>
                <li className="text-xs text-muted-foreground">• Active tab URLs (when background scanning is enabled)</li>
                <li className="text-xs text-muted-foreground">• Scan timestamps & risk scores</li>
                <li className="text-xs text-muted-foreground">• Threat classification results (ML outputs)</li>
                <li className="text-xs text-muted-foreground">• Domain WHOIS registration dates and SSL status</li>
                <li className="text-xs text-muted-foreground">• App usage logs for debugging and telemetry</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.63_0.22_20)]" />
                What We Do NOT Collect
              </h3>
              <ul className="space-y-2">
                <li className="text-xs text-muted-foreground">• Passwords or banking information</li>
                <li className="text-xs text-muted-foreground">• Personal messages or emails</li>
                <li className="text-xs text-muted-foreground">• Credit card or transaction records</li>
                <li className="text-xs text-muted-foreground">• User credentials or local document files</li>
                <li className="text-xs text-muted-foreground">• Sensitive personal identify details</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Purpose of Data Processing */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">3. Purpose of Data Processing</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Information is processed solely for providing our core security diagnostics:
          </p>
          <ul className="space-y-2">
            <li className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Detecting phishing and malicious website hosts.</span>
            </li>
            <li className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Calculating risk scores using local Random Forest models.</span>
            </li>
            <li className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Gathering live domain age, SSL status, and hop redirections.</span>
            </li>
            <li className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Triggering alerts and intercept warning block pages.</span>
            </li>
            <li className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Storing local scans inside your history logs.</span>
            </li>
          </ul>
        </div>

        {/* Browser Extension Permissions */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">4. Browser Extension Permissions</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            To run background protection, the LinkLens AI extension requests access to:
          </p>
          <ul className="space-y-2.5 pl-4 list-disc text-sm text-muted-foreground">
            <li><strong>Active Tab &amp; Tabs:</strong> Used to capture the loaded URL.</li>
            <li><strong>Storage:</strong> To store your Whitelisted Allowed sites and cached scan results locally.</li>
            <li><strong>Notifications:</strong> To trigger system alerts for high-risk domains.</li>
          </ul>
        </div>

        {/* Data Storage & Security */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">5. Data Storage, Whitelists &amp; Third-Parties</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong>Data Storage:</strong> Scan history is saved locally in your browser storage context (`localStorage` or `chrome.storage.local`). No sensitive information is sent back or archived globally.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong>Third Parties:</strong> LinkLens AI only queries domain registration lookup servers (WHOIS records) and certificate details. These are anonymous lookup requests.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Data Sharing:</strong> LinkLens AI never sells, rents, shares, or trades your scanned link data or browser usage history with any third parties or advertisers.
          </p>
        </div>

        {/* Disclaimer & Disclaimer */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)]">
          <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">6. Disclaimers &amp; Rights</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            <strong>Risk Assessments:</strong> Assessments are generated using machine learning classification, active SSL inspection, and WHOIS registrations. These results are informational and do not represent absolute security guarantees. Users should always exercise caution.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Your Rights:</strong> You may wipe your scan history logs, clear the allowed whitelist domains, or remove the extension/app files at any time to delete all associated local data footprints.
          </p>
        </div>

        {/* Contact */}
        <div className="glass p-6 md:p-8 border border-[var(--color-border)] text-center">
          <h2 className="text-base font-bold text-foreground mb-2">Questions Regarding Privacy?</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            For questions about this policy, contact the LinkLens AI support desk or submit an issue ticket in the official project repository.
          </p>
        </div>

      </div>
    </div>
  );
}
