import React from 'react';
import './Header.css';
import SearchBar from "../GraphVisualizer/SearchBar";

const Header = ({ formatType, onBack, graphData, onNodeSelect, selectedNode }) => {
    return (
        <header className="app-header">
            <div className="header-title-container">
                <h1 className="header-title">Semantic Graph Visualizer</h1>
                <p className="header-subtitle">Explore ontology relationships and connections</p>
            </div>

            {/* TODO: implement semantic search in the future and AI-powered semantic search based where we can use embedding models */}
            {/* Center SearchBar - for now it searches based on keywords */}
            <div className="header-search-container">
                {graphData && (
                    <SearchBar
                        graphData={graphData}
                        onNodeSelect={onNodeSelect}
                        selectedNode={selectedNode}
                    />
                )}
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