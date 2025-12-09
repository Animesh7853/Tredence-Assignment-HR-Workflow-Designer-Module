// src/components/Canvas/NodeForms/EndForm.tsx
// End form with Save/Cancel, Advanced section, and improved layout

import React, { useState, useEffect } from 'react';
import type { Node } from 'reactflow';
import { MessageSquare, ChevronDown, ChevronUp, ListChecks } from 'lucide-react';

interface EndFormProps {
  node: Node<any>;
  onChange: (patch: any, saveVersion?: boolean) => void;
}

export default function EndForm({ node, onChange }: EndFormProps) {
  // Local state for form editing - allows Cancel to revert changes
  const [formData, setFormData] = useState({
    endMessage: node.data.endMessage || '',
    summary: node.data.summary || false,
    // Advanced fields
    notifyOnComplete: node.data.notifyOnComplete || false,
    notificationEmail: node.data.notificationEmail || '',
  });

  // Track if form has unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Advanced section toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync local state when node changes
  useEffect(() => {
    setFormData({
      endMessage: node.data.endMessage || '',
      summary: node.data.summary || false,
      notifyOnComplete: node.data.notifyOnComplete || false,
      notificationEmail: node.data.notificationEmail || '',
    });
    setIsDirty(false);
  }, [node.id]);

  // Update local form state
  function handleChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }

  // Save changes to context with version tracking
  function handleSave() {
    onChange(formData, true);
    setIsDirty(false);
  }

  // Cancel and revert to original node data
  function handleCancel() {
    setFormData({
      endMessage: node.data.endMessage || '',
      summary: node.data.summary || false,
      notifyOnComplete: node.data.notifyOnComplete || false,
      notificationEmail: node.data.notificationEmail || '',
    });
    setIsDirty(false);
  }

  return (
    <div className="space-y-4">
      {/* End Message field */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <MessageSquare size={14} />
          End Message
        </label>
        <textarea
          value={formData.endMessage}
          onChange={(e) => handleChange('endMessage', e.target.value)}
          placeholder="Workflow completed successfully"
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          aria-label="End message"
        />
        <p className="mt-1 text-xs text-slate-400">Message displayed when workflow completes</p>
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Show Summary checkbox */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
        <input
          type="checkbox"
          id="show-summary"
          checked={formData.summary}
          onChange={(e) => handleChange('summary', e.target.checked)}
          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
        />
        <label htmlFor="show-summary" className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
          <ListChecks size={14} />
          Show Summary Report
        </label>
      </div>

      {/* Advanced section (collapsible) */}
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-600"
          aria-expanded={showAdvanced}
        >
          <span>Advanced Options</span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showAdvanced && (
          <div className="p-3 space-y-3 bg-white">
            {/* Notify on complete */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notify-complete"
                checked={formData.notifyOnComplete}
                onChange={(e) => handleChange('notifyOnComplete', e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="notify-complete" className="text-sm font-medium text-slate-700 cursor-pointer">
                Send notification on completion
              </label>
            </div>
            {/* Notification Email */}
            {formData.notifyOnComplete && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Notification Email
                </label>
                <input
                  type="email"
                  value={formData.notificationEmail}
                  onChange={(e) => handleChange('notificationEmail', e.target.value)}
                  placeholder="notify@company.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  aria-label="Notification email"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save / Cancel buttons */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDirty
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Save changes"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={!isDirty}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            isDirty
              ? 'border-gray-300 text-slate-700 hover:bg-slate-50'
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Cancel changes"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
