import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Shield, Menu, X, Terminal, Search, Activity } from 'lucide-react';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const state = useRouterState();

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Scanner', to: '/scanner' },
    { label: 'History', to: '/history' },
    { label: 'Analytics', to: '/analytics' },
    { label: 'About', to: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative select-none">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 h-16 w-full glass border-b border-[var(--color-border)] bg-[var(--color-background)]/60 backdrop-blur-xl flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] flex items-center justify-between p-2 glow-primary animate-pulse-slow">
            <Shield className="w-5 h-5 text-[oklch(0.14_0.03_250)] stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--color-foreground)]">
            Link<span className="text-gradient font-extrabold">Lens</span> <span className="font-mono text-xs px-2 py-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-secondary)]">AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: 'bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] shadow-inner' }}
              inactiveProps={{ className: 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]/60 border border-transparent' }}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/scanner"
            className="bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] text-[oklch(0.14_0.03_250)] glow-primary rounded-xl px-5 py-2 text-sm font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2 active:scale-95"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            Scan URL
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-[var(--color-background)]/95 backdrop-blur-xl border-b border-[var(--color-border)] flex flex-col p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-4 mb-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                activeProps={{ className: 'bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)]' }}
                inactiveProps={{ className: 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-transparent' }}
                className="px-4 py-3 rounded-xl text-lg font-medium transition-all flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] text-[oklch(0.14_0.03_250)] glow-primary rounded-xl py-3.5 text-center font-bold transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            Scan URL
          </Link>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1 w-full relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--color-border)] bg-[var(--color-background)]/80 py-8 px-6 text-center text-xs text-[var(--color-muted-foreground)] relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © 2026 LinkLens AI. All rights reserved. Built for enterprise Security Operations Center (SOC).
        </div>
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-[var(--color-foreground)] transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-[var(--color-foreground)] transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-[var(--color-foreground)] transition-colors">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
}
