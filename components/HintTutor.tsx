import React from 'react';
import { Hint, Theme } from '../types';
import { useI18n } from '../i18n/I18nProvider';
import { Lightbulb } from 'lucide-react';

interface HintTutorProps {
  hint: Hint;
  theme: Theme;
}

const HintTutor: React.FC<HintTutorProps> = ({ hint, theme }) => {
  const { t } = useI18n();

  if (!hint || hint.stage !== 'tutor') {
    return null;
  }
  
  const explanationKey = hint.technique === 'Naked Single' ? 'nakedSingleExplanation' : 'hiddenSingleExplanation';

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 p-4 max-w-lg mx-auto`}>
        <div className={`w-full p-4 rounded-2xl border-2 shadow-2xl ${theme.tutorBg} flex items-start space-x-4 animate-fade-in-up`}>
            <div className="flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-green-500" />
            </div>
            <div>
                <h4 className="font-bold text-lg">{t('tutor')}: {t(hint.technique)}</h4>
                <p className="text-sm mt-1">{t(explanationKey)}</p>
                <p className="text-xs mt-3 opacity-70">{t('hintNextStep')}</p>
            </div>
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