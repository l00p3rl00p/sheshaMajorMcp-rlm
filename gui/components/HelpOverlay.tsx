import React from 'react';
import { ScreenName } from '../types';
import { helpContent, HelpEntry } from '../src/help/content';
import { X } from 'lucide-react';

interface Props {
  screen: ScreenName;
  onClose: () => void;
}

export const HelpOverlay: React.FC<Props> = ({ screen, onClose }) => {
  const entry: HelpEntry = helpContent[screen];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-3xl bg-white/5 border border-white/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-sm text-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
          title="Close help overlay"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold text-white mb-2">{entry.heading}</h2>
        <div className="space-y-2">
          {entry.description.map((line) => (
            <p key={line} className="leading-snug text-gray-200">
              {line}
            </p>
          ))}
        </div>
        {entry.actions && (
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-widest text-gray-400">Actions</p>
            <ul className="space-y-1">
              {entry.actions.map((action) => (
                <li key={action} className="flex items-center gap-2 text-gray-100">
                  <span className="text-primary">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
