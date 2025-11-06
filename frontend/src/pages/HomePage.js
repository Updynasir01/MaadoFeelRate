import React from 'react';
import { Link } from 'react-router-dom';

const MENU_URL = 'https://qr.scanned.page/uploads/pdf/en20pS_db71e71e8d187722.pdf';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Decorative background visuals */}
      <div className="absolute inset-0 bg-luxury-pattern opacity-30 pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full gradient-gold blur-3xl opacity-10 pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full gradient-blue blur-3xl opacity-10 pointer-events-none"></div>
      <header className="w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">M</div>
            <span className="text-primary text-xl font-semibold font-display">Maado</span>
          </div>
          <div />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-10 fade-in">
            <div className="w-20 h-1 gradient-gold mx-auto mb-4 rounded-full"></div>
            <h1 className="text-primary text-3xl sm:text-4xl font-semibold font-display text-center">Welcome to Maado Restaurant</h1>
            <div className="w-20 h-1 gradient-gold mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a
              href={MENU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group border-2 border-accent bg-white rounded-2xl p-8 text-center card-luxury hover:shadow-luxury-lg transition-premium hover:-translate-y-1"
            >
              <div className="text-primary text-2xl font-semibold mb-3 font-display">See Our Menu</div>
              <div className="text-4xl mb-4">🍽️</div>
              <div className="inline-flex items-center justify-center gap-2 text-primary font-medium">
                <span>Open menu</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </a>

            <Link
              to="/feedback"
              className="group rounded-2xl p-8 text-center bg-accent text-white shadow-gold hover:shadow-gold-hover transition-premium hover:-translate-y-1"
            >
              <div className="text-white text-2xl font-semibold mb-3 font-display">Rate Your Feelings</div>
              <div className="text-4xl mb-4">💬</div>
              <div className="inline-flex items-center justify-center gap-2 font-medium">
                <span>Start rating</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;


