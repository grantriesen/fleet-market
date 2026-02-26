'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

const TEMPLATES: Record<string, { name: string; description: string }> = {
  'corporate-edge': { name: 'Corporate Edge', description: 'Clean, professional design built for established dealers' },
  'green-valley-industrial': { name: 'Green Valley Industrial', description: 'Rugged industrial aesthetic for heavy equipment operations' },
  'modern-lawn-solutions': { name: 'Modern Lawn Solutions', description: 'Fresh, modern look with a tech-forward approach' },
  'vibe-dynamics': { name: 'Vibe Dynamics', description: 'Bold, energetic design with vibrant accents' },
  'zenith-lawn': { name: 'Zenith Lawn', description: 'Premium, minimalist design for high-end dealers' },
  'warm-earth-designs': { name: 'Warm Earth Designs', description: 'Warm, inviting design for family-owned businesses' },
};

export default function TemplatePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.templateId as string;
  const template = TEMPLATES[slug];

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Template not found</h1>
          <button onClick={() => router.push('/templates')} className="text-[#E8472F] font-semibold hover:underline">
            ← Back to templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Preview Banner */}
      <div className="bg-[#2C3E7D] border-b-2 border-[#E8472F] px-4 py-3 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/templates')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            All Templates
          </button>
          <div className="w-px h-6 bg-slate-600" />
          <div>
            <span className="text-white font-bold">{template.name}</span>
            <span className="text-gray-400 text-sm ml-3 hidden sm:inline">{template.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/api/preview/demo-${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Open Full Page</span>
          </a>
          <button
            onClick={() => router.push('/register')}
            className="px-5 py-2 bg-[#E8472F] text-white font-bold text-sm rounded hover:bg-[#D13A24] transition-all flex items-center gap-2"
          >
            Use This Template
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Iframe */}
      <iframe
        src={`/api/preview/demo-${slug}?page=home`}
        className="flex-1 w-full border-0"
        title={`${template.name} preview`}
      />
    </div>
  );
}
