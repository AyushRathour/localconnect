import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#16324F]">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#16324F]">1. Information We Collect</h2>
          <p>
            LocalConnect collects contact information (name, email, phone number, and service address) provided during registration and booking. For service providers, we collect professional trade documentation, licenses, and government identification for identity verification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#16324F]">2. Private Verification Document Storage</h2>
          <p>
            Provider identity and certification documents are stored within a restricted internal repository accessible solely by authorized administrators. Private document identifiers and storage keys are never exposed in public API payloads or search listings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#16324F]">3. Service Communication</h2>
          <p>
            Customer service addresses and phone numbers are only shared with the specific provider whose booking has been accepted and confirmed, solely for the purpose of executing the agreed service visit.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#16324F]">4. Data Retention and Rights</h2>
          <p>
            Users may inspect, update, or remove their saved addresses, booking history, and personal profile at any time through their respective dashboards.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#16324F]">Terms & Conditions</h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#16324F]">1. Independent Contractor Relationship</h2>
          <p>
            Service providers registered on LocalConnect operate as independent contractors. LocalConnect provides discovery, verification workflows, and appointment scheduling tools, but does not employ service providers directly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#16324F]">2. Booking & Cancellation Policies</h2>
          <p>
            Customers may cancel pending, accepted, or confirmed bookings without penalty prior to technician arrival. In-progress services cannot be cancelled online without direct provider consultation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#16324F]">3. Pricing Transparency</h2>
          <p>
            Base service fees are locked at the time of booking request creation. Any unforeseen additional parts, materials, or structural modifications must be explicitly quoted and agreed upon prior to installation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#16324F]">4. Verified Reviews</h2>
          <p>
            Only customers who have completed an authenticated service booking through LocalConnect are eligible to submit ratings and written reviews. Fraudulent or defamatory reviews are subject to administrator moderation.
          </p>
        </section>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs space-y-4">
      <span className="text-5xl font-extrabold text-[#16324F] tabular-nums">404</span>
      <h1 className="text-xl font-bold text-[#172B4D]">Page Not Found</h1>
      <p className="text-xs text-slate-500">
        The page or resource you requested could not be found on LocalConnect.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-block py-2.5 px-5 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-xs rounded-lg transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};
