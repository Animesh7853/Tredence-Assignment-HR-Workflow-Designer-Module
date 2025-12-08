// Simple cycle detection using DFS
export function hasCycle(nodes: { id: string }[], edges: { source: string; target: string }[]) {
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  });

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(u: string) {
    if (inStack.has(u)) return true;
    if (visited.has(u)) return false;
    visited.add(u);
    inStack.add(u);
    const neigh = adj.get(u) || [];
    for (const v of neigh) {
      if (dfs(v)) return true;
    }
    inStack.delete(u);
    return false;
  }

  for (const n of nodes) {
    if (dfs(n.id)) return true;
  }
  return false;
}
