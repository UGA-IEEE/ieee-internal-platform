import { useEffect } from 'react';
import { downloadPdf } from '../pdf/pdfUtils.js';

export default function PreviewModal({ url, filename, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Revoke blob URL when modal closes
  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [url]);

  function handleDownload() {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Preview — {filename}</span>
          <div className="modal-actions">
            <button className="btn-primary" onClick={handleDownload}>
              Download PDF
            </button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <iframe
          className="modal-iframe"
          src={url}
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
