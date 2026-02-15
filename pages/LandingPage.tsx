
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Zap, Map as MapIcon, Cpu, ArrowRight, ShieldCheck, BarChart3, Globe2, Download, MessageSquare, Move } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-aviation-orange/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-aviation-orange to-orange-600 flex items-center justify-center transition-transform group-hover:rotate-12">
              <Plane className="text-white transform -rotate-45" size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">AirGuard</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block">Features</a>
            <Link to="/docs" className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block">Tactics</Link>
            <Link 
              to="/app"
              className="flex items-center gap-2 text-sm font-bold text-aviation-orange hover:text-orange-400 transition-colors"
            >
              Mission Control
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative overflow-hidden pt-24 pb-32">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-aviation-orange mb-8 shadow-lg shadow-orange-500/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aviation-orange"></span>
            </span>
            SYSTEM ONLINE v2.6 // AI CORE ACTIVE
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 leading-tight">
            Tactical Airspace <br/> Command & Intelligence
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The ultimate pre-flight safety layer. Visualize restrictions, manage waypoints with precision, and coordinate with AI Command for real-time risk assessment.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/app')}
              className="w-full md:w-auto px-8 py-4 bg-aviation-orange hover:bg-orange-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-xl shadow-orange-900/30 ring-1 ring-white/20"
            >
              <Plane className="transform -rotate-45" />
              Launch Mission Control
            </button>
            <button 
              onClick={() => navigate('/docs')}
              className="w-full md:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg font-bold transition-all hover:text-white"
            >
              Read Tactical Docs
            </button>
          </div>
        </div>
      </main>

      {/* Stats */}
      <div className="border-y border-slate-800/50 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-1000 delay-300">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <div className="text-3xl font-bold text-white mb-1">REAL-TIME</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">Risk Analysis</div>
            </div>
            <div>
                <div className="text-3xl font-bold text-white mb-1">GPX/KML</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">Standard Export</div>
            </div>
            <div>
                <div className="text-3xl font-bold text-white mb-1">GEMINI 3</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">Tactical Core</div>
            </div>
            <div>
                <div className="text-3xl font-bold text-white mb-1">AUTO</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">Safety Alerts</div>
            </div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-3xl font-bold mb-4">Command Superiority</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Equipped with enterprise-grade mission planning tools and an intelligent tactical assistant.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageSquare className="text-aviation-orange" />}
              title="AI Tactical Link"
              desc="Instant mission briefings and risk critiques. Captain Arjun monitors vectors and provides regulatory guidance."
              delay="delay-0"
            />
            <FeatureCard 
              icon={<Move className="text-blue-400" />}
              title="Dynamic Waypoints"
              desc="Drag-and-drop path manipulation. Reshape your mission on the fly with real-time risk recalculation."
              delay="delay-75"
            />
            <FeatureCard 
              icon={<Download className="text-emerald-400" />}
              title="Mission Export"
              desc="One-click export to industry-standard GPX and KML formats for direct import into professional flight systems."
              delay="delay-150"
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-red-400" />}
              title="Radar Snapshots"
              desc="Automatic tactical radar captures for every mission. Stored in your mission history with visual route previews."
              delay="delay-200"
            />
            <FeatureCard 
              icon={<Globe2 className="text-cyan-400" />}
              title="Weather Intelligence"
              desc="Integrated METAR data providing real-time wind, visibility, and precipitation alerts."
              delay="delay-300"
            />
            <FeatureCard 
              icon={<BarChart3 className="text-purple-400" />}
              title="Black Box Logic"
              desc="Detailed post-mission analytics. Review risk trends and compliance scores for your entire fleet operations."
              delay="delay-500"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center animate-in zoom-in duration-1000">
            <h2 className="text-4xl font-bold mb-6 text-white">Commander, the sky is waiting.</h2>
            <p className="text-lg text-slate-400 mb-8">
                The most advanced pre-flight safety layer ever built for civilian drone pilots.
            </p>
            <button 
              onClick={() => navigate('/app')}
              className="px-10 py-5 bg-white text-slate-950 hover:bg-slate-200 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-2xl"
            >
              Establish Command
            </button>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-800/50 text-center text-slate-500 text-sm bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <Plane className="text-slate-600 transform -rotate-45" size={16} />
                <span className="font-bold text-slate-400 tracking-widest uppercase">AirGuard</span>
            </div>
            <p className="font-mono text-[10px]">&copy; {new Date().getFullYear()} AIRGUARD DEFENSE SYSTEMS // SECURE TRANSMISSION</p>
        </div>
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: string }) => (
  <div className={`p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-aviation-orange/50 hover:bg-slate-800/50 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-8 ${delay}`}>
    <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-200">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
