import type { BibbleNodeData, LearningMap } from "@/types/map";
import type { Edge, Node } from "@xyflow/react";

export function mapToFlow(map: LearningMap): { nodes: Node<BibbleNodeData>[]; edges: Edge[] } {
  return {
    nodes: map.bibbles.map((bibble) => ({
      id: bibble.id,
      type: "bibble",
      position: bibble.position,
      data: bibble,
      width: 155,
      height: 96,
      measured: { width: 155, height: 96 },
    })) as Node<BibbleNodeData>[],
    edges: map.edges.map((edge) => ({
      ...edge,
      type: "smoothstep",
      animated: true,
      style: { stroke: "var(--primary)", strokeWidth: 2 },
    })),
  };
}

export function flowToMap(map: LearningMap, nodes: Node<BibbleNodeData>[], edges: Edge[]): LearningMap {
  return {
    ...map,
    bibbles: nodes.map((node) => ({ ...node.data, position: node.position })),
    edges: edges.map(({ id, source, target }) => ({ id, source, target })),
  };
}
