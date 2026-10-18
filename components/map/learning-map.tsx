"use client";

import { BibbleDetails } from "@/components/bibble/bibble-details";
import { BibbleNode } from "@/components/bibble/bibble-node";
import { MapToolbar } from "@/components/map/map-toolbar";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { flowToMap, mapToFlow } from "@/lib/map-utils";
import type { Bibble, BibbleNodeData, LearningMap } from "@/types/map";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const nodeTypes = { bibble: BibbleNode };

export function LearningMapCanvas({ initialMap, editable = false }: { initialMap: LearningMap; editable?: boolean }) {
  const initialFlow = useMemo(() => mapToFlow(initialMap), [initialMap]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<BibbleNodeData>>(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [, setStoredMaps] = useLocalStorage<LearningMap[]>("bibble-maps", []);
  const flowRef = useRef<ReactFlowInstance<Node<BibbleNodeData>, Edge> | null>(null);
  const selected = nodes.find((node) => node.id === selectedId)?.data as BibbleNodeData | undefined;

  useEffect(() => {
    setNodes(initialFlow.nodes);
    setEdges(initialFlow.edges);
  }, [initialFlow, setEdges, setNodes]);

  const onConnect = useCallback((connection: Connection) => setEdges((current) => addEdge({ ...connection, type: "smoothstep", animated: true, style: { stroke: "var(--canvas-edge)", strokeWidth: 2 } }, current)), [setEdges]);
  const updateSelected = (bibble: Bibble) => setNodes((current) => current.map((node) => node.id === bibble.id ? { ...node, data: bibble as BibbleNodeData } : node));
  const addBibble = () => {
    const id = `bibble-${Date.now()}`;
    setNodes((current) => [
      ...current,
      {
        id,
        type: "bibble",
        position: { x: 320, y: 180 },
        width: 155,
        height: 96,
        measured: { width: 155, height: 96 },
        data: { id, title: "New bibble", description: "Give this idea a little shape.", status: "not-started", progress: 0, position: { x: 320, y: 180 } } as BibbleNodeData,
      },
    ]);
    setSelectedId(id);
  };
  const save = () => {
    const next = flowToMap(initialMap, nodes, edges);
    setStoredMaps((current) => [...current.filter((map) => map.id !== next.id), next]);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };
  const fitView = () => flowRef.current?.fitView({ padding: 0.22 });

  return <div className={`learning-map-shell ${editable ? "learning-map-editor" : ""}`}>
    {editable && <MapToolbar onAdd={addBibble} onUndo={() => undefined} onRedo={() => undefined} onFit={fitView} onSave={save} saved={saved} />}
    <div className="map-canvas-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          flowRef.current = instance;
          setTimeout(() => {
            instance.fitView({ padding: 0.22 });
          }, 40);
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={editable ? onConnect : undefined}
        onNodeClick={(_, node) => setSelectedId(node.id)}
        onPaneClick={() => setSelectedId(null)}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.22 }}
      >
        <Background variant={BackgroundVariant.Lines} color="color-mix(in srgb, var(--border) 60%, transparent)" gap={28} />
        <Controls showInteractive={false} />
        <MiniMap nodeColor="var(--canvas-node)" maskColor="rgb(255 255 255 / 0.72)" />
      </ReactFlow>
      {!editable && <div className="map-canvas-hint"><Star size={14} /> Click a bibble to explore it</div>}
    </div>
    <AnimatePresence>{selected && <BibbleDetails bibble={selected} onClose={() => setSelectedId(null)} onChange={editable ? updateSelected : undefined} />}</AnimatePresence>
    {editable && selected && <button className="delete-bibble" onClick={() => { setNodes((current) => current.filter((node) => node.id !== selected.id)); setSelectedId(null); }}><Trash2 size={15} /> Delete bibble</button>}
    {editable && <div className="editor-back-link"><ArrowLeft size={15} /> <span>Changes are kept on this device</span></div>}
  </div>;
}
