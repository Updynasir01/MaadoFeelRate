import React, { useState, useEffect, useRef } from 'react';
import { submitFeedback } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { translations, languageNames } from '../translations';

const FeedbackPage = () => {
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];
  const [ratings, setRatings] = useState({
    food: '',
    service: '',
    atmosphere: ''
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);

  const emojis = ['😊', '😐', '😞'];
  const labels = [t.excellent, t.good, t.needsImprovement];

  const handleEmojiClick = (category, emoji) => {
    setRatings(prev => ({
      ...prev,
      [category]: emoji
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ratings.food || !ratings.service || !ratings.atmosphere) {
      alert(t.rateAll);
      return;
    }

    setLoading(true);

    try {
      await submitFeedback({
        restaurantId: 'default',
        ratings,
        comment: comment.trim()
      });

      setSubmitted(true);
      setRatings({ food: '', service: '', atmosphere: '' });
      setComment('');
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      alert(t.submitError);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const EmojiButton = ({ emoji, label, isSelected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 transition-premium ${
        isSelected 
          ? 'scale-110' 
          : 'scale-100 opacity-60 hover:opacity-100 hover:scale-105'
      }`}
    >
      <div className={`
        w-20 h-20 rounded-2xl flex items-center justify-center text-5xl
        transition-premium shadow-lg
        ${isSelected 
          ? 'gradient-gold shadow-gold glow-gold ring-4 ring-accent ring-opacity-30' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-accent hover:shadow-md'
        }
      `}>
        {emoji}
      </div>
      <span className={`text-xs font-medium transition-smooth ${
        isSelected ? 'text-accent font-semibold' : 'text-gray-500'
      }`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 bg-luxury-pattern opacity-30"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary opacity-5 rounded-full blur-3xl"></div>

      {/* Language Selector - On the left side */}
      <div className="relative z-20 fixed top-4 left-4" style={{ right: 'auto' }} ref={languageMenuRef}>
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-smooth border border-gray-200 hover:border-accent"
          >
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-primary font-semibold text-sm">{languageNames[language]}</span>
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showLanguageMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden w-40">
              {Object.keys(languageNames).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    changeLanguage(lang);
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-smooth flex items-center justify-between text-sm ${
                    language === lang ? 'bg-accent/10 text-accent font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span>{languageNames[lang]}</span>
                  {language === lang && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Luxury Header */}
          <div className="text-center mb-16 fade-in">
            <div className="inline-block mb-6">
              <div className="w-24 h-1 gradient-gold mx-auto mb-4 rounded-full"></div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-primary mb-4 tracking-tight">
                {t.title}
              </h1>
              <div className="w-24 h-1 gradient-gold mx-auto mt-4 rounded-full"></div>
            </div>
            <p className={`text-xl sm:text-2xl text-gray-600 font-light tracking-wide ${language === 'ar' ? 'font-display' : ''}`}>
              {t.subtitle}
            </p>
            <p className={`text-sm text-gray-500 mt-3 font-light ${language === 'ar' ? 'font-display' : ''}`}>
              {t.description}
            </p>
          </div>

          {/* Premium Feedback Card */}
          {!submitted ? (
            <div className="card-luxury rounded-3xl p-8 sm:p-12 slide-up transition-smooth">
              <form onSubmit={handleSubmit} className="space-y-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {/* Food Rating */}
                <div className="space-y-6">
                  <label className={`block text-2xl font-display font-semibold text-primary tracking-wide ${language === 'ar' ? 'text-right' : ''}`}>
                    {t.foodQuality}
                  </label>
                  <div className="flex justify-center gap-8 sm:gap-12">
                    {emojis.map((emoji, idx) => (
                      <EmojiButton
                        key={emoji}
                        emoji={emoji}
                        label={labels[idx]}
                        isSelected={ratings.food === emoji}
                        onClick={() => handleEmojiClick('food', emoji)}
                      />
                    ))}
                  </div>
                </div>

                {/* Service Rating */}
                <div className="space-y-6 pt-8 border-t border-gray-100">
                  <label className={`block text-2xl font-display font-semibold text-primary tracking-wide ${language === 'ar' ? 'text-right' : ''}`}>
                    {t.service}
                  </label>
                  <div className="flex justify-center gap-8 sm:gap-12">
                    {emojis.map((emoji, idx) => (
                      <EmojiButton
                        key={emoji}
                        emoji={emoji}
                        label={labels[idx]}
                        isSelected={ratings.service === emoji}
                        onClick={() => handleEmojiClick('service', emoji)}
                      />
                    ))}
                  </div>
                </div>

                {/* Atmosphere Rating */}
                <div className="space-y-6 pt-8 border-t border-gray-100">
                  <label className={`block text-2xl font-display font-semibold text-primary tracking-wide ${language === 'ar' ? 'text-right' : ''}`}>
                    {t.atmosphere}
                  </label>
                  <div className="flex justify-center gap-8 sm:gap-12">
                    {emojis.map((emoji, idx) => (
                      <EmojiButton
                        key={emoji}
                        emoji={emoji}
                        label={labels[idx]}
                        isSelected={ratings.atmosphere === emoji}
                        onClick={() => handleEmojiClick('atmosphere', emoji)}
                      />
                    ))}
                  </div>
                </div>

                {/* Premium Comment Box */}
                <div className="space-y-4 pt-8 border-t border-gray-100">
                  <label className={`block text-2xl font-display font-semibold text-primary tracking-wide ${language === 'ar' ? 'text-right' : ''}`}>
                    {t.additionalComments}
                    <span className="text-sm font-normal text-gray-400 ml-2">{t.optional}</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    className={`w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-accent focus:ring-4 focus:ring-accent focus:ring-opacity-10 focus:outline-none transition-smooth resize-none text-gray-700 font-light text-lg shadow-sm hover:shadow-md ${language === 'ar' ? 'text-right' : ''}`}
                    placeholder={t.placeholder}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>

                {/* Luxury Submit Button */}
                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-luxury text-white py-5 px-8 rounded-2xl text-xl font-semibold tracking-wide transition-premium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t.submitting}
                        </>
                      ) : (
                        <>
                          {t.submitFeedback}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card-luxury rounded-3xl p-16 text-center slide-up" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="w-24 h-24 gradient-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold glow-gold">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className={`text-4xl font-display font-bold text-primary mb-4 ${language === 'ar' ? 'font-display' : ''}`}>
                {t.thankYou}
              </h2>
              <p className={`text-xl text-gray-600 font-light mb-2 ${language === 'ar' ? 'font-display' : ''}`}>
                {t.successMessage}
              </p>
              <p className={`text-sm text-gray-500 font-light ${language === 'ar' ? 'font-display' : ''}`}>
                {t.appreciation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
