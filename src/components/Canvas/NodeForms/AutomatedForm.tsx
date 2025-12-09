// src/components/Canvas/NodeForms/AutomatedForm.tsx
// Automated form with Save/Cancel, action selection, and improved layout

import React, { useEffect, useState } from 'react';
import type { Node } from 'reactflow';
import { getAutomations } from '../../../api/client';
import type { AutomationAction } from '../../../types/api';
import { useToast } from '../../Toast/ToastProvider';
import { Type, Zap, Settings, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

/**
 * Module-level cache & error flag so we don't re-fetch or show duplicate toasts.
 */
let automationCache: AutomationAction[] | null = null;
let automationFetchPromise: Promise<AutomationAction[]> | null = null;
let automationFetchErrored = false;

interface AutomatedFormProps {
  node: Node<any>;
  onChange: (patch: any, saveVersion?: boolean) => void;
}

export default function AutomatedForm({ node, onChange }: AutomatedFormProps) {
  const [actions, setActions] = useState<AutomationAction[] | null>(automationCache);
  const [loading, setLoading] = useState<boolean>(!automationCache);
  const [error, setError] = useState<string | null>(automationFetchErrored ? 'Failed to fetch automations' : null);
  const toast = useToast();

  // Local state for form editing - allows Cancel to revert changes
  const [formData, setFormData] = useState({
    title: node.data.title || '',
    actionId: node.data.actionId || '',
    actionParams: node.data.actionParams || {},
    // Advanced fields
    retryOnFail: node.data.retryOnFail || false,
    maxRetries: node.data.maxRetries ?? 3,
  });

  // Track if form has unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Advanced section toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch automations on mount
  useEffect(() => {
    if (automationCache) {
      setActions(automationCache);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    if (!automationFetchPromise) {
      automationFetchPromise = getAutomations()
        .then((result) => {
          automationCache = result;
          automationFetchErrored = false;
          return result;
        })
        .catch((err) => {
          automationFetchErrored = true;
          throw err;
        })
        .finally(() => {
          automationFetchPromise = null;
        });
    }

    automationFetchPromise
      .then((res) => {
        if (!mounted) return;
        setActions(res);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError('Failed to fetch automations');
        setLoading(false);
        if (!automationFetchErrored) {
          toast.error('Failed to fetch automations');
          automationFetchErrored = true;
        }
        console.error('getAutomations error', err);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  // Sync local state when node changes
  useEffect(() => {
    setFormData({
      title: node.data.title || '',
      actionId: node.data.actionId || '',
      actionParams: node.data.actionParams || {},
      retryOnFail: node.data.retryOnFail || false,
      maxRetries: node.data.maxRetries ?? 3,
    });
    setIsDirty(false);
  }, [node.id]);

  const selectedAction = actions?.find((a) => a.id === formData.actionId) ?? null;

  // Update local form state
  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }

  // Update action param
  function handleParamChange(key: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      actionParams: { ...prev.actionParams, [key]: value },
    }));
    setIsDirty(true);
  }

  // Handle action selection change
  function handleActionChange(actionId: string) {
    setFormData((prev) => ({
      ...prev,
      actionId,
      actionParams: {}, // Reset params when action changes
    }));
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
      title: node.data.title || '',
      actionId: node.data.actionId || '',
      actionParams: node.data.actionParams || {},
      retryOnFail: node.data.retryOnFail || false,
      maxRetries: node.data.maxRetries ?? 3,
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
          placeholder="Enter automation title"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          aria-label="Automation title"
        />
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Action Selection */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <Zap size={14} />
          Action
        </label>

        {loading && (
          <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
            <Loader2 size={14} className="animate-spin" />
            Loading actions...
          </div>
        )}

        {!loading && error && (
          <div className="py-2 text-sm text-red-600 bg-red-50 px-3 rounded-lg">
            Unable to load actions. Please try again.
          </div>
        )}

        {!loading && !error && (
          <select
            value={formData.actionId}
            onChange={(e) => handleActionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            aria-label="Select action"
          >
            <option value="">-- Select an action --</option>
            {actions && actions.length > 0 ? (
              actions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No actions available
              </option>
            )}
          </select>
        )}
      </div>

      {/* Action Parameters */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="border border-gray-100 rounded-lg p-3 bg-slate-50">
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-3">
            <Settings size={14} />
            Action Parameters
          </div>
          <div className="space-y-3">
            {selectedAction.params.map((param) => (
              <div key={param}>
                <label className="text-sm text-slate-600 mb-1 block capitalize">
                  {param}
                </label>
                <input
                  type="text"
                  value={formData.actionParams[param] || ''}
                  onChange={(e) => handleParamChange(param, e.target.value)}
                  placeholder={`Enter ${param}`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  aria-label={param}
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
            {/* Retry on fail */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="retry-fail"
                checked={formData.retryOnFail}
                onChange={(e) => handleChange('retryOnFail', e.target.checked)}
                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
              />
              <label htmlFor="retry-fail" className="text-sm font-medium text-slate-700 cursor-pointer">
                Retry on failure
              </label>
            </div>
            {/* Max Retries */}
            {formData.retryOnFail && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Max Retries
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxRetries}
                  onChange={(e) => handleChange('maxRetries', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  aria-label="Max retries"
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
              ? 'bg-sky-600 hover:bg-sky-700 text-white'
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
