import React, { useState } from 'react';
import GraphVisualizer from './components/GraphVisualizer';
import Header from './components/Header';
import Footer from './components/Footer';
import InteractionGuide from './components/InteractionGuide';
import './App.css';
import OntologyService from './services/OntologyService';
import FileUploadForm from './components/FileUploadForm'; // Import our new component

function App() {
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formatType, setFormatType] = useState('turtle');
    const [showForm, setShowForm] = useState(false);
    const [turtleInput, setTurtleInput] = useState('');
    const [showFileUpload, setShowFileUpload] = useState(false);

    const handleParseDataClick = () => {
        setShowForm(true);
        setShowFileUpload(false);
        setGraphData(null);
        setError(null);
    };

    const handleUploadFileClick = () => {
        setShowFileUpload(true);
        setShowForm(false);
        setGraphData(null);
        setError(null);
    };

    const handleBackClick = () => {
        setShowForm(false);
        setShowFileUpload(false);
        setGraphData(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await OntologyService.parseOntologyData(turtleInput, formatType);
            setGraphData(data);
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
            const data = await OntologyService.uploadOntologyFile(file, formatType);
            setGraphData(data);
            setShowFileUpload(false);
        } catch (err) {
            setError(`Failed to load graph: ${err.message}`);
        } finally {
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