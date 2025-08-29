import React from 'react';
import { Hint, Theme } from '../types.ts';
import { useI18n } from '../i18n/I18nProvider.tsx';
import { Lightbulb, X } from 'lucide-react';

interface HintTutorProps {
  hint: Hint;
  theme: Theme;
  onClose: () => void;
  onReveal: () => void;
}

const HintTutor: React.FC<HintTutorProps> = ({ hint, theme, onClose, onReveal }) => {
  const { t } = useI18n();

  if (!hint || hint.stage !== 'tutor') {
    return null;
  }
  
  const explanationKey = hint.technique === 'Naked Single' ? 'nakedSingleExplanation' : 'hiddenSingleExplanation';

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-end justify-center p-4"
      onClick={onClose}
    >
        <div 
            className="w-full max-w-lg mx-auto relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()} // Prevent click inside from closing the whole overlay
        >
            <div 
                onClick={onReveal}
                className={`w-full p-4 pl-5 pr-10 rounded-2xl border-2 shadow-2xl text-left ${theme.tutorBg} flex items-start space-x-4 cursor-pointer hover:bg-opacity-80 transition-all`}
            >
                <div className="flex-shrink-0 mt-1">
                    <Lightbulb className="w-6 h-6 text-green-500" />
                </div>
                <div>
                    <h4 className="font-bold text-lg">{t('tutor')}: {t(hint.technique)}</h4>
                    <p className="text-sm mt-1">{t(explanationKey)}</p>
                    <p className="text-xs mt-3 font-semibold text-green-700">{t('hintNextStep')}</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${theme.button}`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
        <style>{`
            @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default HintTutor;