// src/components/Canvas/NodeForms/StartForm.tsx
// Start form with Save/Cancel and improved layout

import React, { useState, useEffect } from 'react';
import type { Node } from 'reactflow';
import { Type, ChevronDown, ChevronUp } from 'lucide-react';

interface StartFormProps {
  node: Node<any>;
  onChange: (patch: any) => void;
}

export default function StartForm({ node, onChange }: StartFormProps) {
  // Local state for form editing - allows Cancel to revert changes
  const [formData, setFormData] = useState({
    title: node.data.title || '',
    // Advanced fields
    triggerType: node.data.triggerType || 'manual',
    description: node.data.description || '',
  });

  // Track if form has unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Advanced section toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync local state when node changes
  useEffect(() => {
    setFormData({
      title: node.data.title || '',
      triggerType: node.data.triggerType || 'manual',
      description: node.data.description || '',
    });
    setIsDirty(false);
  }, [node.id]);

  // Update local form state
  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }

  // Save changes to context
  function handleSave() {
    onChange(formData);
    setIsDirty(false);
  }

  // Cancel and revert to original node data
  function handleCancel() {
    setFormData({
      title: node.data.title || '',
      triggerType: node.data.triggerType || 'manual',
      description: node.data.description || '',
    });
    setIsDirty(false);
  }

  return (
    <div className="space-y-4">
      {/* Title field */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <Type size={14} />
          Workflow Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter workflow name"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          aria-label="Workflow title"
        />
        <p className="mt-1 text-xs text-slate-400">The name of this workflow</p>
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
            {/* Trigger Type */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Trigger Type
              </label>
              <select
                value={formData.triggerType}
                onChange={(e) => handleChange('triggerType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                aria-label="Trigger type"
              >
                <option value="manual">Manual</option>
                <option value="scheduled">Scheduled</option>
                <option value="event">Event-based</option>
              </select>
            </div>
            {/* Description */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe this workflow"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                aria-label="Workflow description"
              />
            </div>
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
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
