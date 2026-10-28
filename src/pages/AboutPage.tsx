import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  CalendarCheck,
  Layers,
  GraduationCap,
  Code2,
  Database,
  Server,
  ArrowRight,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0F9D8A] bg-teal-50 px-3 py-1 rounded">
          Platform Architecture & Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight">
          About LocalConnect
        </h1>
        <p className="text-base text-[#64748B] leading-relaxed">
          A trustworthy, full-stack service marketplace connecting homeowners with verified local independent tradespeople.
        </p>
      </div>

      {/* Problem Statement & Solution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[#16324F]">The Problem & Our Solution</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Traditional local classifieds and social media directories suffer from high rates of unverified listings, phantom pricing, unvetted individuals entering households, and untraceable customer disputes.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>LocalConnect</strong> bridges this gap by introducing an administrative verification pipeline. Providers must submit government photo identification and trade credentials, which are reviewed by administrators before the provider can accept customer appointments.
        </p>
      </div>

      {/* Verification Transparency Disclosure */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-4">
        <div className="flex items-center gap-2 text-[#0F9D8A]">
          <ShieldCheck className="w-6 h-6" />
          <h3 className="text-lg font-bold text-[#16324F]">Verification Transparency & Safety Rules</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Our verified badge confirms that the provider’s legal name, contact number, and submitted identity documents have been examined and approved by platform administrators.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-slate-600">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">What Verification Guarantees:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              <li>Documentary proof of identity on file.</li>
              <li>Active administrative review & accountability.</li>
              <li>Protection against duplicate time-slot bookings.</li>
              <li>Legitimate reviews only from verified completed jobs.</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">What It Does Not Guarantee:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              <li>Subjective perfection in aesthetic taste.</li>
              <li>Zero-risk transactions in physical repair environments.</li>
              <li>Free replacement of pre-existing equipment wear.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Architecture for Academic Evaluation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-[#16324F]">
          <GraduationCap className="w-6 h-6 text-[#0F9D8A]" />
          <h2 className="text-xl font-bold">Academic Mini Project Architecture</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Designed and built as a comprehensive BTech Computer Science mini project and full-stack placement showcase. Follows modern separation of concerns, clean RESTful conventions, and stateless security standards:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#16324F]">
              <Code2 className="w-4 h-4 text-[#0F9D8A]" />
              <span>Frontend Architecture</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              React 19, TypeScript, Tailwind CSS, React Router, Context API for authentication state, and zero-pill typographic discipline.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#16324F]">
              <Server className="w-4 h-4 text-[#0F9D8A]" />
              <span>Backend Services</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Node.js and Express with JWT authentication, HTTP-only session cookies, bcrypt password hashing, and role-based access control.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#16324F]">
              <Database className="w-4 h-4 text-[#0F9D8A]" />
              <span>Persistence & State</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mongoose-compatible Document Store with schema constraints, double-booking validation, audit trails, and atomic file persistence.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-sm rounded-xl transition-colors shadow-md"
        >
          <span>Explore Verified Services</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
