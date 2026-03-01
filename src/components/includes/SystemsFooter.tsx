import React from 'react';
import { useTranslation } from "react-i18next";

export const SystemsFooter: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="no-print py-2 px-6 border-t border-white/10 bg-black/40 backdrop-blur-xl z-30 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400/60">
            <div>
                <p>2024 - {new Date().getFullYear()} &copy; KolaboPOS. {t('footer.all_rights_reserved')}</p>
            </div>
            <div>
                <p>{t('footer.designed_and_developed_by')} <a href="https://kolabotech.com" target="_blank" rel="noopener noreferrer" className="text-orange-500/80 font-medium cursor-pointer hover:text-orange-500">Kolabo Tech</a></p>
            </div>
        </footer>
    );
};
