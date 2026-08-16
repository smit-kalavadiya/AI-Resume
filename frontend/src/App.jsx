import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";
import FileIntake from "./components/FileIntake";
import ScanningStage from "./components/ScanningStage";
import ResultsBoard from "./components/ResultsBoard";
import { DEMO_RESPONSE } from "./demoData";

// Point this at your backend's upload route. The form field name
// ("resume") should match what your backend's request parser expects.
const API_ENDPOINT = "http://127.0.0.1:8000/resume/upload";

const STAGE = {
  INTAKE: "intake",
  PROCESSING: "processing",
  RESULTS: "results",
};

export default function App() {
  const [stage, setStage] = useState(STAGE.INTAKE);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(file) {
    setFileName(file.name);
    setError("");
    setStage(STAGE.PROCESSING);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 3200));

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: form,
      });

      

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();

      

      await minDelay;
      setResult(data);
      
      setStage(STAGE.RESULTS);
    } catch (err) {
      // No live backend reachable at API_ENDPOINT — fall back to the
      // demo dataset so the interface can still be previewed end to end.
      await minDelay;
      console.warn(`Live match request failed (${err.message}); showing demo data.`);
      setResult(DEMO_RESPONSE);
      setStage(STAGE.RESULTS);
    }
  }

  function handleReset() {
    setStage(STAGE.INTAKE);
    setResult(null);
    setFileName("");
    setError("");
  }

  return (
    <div className="page">
      <header className="page__header">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9.5" fill="none" strokeWidth="1.6" />
              <path d="M7.5 12.5l3 3 6-7" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Intake
        </div>
        <span className="page__tag">Document Intake &amp; Role Matching</span>
      </header>

      <main className="page__main">
        <AnimatePresence mode="wait">
          {stage === STAGE.INTAKE && (
            <motion.section
              key="intake"
              className="hero"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="hero__eyebrow">Résumé Matching</p>
              <h1 className="hero__title">
                Drop your résumé in.
                <br />
                We'll find where it fits.
              </h1>
              <p className="hero__sub">
                One PDF, scored against every open role we're tracking — ranked and ready in seconds.
              </p>
              <FileIntake onSubmit={handleSubmit} error={error} />
            </motion.section>
          )}

          {stage === STAGE.PROCESSING && (
            <motion.section
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <ScanningStage fileName={fileName} />
            </motion.section>
          )}

          {stage === STAGE.RESULTS && result && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ResultsBoard
                jobs={result.jobs}
                totalJobs={result.total_jobs}
                fileName={fileName}
                onReset={handleReset}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="page__footer">Files are processed for matching only and are not stored.</footer>
    </div>
  );
}
