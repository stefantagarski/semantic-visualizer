import React from 'react';
import './Header.css';

const Header = ({ formatType, onBack }) => {
    return (
        <header className="app-header">
            <div className="header-title-container">
                <h1 className="header-title">Semantic Graph Visualizer</h1>
                <p className="header-subtitle">Explore ontology relationships and connections</p>
            </div>

            <div className="header-controls">
                <label htmlFor="format-select" className="format-label">
                    Ontology Format:
                </label>
                <span className="reload-button">
                {formatType}
                </span>
                <button
                    onClick={onBack}
                    className="reload-button"
                >
                    <span className="reload-icon">↻</span> Back
                </button>
            </div>
        </header>
    );
};

export default Header;