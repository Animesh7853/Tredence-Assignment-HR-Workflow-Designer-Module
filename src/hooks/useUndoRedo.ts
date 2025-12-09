// src/hooks/useUndoRedo.ts
// Custom hook for undo/redo functionality with React Flow

import { useCallback, useRef, useState } from 'react';
import type { Node, Edge } from 'reactflow';

type HistoryState = {
  nodes: Node<any>[];
  edges: Edge[];
};

type UseUndoRedoOptions = {
  maxHistory?: number;
};

export function useUndoRedo(options: UseUndoRedoOptions = {}) {
  const { maxHistory = 50 } = options;

  // Past states (for undo)
  const [past, setPast] = useState<HistoryState[]>([]);
  // Future states (for redo)
  const [future, setFuture] = useState<HistoryState[]>([]);
  // Current state reference (to avoid stale closures)
  const currentState = useRef<HistoryState>({ nodes: [], edges: [] });

  // Check if undo/redo is available
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Take a snapshot of current state and push to history
  const takeSnapshot = useCallback(() => {
    setPast((p) => {
      const newPast = [...p, { ...currentState.current }];
      // Limit history size
      if (newPast.length > maxHistory) {
        return newPast.slice(newPast.length - maxHistory);
      }
      return newPast;
    });
    // Clear future on new action
    setFuture([]);
  }, [maxHistory]);

  // Update current state reference (call this whenever nodes/edges change)
  const updateCurrentState = useCallback((nodes: Node<any>[], edges: Edge[]) => {
    currentState.current = { nodes, edges };
  }, []);

  // Undo: pop from past, push current to future, return previous state
  const undo = useCallback((): HistoryState | null => {
    if (past.length === 0) return null;

    const newPast = [...past];
    const previousState = newPast.pop()!;

    setPast(newPast);
    setFuture((f) => [{ ...currentState.current }, ...f]);

    return previousState;
  }, [past]);

  // Redo: pop from future, push current to past, return next state
  const redo = useCallback((): HistoryState | null => {
    if (future.length === 0) return null;

    const newFuture = [...future];
    const nextState = newFuture.shift()!;

    setFuture(newFuture);
    setPast((p) => [...p, { ...currentState.current }]);

    return nextState;
  }, [future]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    canUndo,
    canRedo,
    takeSnapshot,
    updateCurrentState,
    undo,
    redo,
    clearHistory,
    historyLength: past.length,
    futureLength: future.length,
  };
}
