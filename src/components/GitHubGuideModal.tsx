import React, { useState } from 'react';
import { X, Github, Check, Copy, Terminal, Globe, Rocket } from 'lucide-react';

interface GitHubGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubGuideModal: React.FC<GitHubGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitCommands = `# 1. Initialize git (if needed) & commit
git init
git add .
git commit -m "Deploy Jackpot Coupon Grabber"

# 2. Add your GitHub repository remote
git remote add origin https://github.com/YOUR_USERNAME/jackpot-coupon-grabber.git
git branch -M main
git push -u origin main`;

  const actionsWorkflow = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        id="github-guide-dialog"
        className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Launch on GitHub Pages</h3>
              <p className="text-xs text-slate-500">100% client-side HTML/JS static web app</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Zero Backend Requirement</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                This project compiles into pure static HTML, CSS, and JavaScript inside <code>/dist</code>. It can be hosted on GitHub Pages, Vercel, Netlify, or Cloudflare Pages for free.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                Step 1: Push Code to your GitHub Repo
              </span>
              <button
                type="button"
                onClick={() => copyText(gitCommands, 'git')}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'git' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedSection === 'git' ? 'Copied' : 'Copy Commands'}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg overflow-x-auto select-all">
              {gitCommands}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-slate-500" />
                Step 2: Automated GitHub Pages Action (.github/workflows/deploy.yml)
              </span>
              <button
                type="button"
                onClick={() => copyText(actionsWorkflow, 'action')}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'action' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedSection === 'action' ? 'Copied' : 'Copy Workflow'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-1">
              Create a file at <code>.github/workflows/deploy.yml</code> and paste this workflow. In your GitHub repository, go to <strong>Settings → Pages → Source</strong> and select <strong>GitHub Actions</strong>.
            </p>
            <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-lg max-h-44 overflow-y-auto select-all">
              {actionsWorkflow}
            </pre>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-mono">Build folder: dist/</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
