import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { validateResumeFile, sanitizeFileName } from "../utils/validateFile";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileIntake({ onSubmit, error }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const [checking, setChecking] = useState(false);
  const inputRef = useRef(null);

  const acceptFile = useCallback(async (candidate) => {
    if (!candidate) return;
    setChecking(true);
    setLocalError("");
    setFile(null);

    // Validates real file content (magic bytes), not just the
    // browser-reported MIME type, which is easy to spoof by renaming a file.
    const result = await validateResumeFile(candidate);

    setChecking(false);
    if (!result.ok) {
      setLocalError(result.reason);
      return;
    }
    setFile(candidate);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="intake">
      <motion.div
        className={`intake__zone ${dragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="Upload your resume as a PDF"
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />

        <div className="intake__corner intake__corner--tl" aria-hidden="true" />
        <div className="intake__corner intake__corner--br" aria-hidden="true" />

        {checking ? (
          <>
            <span className="scan__spinner" aria-hidden="true" style={{ marginBottom: 14 }} />
            <p className="intake__title">Checking file…</p>
            <p className="intake__hint">Confirming it's a genuine PDF</p>
          </>
        ) : !file ? (
          <>
            <svg className="intake__icon" viewBox="0 0 48 48" aria-hidden="true">
              <path
                d="M14 4h14l8 8v28a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                fill="none"
                strokeWidth="2"
              />
              <path d="M28 4v8h8" fill="none" strokeWidth="2" />
              <path d="M18 26l6-6 6 6M24 20v14" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="intake__title">Drop your resume here</p>
            <p className="intake__hint">or click to browse — PDF only, up to 10 MB</p>
          </>
        ) : (
          <div className="intake__ticket">
            <svg className="intake__ticket-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 2h9l5 5v15H6z" fill="none" strokeWidth="1.6" />
              <path d="M15 2v5h5" fill="none" strokeWidth="1.6" />
            </svg>
            <div className="intake__ticket-text">
              <span className="intake__ticket-name">{sanitizeFileName(file.name)}</span>
              <span className="intake__ticket-size">{formatBytes(file.size)} · ready to submit</span>
            </div>
            <button
              type="button"
              className="intake__ticket-remove"
              aria-label="Remove file"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              ×
            </button>
          </div>
        )}
      </motion.div>

      {(localError || error) && <p className="intake__error">{localError || error}</p>}

      <button
        type="button"
        className="btn btn--primary intake__submit"
        disabled={!file || checking}
        onClick={() => file && onSubmit(file)}
      >
        Begin matching
      </button>
    </div>
  );
}
