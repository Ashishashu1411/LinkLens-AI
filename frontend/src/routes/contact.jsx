import React, { useState } from 'react';
import { Mail, Shield, MessageSquare, Copy, Check, ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useMeta } from '../hooks/useMeta';

export function head() {
  return {
    title: 'Contact Us — LinkLens AI',
    description: 'Get in touch with the LinkLens AI security administration team for support, diagnostics, or research inquiries.'
  };
}

export default function Contact() {
  useMeta(head());
  const [copied, setCopied] = useState(false);
  const emailAddress = 'ashishbharti651@gmail.com';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailAddress)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="py-12 px-6 max-w-2xl mx-auto w-full">
      {/* Page Title */}
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-4">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          <span>Support &amp; Feedback</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
          Contact Us
        </h1>
        <p className="text-muted-foreground text-sm max-w-md">
          Have questions, custom feature suggestions, or security analysis feedback? Get in touch with our team.
        </p>
      </div>

      {/* Contact Card */}
      <div className="glass p-8 border border-[var(--color-border)] shadow-2xl relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full filter blur-xl" />
        
        <div className="flex items-center gap-4 mb-6 border-b border-[var(--color-border)] pb-5">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Official Communications</h2>
            <p className="text-xs text-muted-foreground">LinkLens AI Project Administrator</p>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            For support inquiries, system integration suggestions, or academic research collaborations, you can directly email our project coordinator.
          </p>

          {/* Clickable/Copyable Email Field */}
          <div className="bg-secondary/40 border border-[var(--color-border)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">EMAIL_ENDPOINT</span>
              <a 
                href={`mailto:${emailAddress}`} 
                className="text-sm font-semibold text-primary hover:underline font-mono break-all"
              >
                {emailAddress}
              </a>
            </div>
            
            <button 
              onClick={copyToClipboard}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] text-xs font-semibold text-foreground transition-all duration-200 active:scale-95 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[oklch(0.78_0.16_200)]" />
                  <span className="text-[oklch(0.78_0.16_200)]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SOC Context Shield */}
      <div className="mt-8 glass p-5 border border-[var(--color-border)] flex items-start gap-4 rounded-xl">
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-foreground mb-1">Response Telemetry</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Emails are checked periodically. For quick local extension debugging, use the built-in mock server or review documentation guides inside the repository.
          </p>
        </div>
      </div>

      {/* Navigation Return Link */}
      <div className="text-center mt-10">
        <Link
          to="/scanner"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          Return to Scan Dashboard
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
