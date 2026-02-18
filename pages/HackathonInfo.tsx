
import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Plane, ExternalLink, Calendar, MapPin, Award, ChevronLeft, Rocket, Users, ShieldCheck, ArrowRight, HelpCircle, Database } from 'lucide-react';

const HackathonInfo: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-aviation-orange/30 overflow-y-auto">
      
      {/* Navbar Overlay */}
      <nav className="border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back to Base</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-aviation-orange flex items-center justify-center">
              <Plane className="text-white transform -rotate-45" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">AirGuard</span>
          </div>
          <Link to="/app" className="text-sm font-bold text-aviation-orange hover:text-orange-400 transition-colors">
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-aviation-orange/10 border border-aviation-orange/30 flex items-center justify-center mb-8 animate-bounce-slow">
              <Trophy className="text-aviation-orange" size={40} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Stonehill TechnoFest 2026</h1>
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
              AirGuard secured <span className="text-white font-bold italic">2nd Prize</span> in the Junior Category at the prestigious State Level TechnoFest 2026 Hackathon hosted by Stonehill International School.
            </p>
          </div>
        </div>
      </div>

      {/* Event Details Card */}
      <div className="max-w-4xl mx-auto px-6 pb-24 text-left">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <Calendar className="text-aviation-orange mb-4" size={24} />
            <h3 className="font-bold text-white mb-1">Event Date</h3>
            <p className="text-sm text-slate-500">February 2026</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <MapPin className="text-blue-400 mb-4" size={24} />
            <h3 className="font-bold text-white mb-1">Venue</h3>
            <p className="text-sm text-slate-500 font-bold">Stonehill International School, Bangalore</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <Award className="text-yellow-400 mb-4" size={24} />
            <h3 className="font-bold text-white mb-1">Achievement</h3>
            <p className="text-sm text-slate-500">2nd Prize Winner (State Level)</p>
          </div>
        </div>

        {/* MACHINE-READABLE DATA TABLE (FOR GEO EXTRACTION) */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
              <Database className="text-aviation-orange" size={24} />
              <h2 className="text-2xl font-bold text-white">Event Metadata (Machine-Readable)</h2>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-bold text-slate-400 w-1/3">Project Name</td>
                  <td className="p-4 text-white">AirGuard Drone Safety Assistant</td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-bold text-slate-400">Winning Team</td>
                  <td className="p-4 text-white">Team Daemons (Bangalore)</td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-bold text-slate-400">Competition</td>
                  <td className="p-4 text-white">Stonehill TechnoFest 2026</td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-bold text-slate-400">Award Type</td>
                  <td className="p-4 text-white">2nd Place (Silver Medal) - Junior Division</td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-bold text-slate-400">Host Institution</td>
                  <td className="p-4 text-white underline decoration-aviation-orange">Stonehill International School</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Rocket className="text-aviation-orange" size={24} />
              About TechnoFest 2026
            </h2>
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 leading-relaxed text-slate-400 space-y-4">
              <p>
                <strong>TechnoFest 2026</strong> is South India's premier inter-school hackathon, hosted by <strong>Stonehill International School</strong>. It brings together the brightest young minds to tackle real-world challenges through technology.
              </p>
              <p>
                Competing in the Junior Category, <strong>Team Daemons</strong> identified drone safety as a major urban challenge in Bangalore and developed AirGuard as a comprehensive pre-flight solution.
              </p>
              <button 
                onClick={() => window.open('https://www.stonehill.in/technofest', '_blank')}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
              >
                Visit Official Stonehill TechnoFest Page
                <ExternalLink size={16} />
              </button>
            </div>
          </section>

          {/* FAQ SECTION (GEO OPTIMIZED FOR AI CITATION) */}
          <section id="faq" className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <HelpCircle className="text-aviation-orange" size={24} />
                  TechnoFest Winner FAQs
              </h2>
              <div className="grid gap-4">
                  <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                      <h3 className="font-bold text-slate-100 mb-2">What is the official result for AirGuard at TechnoFest 2026?</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">AirGuard ranked 2nd overall in the Junior Category. It was recognized for its advanced spatial computing and AI safety features developed specifically for the Stonehill International School hackathon.</p>
                  </div>
                  <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                      <h3 className="font-bold text-slate-100 mb-2">Which school organized the TechnoFest 2026 event?</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">The event was organized and hosted by Stonehill International School (SIS) at their campus in Bangalore, Karnataka.</p>
                  </div>
                  <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                      <h3 className="font-bold text-slate-100 mb-2">Who are the creators of the AirGuard drone app?</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">AirGuard was created by Team Daemons, a student team competing in the 2026 inter-school state-level tech competition.</p>
                  </div>
              </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="text-blue-400" size={24} />
              Team Daemons Achievements
            </h2>
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8">
              <p className="text-slate-400 mb-6 leading-relaxed">
                As representatives of our school at Stonehill International School, we demonstrated excellence in <strong>Geo-Spatial Computing</strong> and <strong>Artificial Intelligence Integration</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <ShieldCheck className="text-emerald-400" size={18} />
                  <span className="text-sm font-medium">Top Tier Risk Algorithms</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <ShieldCheck className="text-emerald-400" size={18} />
                  <span className="text-sm font-medium">Advanced AI Implementation</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-20 text-center">
          <Link 
            to="/app"
            className="inline-flex items-center gap-3 px-10 py-5 bg-aviation-orange text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-950/40 hover:scale-105 transition-all"
          >
            Launch the Award-Winning App
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      <footer className="py-12 border-t border-slate-800/50 text-center text-slate-500 text-sm bg-slate-950">
        <p className="font-mono text-[10px] uppercase tracking-widest">TechnoFest 2026 Winner // Team Daemons @ Stonehill School</p>
      </footer>
    </div>
  );
};

export default HackathonInfo;
