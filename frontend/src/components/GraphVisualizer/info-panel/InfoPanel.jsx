import React from 'react';
import './InfoPanel.css';

const InfoPanel = ({ nodeId, onClose }) => {
    if (!nodeId) return null;

    return (
        <div className="info-panel">
            <div className="panel-header">
                <h3 className="panel-title">Node Details</h3>
                <button
                    onClick={onClose}
                    className="close-button"
                    aria-label="Close panel"
                >
                    ×
                </button>
            </div>

            <div className="data-section">
                <div className="data-label">IDENTIFIER</div>
                <div className="data-value">{nodeId.split('#').pop()}</div>
            </div>

            <div className="data-section">
                <div className="data-label">FULL URI</div>
                <div className="data-value">{nodeId}</div>
            </div>
        </div>
    );
};

export default InfoPanel;