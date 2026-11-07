import React, { useState } from 'react';
import { Globe, Search, Check, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { INDIAN_LANGUAGES } from '../../utils/i18n';

export const LanguageSelectorModal: React.FC = () => {
  const { language, setLanguage, isLanguageModalOpen, closeLanguageModal, t } = useLanguage();
  const [search, setSearch] = useState('');

  if (!isLanguageModalOpen) return null;

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.region.toLowerCase().includes(search.toLowerCase())
  );

  const popularCodes = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'ur'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md max-h-[88vh] bg-white dark:bg-[#242D28] rounded-3xl border border-[#D8DCD5] dark:border-[#333E37] shadow-2xl flex flex-col overflow-hidden text-[#252C28] dark:text-[#F3F4EF]">
        {/* Header */}
        <div className="p-4 border-b border-[#D8DCD5] dark:border-[#333E37] flex items-center justify-between bg-[#F3F4EF]/50 dark:bg-[#1E2521]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#34483B] text-white flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#91A995]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#252C28] dark:text-white font-heading">
                {t('select_language', 'Select Language / भाषा चुनें')}
              </h3>
              <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
                {t('all_indian_languages', 'All 22 Official Languages of India + English')}
              </p>
            </div>
          </div>
          <button
            onClick={closeLanguageModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#68746B] hover:bg-[#E4EBE2] dark:hover:bg-[#34483B] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-[#D8DCD5] dark:border-[#333E37]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#68746B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('search_language', 'Search Indian language or state...')}
              className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#34483B]"
              autoFocus
            />
          </div>

          {/* Quick Select Chips */}
          <div className="flex gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
            {popularCodes.map(code => {
              const item = INDIAN_LANGUAGES.find(l => l.code === code);
              if (!item) return null;
              const isSelected = language === code;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setLanguage(code);
                    closeLanguageModal();
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#34483B] text-white'
                      : 'bg-white dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#333E37] text-[#34483B] dark:text-[#E4EBE2] hover:bg-[#E4EBE2]'
                  }`}
                >
                  {item.nativeName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Languages List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredLanguages.map(langItem => {
            const isSelected = language === langItem.code;
            return (
              <button
                key={langItem.code}
                onClick={() => {
                  setLanguage(langItem.code);
                  closeLanguageModal();
                }}
                className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-white font-semibold'
                    : 'hover:bg-[#F3F4EF] dark:hover:bg-[#1E2521] text-[#252C28] dark:text-[#F3F4EF]'
                }`}
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold">{langItem.nativeName}</span>
                    <span className="text-xs text-[#68746B] dark:text-[#9EACA1]">
                      ({langItem.name})
                    </span>
                  </div>
                  <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] block">
                    {langItem.region}
                  </span>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-[#557B61] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                ) : (
                  <span className="text-[11px] text-[#68746B] font-mono uppercase">
                    {langItem.code}
                  </span>
                )}
              </button>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="p-6 text-center text-xs text-[#68746B]">
              No language found matching "{search}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#D8DCD5] dark:border-[#333E37] bg-[#F3F4EF]/50 dark:bg-[#1E2521]/50 text-center text-[10px] text-[#68746B] dark:text-[#9EACA1]">
          All application screens and Dr. Sola AI will communicate in your chosen language.
        </div>
      </div>
    </div>
  );
};
