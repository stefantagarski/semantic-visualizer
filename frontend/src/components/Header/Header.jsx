import React from 'react';
import './Header.css';

const Header = ({ formatType, setFormatType, onBack }) => {
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
                <select
                    id="format-select"
                    value={formatType}
                    onChange={(e) => setFormatType(e.target.value)}
                    className="format-select"
                >
                    <option value="turtle">Turtle</option>
                    <option value="rdfxml">RDF/XML</option>
                    <option value="jsonld">JSON-LD</option>
                    <option value="ntriples">N-Triples</option>
                    <option value="trig">TriG</option>
                </select>
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