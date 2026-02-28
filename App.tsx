import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ExternalLink, Github, Instagram, Monitor } from 'lucide-react';
import MissionControl from './components/MissionControl';
import UnifiedLanding from './pages/UnifiedLanding';
import HackathonInfo from './pages/HackathonInfo';

const APP_URL = 'https://airguard-mission-control.app';
const ENGAGEMENT_KEY = 'airguard-engagement-task-complete';

type RouteSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: 'website' | 'article';
};

const routeSeoMap: Record<string, RouteSeo> = {
  '/': {
    title: 'AirGuard Drone Safety Assistant | AI Pre-Flight Risk Intelligence',
    description:
      'AirGuard helps drone pilots with AI-assisted pre-flight risk checks, route safety planning, and regulatory awareness before takeoff.',
    canonicalPath: '/',
  },
  '/app': {
    title: 'AirGuard Mission Control | Desktop Drone Safety Operations',
    description:
      'Use AirGuard Mission Control on desktop for advanced map-based mission planning, AI critique, weather intelligence, and safety simulation.',
    canonicalPath: '/app',
  },
  '/mission-control': {
    title: 'AirGuard Mission Control | Desktop Drone Safety Operations',
    description:
      'Use AirGuard Mission Control on desktop for advanced map-based mission planning, AI critique, weather intelligence, and safety simulation.',
    canonicalPath: '/mission-control',
  },
  '/hackathon': {
    title: 'AirGuard TechnoFest 2026 Project Highlights | Team Daemons',
    description:
      'Explore the story, technical architecture, and showcase highlights behind AirGuard at Stonehill International School TechnoFest 2026.',
    canonicalPath: '/hackathon',
    ogType: 'article',
  },
};

const upsertMetaTag = (selector: string, attrs: Record<string, string>) => {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    Object.entries(attrs).forEach(([key, value]) => {
      if (key !== 'content') tag?.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', attrs.content);
};

const updateCanonical = (canonicalUrl: string) => {
  let link = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = canonicalUrl;
};

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const config = routeSeoMap[location.pathname] ?? routeSeoMap['/'];
    const canonicalUrl = `${APP_URL}${config.canonicalPath}`;

    document.title = config.title;
    updateCanonical(canonicalUrl);

    upsertMetaTag("meta[name='description']", { name: 'description', content: config.description });
    upsertMetaTag("meta[property='og:title']", { property: 'og:title', content: config.title });
    upsertMetaTag("meta[property='og:description']", { property: 'og:description', content: config.description });
    upsertMetaTag("meta[property='og:url']", { property: 'og:url', content: canonicalUrl });
    upsertMetaTag("meta[property='og:type']", { property: 'og:type', content: config.ogType ?? 'website' });
    upsertMetaTag("meta[property='twitter:title']", { property: 'twitter:title', content: config.title });
    upsertMetaTag("meta[property='twitter:description']", { property: 'twitter:description', content: config.description });

    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${APP_URL}/` },
        location.pathname !== '/' && {
          '@type': 'ListItem',
          position: 2,
          name: config.title,
          item: canonicalUrl,
        },
      ].filter(Boolean),
    };

    let script = document.getElementById('dynamic-breadcrumb-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'dynamic-breadcrumb-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(breadcrumbLd);
  }, [location.pathname]);

  return null;
};

const MissionTaskGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [done, setDone] = useState(false);

  return (
    <div className="fixed inset-0 z-[9000] bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <p className="text-xs tracking-[0.25em] text-aviation-orange font-bold uppercase mb-3">Access Task</p>
        <h1 className="text-2xl font-bold text-white mb-3">Unlock Mission Control</h1>
        <p className="text-slate-300 mb-6">
          Complete one quick support action to continue: follow us on Instagram or star our GitHub repository.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:border-aviation-orange"
          >
            <Instagram size={16} /> Follow on Instagram <ExternalLink size={14} />
          </a>
          <a
            href="https://github.com/SaifanX/Daemons-AirGuard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:border-aviation-orange"
          >
            <Github size={16} /> Star on GitHub <ExternalLink size={14} />
          </a>
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-300 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => setDone(e.target.checked)}
            className="mt-1"
          />
          I have completed one of the support tasks above.
        </label>

        <button
          disabled={!done}
          onClick={onUnlock}
          className="w-full rounded-xl bg-aviation-orange py-3 font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Mission Control
        </button>
      </div>
    </div>
  );
};

const DesktopOnlyOverlay: React.FC = () => (
  <div className="fixed inset-0 z-[8500] bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-6">
    <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center shadow-2xl">
      <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
        <Monitor className="text-aviation-orange" />
      </div>
      <p className="text-xs tracking-[0.25em] text-aviation-orange font-bold uppercase mb-2">Desktop Required</p>
      <h2 className="text-2xl text-white font-bold mb-3">Mission Control is desktop only</h2>
      <p className="text-slate-300">
        Please switch to a laptop or desktop browser for the full map and simulation interface. Mobile access is intentionally blocked for usability and safety.
      </p>
    </div>
  </div>
);

const MissionControlRoute: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem(ENGAGEMENT_KEY) === 'true');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const uaMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const widthMobile = window.innerWidth < 1024;
      setIsMobile(uaMobile || widthMobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const unlock = () => {
    localStorage.setItem(ENGAGEMENT_KEY, 'true');
    setIsUnlocked(true);
  };

  const overlays = useMemo(() => {
    if (isMobile) return <DesktopOnlyOverlay />;
    if (!isUnlocked) return <MissionTaskGate onUnlock={unlock} />;
    return null;
  }, [isMobile, isUnlocked]);

  return (
    <>
      <MissionControl />
      {overlays}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <TitleManager />
      <div className="bg-slate-950 min-h-screen">
        <Routes>
          <Route path="/" element={<UnifiedLanding />} />
          <Route path="/app" element={<MissionControlRoute />} />
          <Route path="/hackathon" element={<HackathonInfo />} />
          <Route path="/mission-control" element={<MissionControlRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
