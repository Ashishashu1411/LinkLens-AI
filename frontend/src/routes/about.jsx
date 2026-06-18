import React from 'react';
import { 
  Shield, HelpCircle, AlertTriangle, Cpu, CheckSquare, 
  Globe, Zap, RefreshCw, Mail, Smartphone, ArrowRight
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useMeta } from '../hooks/useMeta';

export function head() {
  return {
    title: 'About — LinkLens AI',
    description: 'Educational resources about phishing threats, dynamic analysis methodologies, and future product roadmap initiatives.'
  };
}

export default function About() {
  useMeta(head());
  const sections = [
    {
      icon: HelpCircle,
      title: 'What is Phishing?',
      body: 'Phishing is a type of social engineering attack where malicious actors deceive individuals into revealing sensitive information—such as login credentials, credit card numbers, or system configurations. Attackers typically masquerade as trusted entities (e.g., banks, tech support, colleagues) through emails, text messages, or spoofed landing pages.',
    },
    {
      icon: AlertTriangle,
      title: 'Common Cyber Link Threats',
      bullets: [
        'Credential Harvesting: Fake login portals designed to capture usernames and passwords.',
        'Drive-by Downloads: Websites hosting scripts that automatically download malware or ransomware.',
        'Website Defacement: Hacked sites modified by malicious actors to display unauthorized propaganda.',
        'Subdomain Hijacking: Spoofed subdomains that leverage parent domain reputation to bypass email spam filters.'
      ]
    },
    {
      icon: Cpu,
      title: 'How LinkLens Detection Works',
      body: 'LinkLens AI uses a hybrid defense engine. First, it extracts dozens of features from the URL string itself and runs them through our Random Forest ML classifier. Second, it executes active OSINT searches—resolving live DNS, calculating certificate creation and expiration age, checking WHOIS records, and inspecting network hop paths to make a combined threat verdict.',
    },
    {
      icon: CheckSquare,
      title: 'Safe Surfing Best Practices',
      body: 'Always check the address bar for subtle misspelling typos (e.g., paypa1.com). Avoid clicking links in unsolicited emails or SMS alerts. Set up Multi-Factor Authentication (MFA) across your critical logins, and run suspicious URLs through LinkLens AI before logging in or entering credentials.',
    }
  ];

  const roadmap = [
    {
      icon: Globe,
      title: 'Chrome Browser Extension',
      desc: 'Real-time alert warnings injected directly into your active browser window when navigating onto suspicious domains.'
    },
    {
      icon: Zap,
      title: 'Real-Time Threat Intelligence Feed',
      desc: 'Consolidate live blocklists from global SOC teams into our classifier weights every 10 minutes.'
    },
    {
      icon: RefreshCw,
      title: 'Autonomous Retraining Pipeline',
      desc: 'Automatically flag classification edge-cases and feed them into model pipelines for daily scikit-learn training.'
    },
    {
      icon: Mail,
      title: 'Email Attachment & Header Scan',
      desc: 'Inspect raw SMTP mail files to check DKIM/SPF credentials and inspect attachments in a secure sandbox.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Secure DNS App',
      desc: 'An Android/iOS application implementing secure VPN/DNS tunnels to block phishing links across all apps.'
    }
  ];

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-4">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Security Education &amp; Roadmap</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
          Threat Intelligence Center
        </h1>
        <p className="text-muted-foreground text-sm max-w-md">
          Learn how phishing campaigns operate, safe browsing habits, and how our machine learning models calculate risk scores.
        </p>
      </div>

      {/* Info Sections */}
      <div className="space-y-6 mb-16">
        {sections.map((sect, idx) => {
          const IconComp = sect.icon;
          return (
            <div key={idx} className="glass p-6 md:p-8 border border-[var(--color-border)]">
              <div className="flex items-center gap-3.5 mb-4 border-b border-[var(--color-border)] pb-4">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <IconComp className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{sect.title}</h2>
              </div>
              
              {sect.body && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sect.body}
                </p>
              )}

              {sect.bullets && (
                <ul className="space-y-2.5">
                  {sect.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Future Scope Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Future Engineering Roadmap</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Planned extensions for LinkLens AI to expand threat response across platforms.
        </p>
      </div>

      {/* Future Scope Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {roadmap.map((item, idx) => {
          const RoadmapIcon = item.icon;
          return (
            <div 
              key={idx} 
              className="glass p-5 border border-[var(--color-border)] hover:border-primary/40 transition-all duration-300 flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <RoadmapIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer link to scan */}
      <div className="text-center mt-12">
        <Link
          to="/scanner"
          className="bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] text-[oklch(0.14_0.03_250)] glow-primary rounded-xl px-6 py-3 font-semibold hover:opacity-90 transition-all flex items-center gap-2 max-w-fit mx-auto active:scale-95 text-xs"
        >
          Try the Scanner Now
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
}
