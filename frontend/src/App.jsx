import React, { useState } from 'react';
import GraphVisualizer from './components/GraphVisualizer';
import Header from './components/Header';
import Footer from './components/Footer';
import InteractionGuide from './components/InteractionGuide';
import './App.css';
import OntologyService from "./services/OntologyService";
import FileUploadForm from './components/FileUploadForm';

function App() {
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formatType, setFormatType] = useState('turtle');
    const [showForm, setShowForm] = useState(false);
    const [turtleInput, setTurtleInput] = useState('');
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [originalOntology, setOriginalOntology] = useState(null);
    const [stats, setStats] = useState(null);

    const handleParseDataClick = () => {
        setShowForm(true);
        setShowFileUpload(false);
        setGraphData(null);
        setError(null);
        setOriginalOntology(null);
        setStats(null);
    };

    const handleUploadFileClick = () => {
        setShowFileUpload(true);
        setShowForm(false);
        setGraphData(null);
        setError(null);
        setOriginalOntology(null);
        setStats(null);
    };

    const handleBackClick = () => {
        setShowForm(false);
        setShowFileUpload(false);
        setGraphData(null);
        setError(null);
        setOriginalOntology(null);
        setStats(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Store the original ontology data for later use
            setOriginalOntology(turtleInput);

            // Parse the ontology data through the backend
            const data = await OntologyService.parseOntologyData(turtleInput, formatType);
            setGraphData(data);

            // Get ontology statistics
            const statsData = await OntologyService.getOntologyStatistics(turtleInput, formatType);
            setStats(statsData);

            setShowForm(false);
        } catch (err) {
            setError(`Failed to load graph: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e, file) => {
        e.preventDefault();

        // Use the file passed from the FileUploadForm component
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Read the file content to store for later use
            const reader = new FileReader();
            reader.onload = async (e) => {
                const fileContent = e.target.result;
                setOriginalOntology(fileContent);

                // Upload and parse the file through the backend
                const data = await OntologyService.uploadOntologyFile(file, formatType);
                setGraphData(data);

                // Get ontology statistics
                const statsData = await OntologyService.getOntologyStatistics(fileContent, formatType);
                setStats(statsData);

                setShowFileUpload(false);
                setIsLoading(false);
            };

            reader.onerror = () => {
                setError('Error reading file');
                setIsLoading(false);
            };

            reader.readAsText(file);
        } catch (err) {
            setError(`Failed to load graph: ${err.message}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <Header
                formatType={formatType}
                setFormatType={setFormatType}
                onBack={handleBackClick}
            />

            <main className="main-content">
                {!graphData && (
                    <div className="input-section">
                        {!showForm && !showFileUpload ? (
                            <div className="welcome-panel">
                                <h2>Get Started</h2>
                                <p>Select how you want to provide ontology data.</p>
                                <div className="action-buttons">
                                    <button onClick={handleParseDataClick} className="primary-btn">Parse Data</button>
                                    <button onClick={handleUploadFileClick} className="secondary-btn">Upload File</button>
                                </div>
                            </div>
                        ) : showForm ? (
                            <form onSubmit={handleSubmit} className="card-form">
                                <h2 className="card-title">🧠 Paste Ontology Data</h2>
                                <textarea
                                    value={turtleInput}
                                    onChange={(e) => setTurtleInput(e.target.value)}
                                    placeholder="Enter ontology data in selected format..."
                                    rows="10"
                                />
                                <div className="form-footer">
                                    <div className="format-select">
                                        <label>Format:</label>
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
                                    </div>
                                    <div className="form-buttons">
                                        <button type="submit" className="primary-btn" disabled={isLoading}>
                                            {isLoading ? 'Parsing...' : 'Parse'}
                                        </button>
                                        <button type="button" onClick={handleBackClick} className="secondary-btn">Cancel</button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <FileUploadForm
                                formatType={formatType}
                                setFormatType={setFormatType}
                                onSubmit={handleFileUpload}
                                onCancel={handleBackClick}
                                isLoading={isLoading}
                            />
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
                        <GraphVisualizer
                            graphData={graphData}
                            originalOntologyData={originalOntology}
                            formatType={formatType}
                        />
                        <InteractionGuide />
                    </div>
                )}
            </main>

            <Footer
                nodeCount={stats ? stats.nodeCount : 0}
                edgeCount={stats ? stats.edgeCount : 0}
            />
        </div>
    );
}

export default App;