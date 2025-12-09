// src/components/Canvas/NodeForms/AutomatedForm.tsx
import React, { useEffect, useState } from 'react';
import type { Node } from 'reactflow';
import { getAutomations } from '../../../api/client';
import type { AutomationAction } from '../../../types/api';
import { useToast } from '../../Toast/ToastProvider';

/**
 * Module-level cache & error flag so we don't re-fetch or show duplicate toasts.
 * This keeps fetches idempotent even if the component mounts/unmounts frequently.
 */
let automationCache: AutomationAction[] | null = null;
let automationFetchPromise: Promise<AutomationAction[]> | null = null;
let automationFetchErrored = false;

export default function AutomatedForm({ node, onChange }: { node: Node<any>; onChange: (patch: any) => void }) {
  const [actions, setActions] = useState<AutomationAction[] | null>(automationCache);
  const [loading, setLoading] = useState<boolean>(!automationCache);
  const [error, setError] = useState<string | null>(automationFetchErrored ? 'Failed to fetch automations' : null);
  const toast = useToast();

  useEffect(() => {
    if (automationCache) {
      setActions(automationCache);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    // If a fetch is already in-flight, reuse its promise.
    if (!automationFetchPromise) {
      automationFetchPromise = getAutomations()
        .then((result) => {
          automationCache = result;
          automationFetchErrored = false;
          return result;
        })
        .catch((err) => {
          automationFetchErrored = true;
          // Still rethrow so the awaiting callers can handle it
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
        // show toast only once across app lifecycle
        if (!automationFetchErrored) {
          toast.error('Failed to fetch automations');
          automationFetchErrored = true;
        }
        console.error('getAutomations error', err);
      });

    return () => {
      mounted = false;
    };
    // deliberately include `toast` in deps because it's stable from context
  }, [toast]);

  const selectedAction = actions?.find((a) => a.id === node.data.actionId) ?? null;

  function setParam(key: string, value: string) {
    onChange({ actionParams: { ...(node.data.actionParams || {}), [key]: value } });
  }

  return (
    <div>
      <div>
        <label className="text-sm font-medium block">Title</label>
        <input
          className="mt-1"
          value={node.data.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="mt-3">
        <label className="text-sm font-medium block">Action</label>

        {loading && <div className="mt-1 text-sm text-slate-500">Loading...</div>}

        {!loading && error && (
          <div className="mt-1 text-sm text-red-600">Unable to load actions</div>
        )}

        {!loading && !error && (
          <>
            <select
              className="mt-1 w-full"
              value={node.data.actionId || ''}
              onChange={(e) => onChange({ actionId: e.target.value, actionParams: {} })}
            >
              <option value="">-- select action --</option>
              {actions && actions.length > 0 ? (
                actions.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)
              ) : (
                <option value="" disabled>-- no actions available --</option>
              )}
            </select>
          </>
        )}
      </div>

      {selectedAction && (
        <div className="mt-3">
          <div className="text-sm font-medium">Action Parameters</div>
          {selectedAction.params.map((p) => (
            <div key={p} className="mt-2">
              <label className="text-sm block">{p}</label>
              <input
                className="mt-1 w-full"
                value={(node.data.actionParams && node.data.actionParams[p]) || ''}
                onChange={(e) => setParam(p, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
