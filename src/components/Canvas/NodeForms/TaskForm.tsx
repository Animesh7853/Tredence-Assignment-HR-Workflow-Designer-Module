// src/components/Canvas/NodeForms/TaskForm.tsx
// Task form with Save/Cancel, Advanced section, and improved layout

import React, { useState, useEffect } from 'react';
import type { Node } from 'reactflow';
import { User, Calendar, FileText, ChevronDown, ChevronUp, Type } from 'lucide-react';

interface TaskFormProps {
  node: Node<any>;
  onChange: (patch: any, saveVersion?: boolean) => void;
}

export default function TaskForm({ node, onChange }: TaskFormProps) {
  // Local state for form editing - allows Cancel to revert changes
  const [formData, setFormData] = useState({
    title: node.data.title || '',
    description: node.data.description || '',
    assignee: node.data.assignee || '',
    dueDate: node.data.dueDate || '',
    // Advanced fields
    priority: node.data.priority || 'medium',
    notes: node.data.notes || '',
  });

  // Track if form has unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Advanced section toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync local state when node changes (e.g., different node selected)
  useEffect(() => {
    setFormData({
      title: node.data.title || '',
      description: node.data.description || '',
      assignee: node.data.assignee || '',
      dueDate: node.data.dueDate || '',
      priority: node.data.priority || 'medium',
      notes: node.data.notes || '',
    });
    setIsDirty(false);
  }, [node.id]);

  // Update local form state
  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }

  // Save changes to context with version tracking
  function handleSave() {
    onChange(formData, true); // Pass true to save version
    setIsDirty(false);
  }

  // Cancel and revert to original node data
  function handleCancel() {
    setFormData({
      title: node.data.title || '',
      description: node.data.description || '',
      assignee: node.data.assignee || '',
      dueDate: node.data.dueDate || '',
      priority: node.data.priority || 'medium',
      notes: node.data.notes || '',
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
          placeholder="Enter task title"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Task title"
        />
        <p className="mt-1 text-xs text-slate-400">The name displayed on the node</p>
      </div>

      {/* Description field */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <FileText size={14} />
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe what this task involves"
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Task description"
        />
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Assignee field */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <User size={14} />
          Assignee
        </label>
        <input
          type="text"
          value={formData.assignee}
          onChange={(e) => handleChange('assignee', e.target.value)}
          placeholder="e.g., John Smith, HR Team"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Task assignee"
        />
      </div>

      {/* Due Date field */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <Calendar size={14} />
          Due Date
        </label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Task due date"
        />
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
            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Task priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Internal Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes (not shown on node)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Internal notes"
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
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
