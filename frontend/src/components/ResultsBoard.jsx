import { motion } from "framer-motion";
import JobCard from "./JobCard";

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

export default function ResultsBoard({ jobs, totalJobs, fileName, onReset }) {
  return (
    <div className="results">
      <div className="results__header">
        <div>
          <p className="results__eyebrow">Intake complete</p>
          <h2 className="results__title">
            {totalJobs} roles reviewed for <span>{fileName}</span>
          </h2>
          <p className="results__sub">Ranked by fit — best match first.</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Start over
        </button>
      </div>

      <motion.div className="results__list" variants={listVariants} initial="hidden" animate="show">
        {jobs.map((job, i) => (
          <JobCard job={job} rank={i + 1} key={job.id} />
        ))}
      </motion.div>
    </div>
  );
}
