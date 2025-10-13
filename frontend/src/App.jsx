import React, {useState} from 'react';
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
    const [showInteractionGuide, setShowInteractionGuide] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null)

    const handleParseDataClick = () => {
        setSelectedNode(null);
        setShowForm(true);
        setShowFileUpload(false);
        setGraphData(null);
        setError(null);
        setOriginalOntology(null);
        setStats(null);
        setTurtleInput('');
    };

    const handleUploadFileClick = () => {
        setSelectedNode(null);
        setShowFileUpload(true);
        setShowForm(false);
        setGraphData(null);
        setError(null);
        setOriginalOntology(null);
        setStats(null);
        setTurtleInput('');
    };

    const handleBackClick = () => {
        setSelectedNode(null);
        setShowForm(false);
        setShowFileUpload(false);
        setGraphData(null);
        setError(null);
        setOriginalOntology(null);
        setStats(null);
        setTurtleInput(''); // Clears the textarea content when going back
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            setOriginalOntology(turtleInput);
            const data = await OntologyService.parseOntologyData(turtleInput, formatType);
            setGraphData(data);
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
                graphData={graphData}
                onNodeSelect={setSelectedNode}
                selectedNode={selectedNode}
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
                                            {isLoading ? (
                                                <>
                                                    <span className="button-spinner"></span>
                                                    Parsing...
                                                </>
                                            ) : (
                                                'Parse'
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleBackClick}
                                            className="secondary-btn"
                                        >
                                            Cancel
                                        </button>
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
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Parsing ontology and building graph...</p>
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
                            selectedNode={selectedNode}
                            onNodeSelect={setSelectedNode}
                        />

                        <button
                            onClick={() => setShowInteractionGuide(!showInteractionGuide)}
                            style={{
                                position: 'fixed',
                                bottom: '70px',
                                right: '24px',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'rgba(74, 111, 165, 0.95)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                transition: 'all 0.2s',
                                zIndex: 1000,
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.background = 'rgba(74, 111, 165, 1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = 'rgba(74, 111, 165, 0.95)';
                            }}
                            title="Interaction Guide"
                        >
                            ?
                        </button>

                        {/* Interaction Guide Panel */}
                        {showInteractionGuide && <InteractionGuide/>}
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