"use client";

import type { Bibble, BibbleStatus } from "@/types/map";
import { statusLabels } from "@/types/map";
import { BookOpen, Check, Circle, ExternalLink, Link2, Plus, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";

const statusOptions: Array<{ value: BibbleStatus; icon: typeof Circle }> = [
  { value: "not-started", icon: Circle },
  { value: "learning", icon: Sparkles },
  { value: "completed", icon: Check },
];

export function BibbleDetails({ bibble, onClose, onChange }: { bibble: Bibble; onClose: () => void; onChange?: (bibble: Bibble) => void }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.25 }}
      className="details-panel"
      aria-label="Bibble details"
    >
      <div className="details-panel-header">
        <div><span className="eyebrow">Bibble details</span><h2>{bibble.title}</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="Close details"><X size={18} /></button>
      </div>
      <label className="field-label" htmlFor="bibble-description">Description</label>
      <textarea id="bibble-description" value={bibble.description ?? ""} onChange={(event) => onChange?.({ ...bibble, description: event.target.value })} />
      <div className="details-section">
        <span className="field-label">Status</span>
        <div className="status-options">
          {statusOptions.map(({ value, icon: Icon }) => (
            <button key={value} className={`status-option ${bibble.status === value ? "status-option-active" : ""}`} onClick={() => onChange?.({ ...bibble, status: value, progress: value === "completed" ? 100 : bibble.progress })}>
              <Icon size={15} /> {statusLabels[value]}
            </button>
          ))}
        </div>
      </div>
      <div className="details-section">
        <div className="details-section-title"><span className="field-label"><Link2 size={14} /> Resources</span><button className="text-button"><Plus size={14} /> Add resource</button></div>
        {(bibble.resources ?? []).length ? bibble.resources?.map((resource) => <a className="resource-link" href={resource.url} key={resource.id} target="_blank" rel="noreferrer"><BookOpen size={14} />{resource.label}<ExternalLink size={12} /></a>) : <p className="empty-detail">Keep a favorite reference close by.</p>}
      </div>
      <div className="details-section"><label className="field-label" htmlFor="bibble-notes">Notes</label><textarea id="bibble-notes" value={bibble.notes ?? ""} placeholder="A small thought to remember..." onChange={(event) => onChange?.({ ...bibble, notes: event.target.value })} /></div>
      <div className="details-progress"><div><span>Progress</span><strong>{bibble.progress}%</strong></div><input aria-label="Bibble progress" type="range" min="0" max="100" value={bibble.progress} onChange={(event) => onChange?.({ ...bibble, progress: Number(event.target.value), status: Number(event.target.value) === 100 ? "completed" : Number(event.target.value) > 0 ? "learning" : "not-started" })} /></div>
    </motion.aside>
  );
}
