"use client";

import { Clock3, Pause, Play } from "lucide-react";
import { motion } from "motion/react";

interface FocusTimerPanelProps {
  minutes: number;
  formattedTime: string;
  active: boolean;
  onToggleActive: () => void;
}

export function FocusTimerPanel({
  minutes,
  formattedTime,
  active,
  onToggleActive,
}: FocusTimerPanelProps) {
  return (
    <div className="focus-panel">
      <div className="focus-panel-heading">
        <span className="eyebrow">
          <Clock3 size={14} /> Shared focus timer
        </span>
        <span>Session goal · {minutes} min</span>
      </div>
      <div className="focus-clock">
        <motion.span
          animate={{ scale: active ? [1, 1.02, 1] : 1 }}
          transition={{ repeat: active ? Infinity : 0, duration: 2 }}
        >
          {formattedTime}
        </motion.span>
        <small>{active ? "✨ The room is in focus mode" : "Ready when you are"}</small>
      </div>
      <button className="focus-button" onClick={onToggleActive}>
        {active ? (
          <>
            <Pause size={17} /> Pause focus
          </>
        ) : (
          <>
            <Play size={17} /> Start focus session
          </>
        )}
      </button>
    </div>
  );
}
