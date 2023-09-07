import React from "react";
import '../styles.css';

export const MessageModal = ({ showModal, onClose, estimatedGas,handleExecuteTransaction }) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Transaction</h2>
        <p>Estimated Gas: {estimatedGas} wei</p>
        <div className="modal-buttons">
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="ok" onClick={handleExecuteTransaction}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export const ErrorModal = ({ showErrorModal, onClose, errorMessage }) => {
  if (!showErrorModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Error Occurred</h2>
        <p>{errorMessage}</p>
        <div className="modal-buttons">
          <button className="cancel" onClick={onClose}>
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};
