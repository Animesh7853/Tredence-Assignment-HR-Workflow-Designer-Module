// src/components/Canvas/HistoryModal.tsx
// Modal for viewing node version history

import React from 'react';
import { X, History, Clock } from 'lucide-react';

export type VersionEntry = {
  timestamp: string;
  changes: Record<string, { old: any; new: any }>;
};

type HistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  nodeTitle: string;
  history: VersionEntry[];
};

export default function HistoryModal({
  isOpen,
  onClose,
  nodeTitle,
  history,
}: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <History size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Version History</h2>
              <p className="text-sm text-slate-500">{nodeTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No history yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Changes will appear here after you save edits
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Clock size={14} />
                    <span>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span className="ml-auto text-xs bg-slate-200 px-2 py-0.5 rounded">
                      v{history.length - index}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(entry.changes).map(([field, change]) => (
                      <div key={field} className="text-sm">
                        <span className="font-medium text-slate-700 capitalize">
                          {field}:
                        </span>
                        <div className="mt-1 pl-3 flex flex-col gap-1">
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-mono text-xs">−</span>
                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs break-all">
                              {String(change.old) || '(empty)'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-500 font-mono text-xs">+</span>
                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs break-all">
                              {String(change.new) || '(empty)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-slate-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
