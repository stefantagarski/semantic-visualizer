import React, { useEffect, useState } from 'react';
import GraphVisualizer from './components/GraphVisualizer';

function App() {
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
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

        fetch('http://localhost:8080/api/ontology/parse?format=turtle', {
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
            .then(data => setGraphData(data))
            .catch(err => console.error("Failed to fetch graph data:", err));
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            {graphData ? <GraphVisualizer graphData={graphData} /> : <p>Loading graph...</p>}
        </div>
    );
}

export default App;
