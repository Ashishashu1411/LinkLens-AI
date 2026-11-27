import { Download, ExternalLink, FolderOpen, Puzzle, ShieldCheck } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useMeta } from '../hooks/useMeta';

const browsers = [
  {
    name: 'Google Chrome',
    page: 'chrome://extensions',
    steps: [
      'Open chrome://extensions in the address bar.',
      'Turn on Developer mode in the top-right corner.',
      'Click Load unpacked and select the extracted LinkLens AI extension folder (the folder containing manifest.json).'
    ]
  },
  {
    name: 'Microsoft Edge',
    page: 'edge://extensions',
    steps: [
      'Open edge://extensions in the address bar.',
      'Turn on Developer mode in the left-side menu.',
      'Click Load unpacked and select the extracted LinkLens AI extension folder.'
    ]
  },
  {
    name: 'Brave',
    page: 'brave://extensions',
    steps: [
      'Open brave://extensions in the address bar.',
      'Turn on Developer mode in the top-right corner.',
      'Click Load unpacked and select the extracted LinkLens AI extension folder.'
    ]
  },
  {
    name: 'Opera',
    page: 'opera://extensions',
    steps: [
      'Open opera://extensions in the address bar.',
      'Turn on Developer mode in the top-right corner.',
      'Click Load unpacked and select the extracted LinkLens AI extension folder.'
    ]
  }
];

export function head() {
  return {
    title: 'Browser Extension Install — LinkLens AI',
    description: 'Download LinkLens AI and follow installation steps for Chrome, Edge, Brave, and Opera.'
  };
}

export default function ExtensionInstall() {
  useMeta(head());

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-4">
          <Puzzle className="w-3.5 h-3.5 text-primary" />
          <span>LinkLens AI for Chromium browsers</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
          Install the Browser Extension
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          Download the extension package, unzip it, then load the folder in your browser. The same package works with Chrome, Edge, Brave, and Opera.
        </p>
      </header>

      <section className="glass p-6 md:p-8 border border-[var(--color-border)] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground mb-1">Step 1: Download the extension</h2>
            <p className="text-sm text-muted-foreground">
              Save the ZIP file, then extract it to a folder you will keep on your computer.
            </p>
          </div>
          <a
            href="/linklens-ai-extension.zip"
            download="LinkLens-AI-Extension.zip"
            className="bg-[linear-gradient(135deg,_oklch(0.78_0.16_200),_oklch(0.6_0.2_280))] text-[oklch(0.14_0.03_250)] glow-primary rounded-xl px-6 py-3 font-semibold hover:opacity-90 transition-all inline-flex items-center justify-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            Download Extension
          </a>
        </div>
      </section>

      <section className="glass p-6 md:p-8 border border-[var(--color-border)] mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Step 2: Install in your browser
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          First unzip the download. In each browser below, enable Developer mode, choose <strong className="text-foreground">Load unpacked</strong>, and select the extracted folder containing <code className="font-mono text-primary">manifest.json</code>.
        </p>

        <div className="space-y-3">
          {browsers.map((browser) => (
            <details key={browser.name} className="rounded-xl border border-[var(--color-border)] bg-secondary/10 p-4">
              <summary className="cursor-pointer font-semibold text-foreground flex items-center justify-between gap-3">
                {browser.name}
                <span className="font-mono text-xs text-primary">{browser.page}</span>
              </summary>
              <ol className="mt-4 ml-5 list-decimal space-y-2 text-sm text-muted-foreground">
                {browser.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </details>
          ))}
        </div>
      </section>

      <section className="glass p-6 md:p-8 border border-[var(--color-border)] mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Step 3: Finish setup
        </h2>
        <ol className="ml-5 list-decimal space-y-3 text-sm text-muted-foreground">
          <li>Pin LinkLens AI from your browser&apos;s Extensions menu for quick access.</li>
          <li>Open the extension, choose Settings, and confirm the API endpoint is <code className="font-mono text-primary">https://linklens-ai-ssu5.onrender.com/api/analyze</code>.</li>
          <li>Visit a page and open the extension to scan it. The extension also checks pages automatically.</li>
          <li>To update later, download and extract the latest ZIP, then use Reload on the extension card in the browser&apos;s extensions page.</li>
        </ol>
        <p className="mt-5 text-xs text-muted-foreground">
          Firefox and Safari are not supported by this Manifest V3 package.
        </p>
      </section>

      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/about" className="px-5 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Back to About
        </Link>
        <a
          href="/linklens-ai-extension.zip"
          download="LinkLens-AI-Extension.zip"
          className="px-5 py-3 rounded-xl border border-primary/40 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors inline-flex items-center gap-2"
        >
          Download ZIP
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
