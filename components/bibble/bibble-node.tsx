"use client";

import { statusColors } from "@/lib/utils";
import type { Bibble } from "@/types/map";
import { statusLabels } from "@/types/map";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Check, Circle, Star } from "lucide-react";
import { motion } from "motion/react";

const statusIcons = {
  "not-started": Circle,
  learning: Star,
  completed: Check,
};

export function BibbleNode({ data, selected }: NodeProps & { data: Bibble }) {
  const statusKey = data?.status && statusIcons[data.status] ? data.status : "not-started";
  const StatusIcon = statusIcons[statusKey] || Circle;
  const statusLabel = statusLabels[statusKey] || "Not started";
  const statusColor = statusColors[statusKey] || "var(--primary)";
  const title = data?.title || "Untitled Bibble";
  const progress = typeof data?.progress === "number" ? data.progress : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: selected ? 1.05 : 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`bibble-node bibble-node-${statusKey} ${selected ? "bibble-node-selected" : ""}`}
      tabIndex={0}
      aria-label={`${title}, ${statusLabel}, ${progress}% complete`}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-2 !border-white !bg-[var(--primary)]" />
      <div className="bibble-node-sparkle"><Star size={12} fill="currentColor" /></div>
      <div className="bibble-node-title">{title}</div>
      <div className="bibble-node-status">
        <StatusIcon size={13} strokeWidth={2.4} color={statusColor} />
        <span>{statusLabel}</span>
      </div>
      <div className="bibble-progress" aria-hidden="true">
        <span style={{ width: `${progress}%`, background: statusColor }} />
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-2 !border-white !bg-[var(--primary)]" />
    </motion.div>
  );
}


