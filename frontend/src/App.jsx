import React, { useState } from 'react';
import GraphVisualizer from './components/GraphVisualizer';

function App() {
    const [graphData, setGraphData] = useState(null);
    const [turtleInput, setTurtleInput] = useState('');
    const [format, setFormat] = useState('turtle');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        fetch(`http://localhost:8080/api/ontology/parse?format=${format}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: turtleInput
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setGraphData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch graph data:", err);
                setLoading(false);
            });
    };

    return (
        <div style={{width: '100vw', height: '100vh', padding: '20px'}}>
            {!graphData ? (
                <form onSubmit={handleSubmit}>
                <textarea
                    value={turtleInput}
                    onChange={(e) => setTurtleInput(e.target.value)}
                    placeholder="Enter ontology data here..."
                    rows="10"
                    style={{width: '100%', marginBottom: '10px'}}
                />
                    <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        style={{marginBottom: '10px'}}
                    >
                        <option value="rdfxml">RDF/XML</option>
                        <option value="jsonld">JSON-LD</option>
                        <option value="ntriples">N-TRIPLE</option>
                        <option value="trig">TRIG</option>
                        <option value="turtle">TURTLE</option>
                    </select>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Parsing...' : 'Parse Data'}
                    </button>
                </form>
            ) : (
                <GraphVisualizer graphData={graphData}/>
            )}
        </div>
    );
}

export default App;
