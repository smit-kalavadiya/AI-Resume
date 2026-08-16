import { motion } from "framer-motion";

// Tiers translate a raw score into the stamp's ink color and label.
// Thresholds are intentionally generous since match scores in this
// domain cluster in the 0.6–0.9 range rather than 0–1 uniformly.
function tierFor(score) {
  if (score >= 0.78) return { label: "STRONG FIT", tone: "gold" };
  if (score >= 0.7) return { label: "GOOD FIT", tone: "red" };
  return { label: "POSSIBLE FIT", tone: "ink" };
}

export default function StampBadge({ score, percentText, tilt = -6, id }) {
  const { label, tone } = tierFor(score);
  const arcId = `arc-${id}`;

  return (
    <motion.div
      className={`stamp stamp--${tone}`}
      style={{ "--tilt": `${tilt}deg` }}
      initial={{ opacity: 0, scale: 1.6, rotate: tilt * 3 }}
      animate={{ opacity: 1, scale: 1, rotate: tilt }}
      transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
    >
      <svg className="stamp__ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="39" className="stamp__ring-inner" />
        <path id={arcId} d="M 50 8 A 42 42 0 1 1 49.9 8" fill="none" />
        <text dy={-4}>
          <textPath href={`#${arcId}`} startOffset="2%">
            RESUME INTAKE · RESUME INTAKE ·
          </textPath>
        </text>
      </svg>
      <div className="stamp__center">
        <span className="stamp__pct">{percentText}</span>
        <span className="stamp__label">{label}</span>
      </div>
    </motion.div>
  );
}
