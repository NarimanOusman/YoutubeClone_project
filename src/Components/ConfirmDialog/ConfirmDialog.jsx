import React from "react";
import { AlertTriangle } from "lucide-react";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  open,
  title = "Confirm Action",
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-icon">
          <AlertTriangle size={22} />
        </div>

        <h3>{title}</h3>
        <p>{message}</p>

        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-cancel" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm-ok" onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
