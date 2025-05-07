import React, { useEffect, useState } from 'react';
import GraphVisualizer from './components/GraphVisualizer';
import Header from './components/Header';
import Footer from './components/Footer';
import InteractionGuide from './components/InteractionGuide';
import './App.css';

function App() {
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formatType, setFormatType] = useState('turtle');

    useEffect(() => {
        loadOntologyData();
    }, [formatType]);

    const loadOntologyData = () => {
        setIsLoading(true);
        setError(null);

        const turtleOntology = `
@prefix ex: <http://example.org/university#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# Classes
ex:Person a rdfs:Class .
ex:Student a rdfs:Class ; rdfs:subClassOf ex:Person .
ex:Professor a rdfs:Class ; rdfs:subClassOf ex:Person .
ex:Course a rdfs:Class .
ex:Department a rdfs:Class .
ex:University a rdfs:Class .

# Object Properties
ex:teaches a rdf:Property ; rdfs:domain ex:Professor ; rdfs:range ex:Course .
ex:enrolledIn a rdf:Property ; rdfs:domain ex:Student ; rdfs:range ex:Course .
ex:memberOf a rdf:Property ; rdfs:domain ex:Person ; rdfs:range ex:Department .
ex:offers a rdf:Property ; rdfs:domain ex:Department ; rdfs:range ex:Course .
ex:affiliatedWith a rdf:Property ; rdfs:domain ex:Department ; rdfs:range ex:University .

# Data Properties
ex:hasName a rdf:Property ; rdfs:domain ex:Person ; rdfs:range rdfs:Literal .
ex:courseCode a rdf:Property ; rdfs:domain ex:Course ; rdfs:range rdfs:Literal .

# Individuals
ex:JohnDoe a ex:Student ;
    ex:hasName "John Doe" ;
    ex:enrolledIn ex:CS101 ;
    ex:memberOf ex:CSDept .

ex:JaneSmith a ex:Professor ;
    ex:hasName "Dr. Jane Smith" ;
    ex:teaches ex:CS101 ;
    ex:memberOf ex:CSDept .

ex:CS101 a ex:Course ;
    ex:courseCode "CS101" .

ex:CS102 a ex:Course ;
    ex:courseCode "CS102" .

ex:CSDept a ex:Department ;
    ex:offers ex:CS101 , ex:CS102 ;
    ex:affiliatedWith ex:TechUniversity .

ex:TechUniversity a ex:University .
        `;

        fetch(`http://localhost:8080/api/ontology/parse?format=${formatType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: turtleOntology
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setGraphData(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch graph data:", err);
                setError(`Failed to load graph: ${err.message}`);
                setIsLoading(false);
            });
    };

    return (
        <div className="app-container">
            <Header
                formatType={formatType}
                setFormatType={setFormatType}
                onReload={loadOntologyData}
            />

            <main className="main-content">
                {isLoading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <div className="loading-title">Loading graph...</div>
                        <div className="loading-subtitle">
                            Parsing and processing ontology data
                        </div>
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <div className="error-icon">!</div>
                        <h2 className="error-title">Error Loading Data</h2>
                        <p className="error-message">{error}</p>
                        <button
                            onClick={loadOntologyData}
                            className="try-again-button"
                        >
                            <span>↻</span> Try Again
                        </button>
                    </div>
                )}

                {!isLoading && !error && graphData && (
                    <div className="graph-wrapper">
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