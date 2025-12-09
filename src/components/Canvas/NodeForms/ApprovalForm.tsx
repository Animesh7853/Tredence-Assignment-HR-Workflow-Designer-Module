// src/components/Canvas/NodeForms/ApprovalForm.tsx
// Approval form with Save/Cancel, Advanced section, and improved layout

import React, { useState, useEffect } from 'react';
import type { Node } from 'reactflow';
import { Type, UserCheck, ChevronDown, ChevronUp, Hash } from 'lucide-react';

interface ApprovalFormProps {
  node: Node<any>;
  onChange: (patch: any) => void;
}

export default function ApprovalForm({ node, onChange }: ApprovalFormProps) {
  // Local state for form editing - allows Cancel to revert changes
  const [formData, setFormData] = useState({
    title: node.data.title || '',
    approverRole: node.data.approverRole || '',
    // Advanced fields
    autoApproveThreshold: node.data.autoApproveThreshold ?? 0,
    escalationEmail: node.data.escalationEmail || '',
    timeoutDays: node.data.timeoutDays ?? 3,
  });

  // Track if form has unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Advanced section toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync local state when node changes
  useEffect(() => {
    setFormData({
      title: node.data.title || '',
      approverRole: node.data.approverRole || '',
      autoApproveThreshold: node.data.autoApproveThreshold ?? 0,
      escalationEmail: node.data.escalationEmail || '',
      timeoutDays: node.data.timeoutDays ?? 3,
    });
    setIsDirty(false);
  }, [node.id]);

  // Update local form state
  function handleChange(field: string, value: string | number) {
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
      approverRole: node.data.approverRole || '',
      autoApproveThreshold: node.data.autoApproveThreshold ?? 0,
      escalationEmail: node.data.escalationEmail || '',
      timeoutDays: node.data.timeoutDays ?? 3,
    });
    setIsDirty(false);
  }

  return (
    <div className="space-y-4">
      {/* Title field */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <Type size={14} />
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter approval title"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          aria-label="Approval title"
        />
        <p className="mt-1 text-xs text-slate-400">The name displayed on the node</p>
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Approver Role field */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <UserCheck size={14} />
          Approver Role
        </label>
        <input
          type="text"
          value={formData.approverRole}
          onChange={(e) => handleChange('approverRole', e.target.value)}
          placeholder="e.g., Manager, HR Director"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          aria-label="Approver role"
        />
        <p className="mt-1 text-xs text-slate-400">Who needs to approve this step</p>
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
            {/* Auto-approve threshold */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Hash size={14} />
                Auto-approve Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.autoApproveThreshold}
                onChange={(e) => handleChange('autoApproveThreshold', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                aria-label="Auto-approve threshold"
              />
              <p className="mt-1 text-xs text-slate-400">Auto-approve if value is below this threshold (0 = disabled)</p>
            </div>
            {/* Timeout Days */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Timeout (Days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.timeoutDays}
                onChange={(e) => handleChange('timeoutDays', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                aria-label="Timeout days"
              />
            </div>
            {/* Escalation Email */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Escalation Email
              </label>
              <input
                type="email"
                value={formData.escalationEmail}
                onChange={(e) => handleChange('escalationEmail', e.target.value)}
                placeholder="escalation@company.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                aria-label="Escalation email"
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
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
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
