import React, { useState } from 'react';
import GraphVisualizer from './components/GraphVisualizer';
import Header from './components/Header';
import Footer from './components/Footer';
import InteractionGuide from './components/InteractionGuide';
import './App.css';

function App() {
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formatType, setFormatType] = useState('turtle');
    const [showForm, setShowForm] = useState(false);
    const [turtleInput, setTurtleInput] = useState('');

    const handleParseDataClick = () => {
        setShowForm(true);
        setGraphData(null);
        setError(null);
    };

    const handleBackClick = () => {
        setShowForm(false);
        setGraphData(null);
        setError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        fetch(`http://localhost:8080/api/ontology/parse?format=${formatType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: turtleInput,
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setGraphData(data);
                setIsLoading(false);
                setShowForm(false);
            })
            .catch((err) => {
                setError(`Failed to load graph: ${err.message}`);
                setIsLoading(false);
            });
    };

    return (
        <div className="app-container">
            <Header />

            <main className="main-content">
                {!graphData && (
                    <div className="input-section">
                        {!showForm ? (
                            <div className="welcome-panel">
                                <h2>Get Started</h2>
                                <p>Select how you want to provide ontology data.</p>
                                <div className="action-buttons">
                                    <button onClick={handleParseDataClick} className="primary-btn">Parse Data</button>
                                    <button className="secondary-btn">Upload File</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="parse-form">
                                <h3>Parse Ontology Data</h3>
                                <textarea
                                    value={turtleInput}
                                    onChange={(e) => setTurtleInput(e.target.value)}
                                    placeholder="Enter ontology data here..."
                                    rows="10"
                                />
                                <div className="form-controls">
                                    <label>
                                        Format:
                                        <select
                                            value={formatType}
                                            onChange={(e) => setFormatType(e.target.value)}
                                        >
                                            <option value="turtle">TURTLE</option>
                                            <option value="rdfxml">RDF/XML</option>
                                            <option value="jsonld">JSON-LD</option>
                                            <option value="ntriples">N-TRIPLE</option>
                                            <option value="trig">TRIG</option>
                                        </select>
                                    </label>
                                    <div className="form-buttons">
                                        <button type="submit" disabled={isLoading} className="primary-btn">
                                            {isLoading ? 'Parsing...' : 'Parse'}
                                        </button>
                                        <button type="button" onClick={handleBackClick} className="secondary-btn">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {isLoading && (
                    <div className="loading-panel">
                        <div className="spinner" />
                        <p>Parsing and generating graph...</p>
                    </div>
                )}

                {error && (
                    <div className="error-panel">
                        <h3>Error</h3>
                        <p>{error}</p>
                        <button onClick={handleBackClick}>Try Again</button>
                    </div>
                )}

                {graphData && !isLoading && !error && (
                    <div className="visualizer-section">
                            {/*<button onClick={handleBackClick} className="secondary-btn">← Back</button>*/}
                        <GraphVisualizer graphData={graphData} />
                        <InteractionGuide />
                    </div>
                )}
            </main>

            <Footer
                nodeCount={graphData ? graphData.nodes.length : 0}
                edgeCount={graphData ? graphData.edges.length : 0}
            />
        </div>
    );
}

export default App;
