import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import OntologyService from "../../services/OntologyService";

const GraphVisualizer = ({ graphData, originalOntologyData, formatType }) => {
    const svgRef = useRef();
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeDetails, setNodeDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Effect for rendering the graph visualization
    useEffect(() => {
        if (!graphData) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous render

        // Set background color for the SVG
        const background = svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "#f9fafc")
            .attr("class", "background-rect");

        // Create a container group for the entire graph
        const container = svg.append("g")
            .attr("class", "graph-container");

        // Add zoom functionality with smooth transition
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Create grid with reduced code
        const gridSize = 20;
        const grid = container.append("g").attr("class", "grid");

        // Create grid lines more efficiently
        for (let y = 0; y < height; y += gridSize) {
            grid.append("line")
                .attr("x1", -width).attr("y1", y).attr("x2", width * 2).attr("y2", y)
                .attr("stroke", "#e5e9f0").attr("stroke-width", 1);
        }
        for (let x = 0; x < width; x += gridSize) {
            grid.append("line")
                .attr("x1", x).attr("y1", -height).attr("x2", x).attr("y2", height * 2)
                .attr("stroke", "#e5e9f0").attr("stroke-width", 1);
        }

        // Use the nodes and edges directly from the backend
        const nodes = graphData.nodes.map(node => ({ id: node.id, label: node.label }));
        const links = graphData.edges.map(edge => ({
            source: edge.subject,
            target: edge.object,
            label: edge.label || edge.predicate
        }));

        // Create link elements
        const link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", "#c0d0e5")
            .attr("stroke-width", 2)
            .attr("data-source", d => d.source.id || d.source)
            .attr("data-target", d => d.target.id || d.target);

        // Create link label elements
        const linkLabel = container.append("g")
            .attr("class", "link-labels")
            .selectAll("text")
            .data(links)
            .join("text")
            .attr("class", "link-label")
            .text(d => {
                const label = d.label;
                return label.length > 20 ? label.substring(0, 20) + "..." : label;
            })
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .attr("dy", -5)
            .attr("fill", "#666");

        // Create node elements
        const node = container.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 8)
            .attr("fill", "#6b93c3")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.1))")
            .attr("data-id", d => d.id)
            .attr("class", "node-circle")
            .call(d3.drag()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }));

        // Create node label elements
        const nodeLabel = container.append("g")
            .attr("class", "node-labels")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("class", "node-label")
            .text(d => d.label.length > 20 ? d.label.substring(0, 15) + "..." : d.label)
            .attr("x", 12)
            .attr("y", ".31em")
            .attr("font-size", 12);

        // Set up force simulation
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // Function to handle node click
        const handleNodeClick = (nodeId) => {
            // Reset all nodes and links to default appearance first
            node.attr("fill", "#2e8783")
                .attr("r", 8)
                .attr("stroke", null)
                .attr("stroke-width", 0);

            link.attr("stroke", "#999")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 0.6);

            nodeLabel.attr("font-weight", "normal")
                .attr("font-size", 12);

            linkLabel.attr("opacity", 0.6);

            // If no node is selected, we're done (reset state)
            if (!nodeId) {
                setSelectedNode(null);
                setNodeDetails(null);
                return;
            }

            // Set the selected node first
            setSelectedNode(nodeId);

            // Fetch node details from backend if original data available
            if (originalOntologyData) {
                setIsLoadingDetails(true);
                OntologyService.getNodeDetails(nodeId, originalOntologyData, formatType)
                    .then(details => {
                        setNodeDetails(details);
                        setIsLoadingDetails(false);
                    })
                    .catch(error => {
                        console.error("Error fetching node details:", error);
                        setIsLoadingDetails(false);
                    });
            }

            // Highlight the selected node
            node.filter(d => d.id === nodeId)
                .attr("fill", "#4a6fa5")
                .attr("r", 12)
                .attr("stroke", "#2c4870")
                .attr("stroke-width", 2);

            nodeLabel.filter(d => d.id === nodeId)
                .attr("font-weight", "bold")
                .attr("font-size", 14)
                .attr("fill", "#2c4870");

            // Find connected links and nodes
            const connectedLinks = links.filter(l =>
                (l.source.id === nodeId || l.source === nodeId) ||
                (l.target.id === nodeId || l.target === nodeId)
            );

            const connectedNodeIds = new Set();
            connectedLinks.forEach(l => {
                const sourceId = l.source.id || l.source;
                const targetId = l.target.id || l.target;
                if (sourceId === nodeId) connectedNodeIds.add(targetId);
                if (targetId === nodeId) connectedNodeIds.add(sourceId);
            });

            // Highlight connected links and nodes
            link.filter(l => (l.source.id === nodeId || l.source === nodeId) ||
                (l.target.id === nodeId || l.target === nodeId))
                .attr("stroke", "#4a6fa5")
                .attr("stroke-width", 3)
                .attr("stroke-opacity", 1);

            node.filter(d => connectedNodeIds.has(d.id))
                .attr("fill", "#78a2d8")
                .attr("r", 10)
                .attr("stroke", "#4a6fa5")
                .attr("stroke-width", 1.5);

            nodeLabel.filter(d => connectedNodeIds.has(d.id))
                .attr("font-weight", "bold");

            linkLabel.filter(d => (d.source.id === nodeId || d.source === nodeId) ||
                (d.target.id === nodeId || d.target === nodeId))
                .attr("opacity", 1)
                .attr("font-weight", "bold");

            // Dim non-connected elements
            link.filter(l => !(l.source.id === nodeId || l.source === nodeId) &&
                !(l.target.id === nodeId || l.target === nodeId))
                .attr("stroke-opacity", 0.2);

            node.filter(d => d.id !== nodeId && !connectedNodeIds.has(d.id))
                .attr("fill-opacity", 0.3);

            nodeLabel.filter(d => d.id !== nodeId && !connectedNodeIds.has(d.id))
                .attr("opacity", 0.3);

            linkLabel.filter(d => !(d.source.id === nodeId || d.source === nodeId) &&
                !(d.target.id === nodeId || d.target === nodeId))
                .attr("opacity", 0.2);
        };

        // Function to reset the graph
        const resetGraph = () => {
            // Clear node selection
            handleNodeClick(null);

            // Reset graph visual elements
            node.attr("fill", "#6b93c3")
                .attr("r", 8)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
                .attr("fill-opacity", 1);

            link.attr("stroke", "#c0d0e5")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 1);

            nodeLabel.attr("opacity", 1)
                .attr("font-size", 12)
                .attr("fill", "#000");

            linkLabel.attr("opacity", 0.6);

            // Reset zoom with transition
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        };

        // Add click handlers
        node.on("click", (event, d) => {
            event.stopPropagation();
            selectedNode === d.id ? handleNodeClick(null) : handleNodeClick(d.id);
        });

        // Background click resets the graph
        svg.on("click", event => {
            if (event.target.tagName === 'svg' ||
                event.target.classList.contains('background-rect')) {
                event.stopPropagation();
                resetGraph();
            }
        });

        // Apply initial highlighting if there's already a selected node
        if (selectedNode) {
            handleNodeClick(selectedNode);
        }

        // Update positions on simulation tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            nodeLabel
                .attr("x", d => d.x + 12)
                .attr("y", d => d.y + 4);
        });

    }, [graphData, originalOntologyData, formatType]);

    return (
        <div className="graph-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
            <svg ref={svgRef} width="100%" height="100%" />
            {selectedNode && (
                <div className="info-panel" style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    maxWidth: '320px',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(220, 220, 220, 0.8)',
                    color: '#333',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Node Details</h3>
                        <button
                            onClick={() => {
                                setSelectedNode(null);
                                setNodeDetails(null);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '20px',
                                color: '#888',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            ×
                        </button>
                    </div>

                    {isLoadingDetails ? (
                        <div className="loading">Loading node details...</div>
                    ) : (
                        <>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f7f9fc',
                                borderRadius: '6px',
                                marginBottom: '16px',
                                borderLeft: '4px solid #4a6fa5'
                            }}>
                                <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>IDENTIFIER</div>
                                <div style={{ fontWeight: '500', wordBreak: 'break-all' }}>
                                    {nodeDetails?.label || selectedNode.split('#').pop()}
                                </div>
                            </div>

                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f7f9fc',
                                borderRadius: '6px',
                                borderLeft: '4px solid #4a6fa5'
                            }}>
                                <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>FULL URI</div>
                                <div style={{ fontWeight: '500', fontSize: '14px', wordBreak: 'break-all' }}>
                                    {selectedNode}
                                </div>
                            </div>

                            {nodeDetails && nodeDetails.incomingConnections.length > 0 && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    backgroundColor: '#f7f9fc',
                                    borderRadius: '6px',
                                    borderLeft: '4px solid #6b8e23'
                                }}>
                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>INCOMING CONNECTIONS</div>
                                    <ul style={{ margin: '0', padding: '0 0 0 16px' }}>
                                        {nodeDetails.incomingConnections.map((conn, idx) => (
                                            <li key={`in-${idx}`} style={{ marginBottom: '6px', fontSize: '13px' }}>
                                                <span style={{ fontWeight: '500' }}>{conn.nodeLabel}</span>
                                                <span style={{ color: '#666' }}> via </span>
                                                <span style={{ fontStyle: 'italic', color: '#4a6fa5' }}>{conn.relationshipType}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {nodeDetails && nodeDetails.outgoingConnections.length > 0 && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    backgroundColor: '#f7f9fc',
                                    borderRadius: '6px',
                                    borderLeft: '4px solid #cd5c5c'
                                }}>
                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>OUTGOING CONNECTIONS</div>
                                    <ul style={{ margin: '0', padding: '0 0 0 16px' }}>
                                        {nodeDetails.outgoingConnections.map((conn, idx) => (
                                            <li key={`out-${idx}`} style={{ marginBottom: '6px', fontSize: '13px' }}>
                                                <span style={{ fontWeight: '500' }}>{conn.nodeLabel}</span>
                                                <span style={{ color: '#666' }}> via </span>
                                                <span style={{ fontStyle: 'italic', color: '#4a6fa5' }}>{conn.relationshipType}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default GraphVisualizer;