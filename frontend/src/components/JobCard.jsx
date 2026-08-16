import { motion } from "framer-motion";
import StampBadge from "./StampBadge";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function JobCard({ job, rank }) {
  return (
    <motion.article
      className="card"
      variants={cardVariants}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card__rank" aria-hidden="true">
        {String(rank).padStart(2, "0")}
      </div>

      <div className="card__body">
        <h3 className="card__title">{job.title}</h3>
        <p className="card__meta">Listing ID {job.id}</p>
        <p className="card__meta">Location: {job.location.area[1] ? `${job.location.area[1]}, ${job.location.area[0]}` : job.location.area[0]}</p>
        {job.redirect_url ? (
          // rel="noopener noreferrer" prevents the opened tab from getting
          // a `window.opener` reference back to this page (reverse
          // tabnabbing) and avoids leaking this page's URL via Referer.
          <a className="card__link" href={job.redirect_url} target="_blank" rel="noopener noreferrer">
            View posting
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path
                d="M4 12L12 4M12 4H6M12 4V10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        ) : (
          <span className="card__link card__link--disabled">Link unavailable</span>
        )}
      </div>

      <StampBadge score={job.match_score} percentText={job.match_score} id={job.id} tilt={rank % 2 === 0 ? 5 : -6} />
    </motion.article>
  );
}
