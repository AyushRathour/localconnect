import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="text-xl font-bold tracking-tight text-[#16324F] flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#16324F] text-white flex items-center justify-center font-black text-lg">
                L
              </span>
              <span>LocalConnect</span>
            </Link>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Empowering communities by connecting local homeowners with skilled, verified independent service professionals.
            </p>
            <div className="pt-2 text-xs text-slate-500 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-[#0F9D8A] shrink-0 mt-0.5" />
              <span>
                <strong>Verification Transparency:</strong> Admin badge confirms document checks & identity verification. Users should always inspect scope & price prior to work.
              </span>
            </div>
          </div>

          {/* Col 2: Popular Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-4">
              Popular Services
            </h4>
            <ul className="space-y-2.5 text-sm text-[#64748B]">
              <li>
                <Link to="/services?category=electrician" className="hover:text-[#16324F] transition-colors">
                  Electrician & Wiring
                </Link>
              </li>
              <li>
                <Link to="/services?category=plumber" className="hover:text-[#16324F] transition-colors">
                  Plumbing & Leak Repairs
                </Link>
              </li>
              <li>
                <Link to="/services?category=home-cleaning" className="hover:text-[#16324F] transition-colors">
                  Home Deep Cleaning
                </Link>
              </li>
              <li>
                <Link to="/services?category=ac-repair" className="hover:text-[#16324F] transition-colors">
                  AC Jet Service & Gas
                </Link>
              </li>
              <li>
                <Link to="/services?category=carpenter" className="hover:text-[#16324F] transition-colors">
                  Carpentry & Lock Fixes
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-[#64748B]">
              <li>
                <Link to="/about" className="hover:text-[#16324F] transition-colors">
                  About LocalConnect
                </Link>
              </li>
              <li>
                <Link to="/provider/register" className="hover:text-[#16324F] transition-colors">
                  Become a Verified Provider
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#16324F] transition-colors">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#16324F] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#16324F] transition-colors">
                  Terms & Service Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-4">
              Contact Desk
            </h4>
            <ul className="space-y-3 text-sm text-[#64748B]">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>support@localconnect.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>+91 80 4920 1800</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Indiranagar Tech Hub, Bengaluru, KA 560038</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} LocalConnect Platform. BTech Mini Project Edition. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
            <Link to="/about" className="hover:text-slate-600 transition-colors">Academic Viva Info</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
