import React, { useState, useEffect } from 'react';
import { X, Save, Server, Cpu } from 'lucide-react';
import { AppConfig } from '../types';
import { useTranslation } from '../locales';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) setLocalConfig(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/20 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-lg w-[95vw] sm:w-full max-w-md overflow-hidden animate-fade-in border border-stone-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-stone-50 border-b border-stone-100 px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2 font-sans">{t('settings.title')}</h2>
            <p className="text-xs text-stone-500 mt-1 font-serif">{t('settings.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full p-1 transition-all"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Language */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 font-sans">{t('settings.language')}</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg border border-stone-200">
              <button onClick={() => setLocalConfig({ ...localConfig, language: 'en' })}
                className={`py-3 rounded-lg text-sm font-semibold transition-all font-sans ${localConfig.language === 'en' ? 'bg-white text-brand-orange shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{t('settings.english')}</button>
              <button onClick={() => setLocalConfig({ ...localConfig, language: 'zh' })}
                className={`py-3 rounded-lg text-sm font-semibold transition-all font-sans ${localConfig.language === 'zh' ? 'bg-white text-brand-orange shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{t('settings.chinese')}</button>
            </div>
          </div>

          {/* Backend URL */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-2 font-sans">
              <Server size={14} /> Backend API URL
            </label>
            <input type="text" value={localConfig.baseUrl}
              onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all text-sm font-mono text-stone-800"
              placeholder="http://localhost:5000" />
            <p className="text-xs text-stone-400 mt-2 font-serif">Leave empty to use the built-in API proxy (/api).</p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-2 font-sans">
              <Cpu size={14} /> Temperature
            </label>
            <input type="number" step="0.1" min="0" max="2"
              value={localConfig.temperature}
              onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all text-sm text-stone-800" />
          </div>
        </div>

        <div className="px-6 py-5 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 font-sans">
          <button onClick={onClose} className="px-5 py-2.5 text-stone-600 hover:bg-stone-200/50 rounded-lg transition-colors text-sm font-semibold">{t('common.cancel')}</button>
          <button onClick={handleSave} className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg shadow-md shadow-brand-orange/25 transition-all flex items-center gap-2 text-sm font-bold active:scale-95">
            <Save size={16} /> {t('settings.saveChanges')}</button>
        </div>
      </div>
    </div>
  );
};
