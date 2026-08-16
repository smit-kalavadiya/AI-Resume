import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STAGES = [
  "Reading document…",
  "Extracting skills & experience…",
  "Comparing against open roles…",
  "Ranking by fit…",
];

export default function ScanningStage({ fileName }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="scan">
      <div className="scan__sheet">
        <div className="scan__sheet-header">
          <span className="scan__dot" />
          <span className="scan__dot" />
          <span className="scan__dot" />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            className="scan__line"
            key={i}
            style={{ width: `${[92, 68, 84, 40, 76, 58, 88][i]}%` }}
          />
        ))}
        <motion.div
          className="scan__beam"
          animate={{ top: ["4%", "92%", "4%"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <p className="scan__filename">{fileName}</p>

      <div className="scan__status" aria-live="polite">
        <span className="scan__spinner" aria-hidden="true" />
        <span key={stageIndex} className="scan__status-text">
          {STAGES[stageIndex]}
        </span>
      </div>

      <div className="scan__progress">
        {STAGES.map((_, i) => (
          <span key={i} className={`scan__progress-tick ${i <= stageIndex ? "is-active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
