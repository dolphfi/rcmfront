import React from 'react';
import { useTranslation } from "react-i18next";

export const SystemsFooter: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="no-print py-3 px-6 border-t border-slate-200 bg-white z-30 flex flex-col md:flex-row items-center justify-between text-[10px] sm:text-xs text-slate-500 font-medium">
            <div>
                <p>2024 - {new Date().getFullYear()} &copy; Resaux cellulaire Multi-Service. {t('footer.all_rights_reserved')}</p>
            </div>
            <div>
                <p>{t('footer.designed_and_developed_by')} <a href="https://kolabotech.com" target="_blank" rel="noopener noreferrer" className="text-primary font-bold cursor-pointer hover:underline">Kolabo Tech</a></p>
            </div>
        </footer>
    );
};
