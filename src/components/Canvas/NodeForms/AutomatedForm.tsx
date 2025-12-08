import React, { useEffect, useState } from 'react';
import type { Node } from 'reactflow';
import { getAutomations } from '../../../api/client';
import type { AutomationAction } from '../../../types/api';

export default function AutomatedForm({ node, onChange }: { node: Node<any>; onChange: (patch: any) => void }) {
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAutomations().then(a => setActions(a)).finally(() => setLoading(false));
  }, []);

  const selectedAction = actions.find(a => a.id === node.data.actionId);

  function setParam(key: string, value: string) {
    onChange({ actionParams: { ...(node.data.actionParams || {}), [key]: value } });
  }

  return (
    <div>
      <h4>Automated Step Node</h4>
      <div>
        <label>Title</label>
        <input value={node.data.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
      </div>

      <div>
        <label>Action</label>
        {loading ? <div>Loading...</div> : (
          <select value={node.data.actionId || ''} onChange={(e) => onChange({ actionId: e.target.value, actionParams: {} })}>
            <option value="">-- select action --</option>
            {actions.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        )}
      </div>

      {selectedAction && (
        <div>
          <h5>Action Parameters</h5>
          {selectedAction.params.map(p => (
            <div key={p}>
              <label>{p}</label>
              <input value={(node.data.actionParams && node.data.actionParams[p]) || ''} onChange={(e) => setParam(p, e.target.value)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
