import React, {useEffect, useMemo, useRef, useState} from 'react';
import * as d3 from 'd3';
import OntologyService from "../../services/OntologyService";

const GraphVisualizer = ({ graphData, originalOntologyData, formatType }) => {
    const svgRef = useRef();
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeDetails, setNodeDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [fadeUnrelated, setFadeUnrelated] = useState(true);
    const [focusDepth, setFocusDepth] = useState(null);
    const [showImportanceIndicator, setShowImportanceIndicator] = useState(false);
    const [selectedRelationships, setSelectedRelationships] = useState(new Set());
    const [showInteractionGuide, setShowInteractionGuide] = useState(false);
    const [showControlPanel, setShowControlPanel] = useState(false);

    // Store D3 selections to avoid re-rendering
    const d3Refs = useRef({});

    // Extract unique relationship types and calculate node degrees
    const graphMetrics = useMemo(() => {
        if (!graphData) return {relationshipTypes: [], nodeDegrees: {}};

        const types = new Set();
        const degrees = {};

        // Initialize all nodes with 0 degree
        graphData.nodes.forEach(node => {
            degrees[node.id] = 0;
        });

        // Count degrees and collect relationship types
        graphData.edges.forEach(edge => {
            const label = edge.label || edge.predicate;
            types.add(label);

            // Count degrees
            degrees[edge.subject] = (degrees[edge.subject] || 0) + 1;
            degrees[edge.object] = (degrees[edge.object] || 0) + 1;
        });

        // Calculate max degree for normalization
        const maxDegree = Math.max(...Object.values(degrees), 1);

        return {
            relationshipTypes: Array.from(types).sort(),
            nodeDegrees: degrees,
            maxDegree
        };
    }, [graphData]);

    // Initialize selected relationships when graph loads
    useEffect(() => {
        if (graphMetrics.relationshipTypes.length > 0 && selectedRelationships.size === 0) {
            setSelectedRelationships(new Set(graphMetrics.relationshipTypes));
        }
    }, [graphMetrics.relationshipTypes]);

    // BFS to find all nodes within N hops from the selected node
    const getNodesWithinDepth = (startNodeId, depth, links) => {
        if (depth === null) {
            return null;
        }

        const visited = new Set([startNodeId]);
        let currentLevel = [startNodeId];

        for (let i = 0; i < depth; i++) {
            const nextLevel = [];
            currentLevel.forEach(nodeId => {
                links.forEach(link => {
                    const sourceId = link.source.id || link.source;
                    const targetId = link.target.id || link.target;

                    if (sourceId === nodeId && !visited.has(targetId)) {
                        visited.add(targetId);
                        nextLevel.push(targetId);
                    }
                    if (targetId === nodeId && !visited.has(sourceId)) {
                        visited.add(sourceId);
                        nextLevel.push(sourceId);
                    }
                });
            });
            currentLevel = nextLevel;
        }

        return visited;
    };

    // TODO: we will change this when we are going to implement weighted knowlegde graphs
    const getNodeOpacity = (nodeId) => {
        if (!showImportanceIndicator) return 1;

        const degree = graphMetrics.nodeDegrees[nodeId] || 0;
        const normalized = degree / graphMetrics.maxDegree;

        // Map to opacity range: 0.3 (low degree) to 1.0 (high degree)
        return 0.3 + (normalized * 0.7);
    };

    // Effect for rendering the graph visualization (only when graphData changes)
    useEffect(() => {
        if (!graphData) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const background = svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "#f9fafc")
            .attr("class", "background-rect");

        const container = svg.append("g")
            .attr("class", "graph-container");

        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        svg.call(zoom);

        const gridSize = 20;
        const grid = container.append("g").attr("class", "grid");

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

        const nodes = graphData.nodes.map(node => ({ id: node.id, label: node.label }));
        const links = graphData.edges.map(edge => ({
            source: edge.subject,
            target: edge.object,
            label: edge.label || edge.predicate
        }));

        const link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", "#c0d0e5")
            .attr("stroke-width", 2)
            .attr("data-source", d => d.source.id || d.source)
            .attr("data-target", d => d.target.id || d.target)
            .attr("data-label", d => d.label);

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
            .attr("fill", "#666")
            .attr("data-label", d => d.label);

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
            .attr("fill-opacity", d => getNodeOpacity(d.id))
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

        const nodeLabel = container.append("g")
            .attr("class", "node-labels")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("class", "node-label")
            .text(d => d.label.length > 20 ? d.label.substring(0, 15) + "..." : d.label)
            .attr("x", 12)
            .attr("y", ".31em")
            .attr("font-size", 12)
            .attr("opacity", d => getNodeOpacity(d.id));

        d3Refs.current = {node, link, nodeLabel, linkLabel, links, svg, zoom};

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const handleNodeClick = (nodeId) => {
            node.attr("fill", "#6b93c3")
                .attr("r", 8)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
                .attr("fill-opacity", d => getNodeOpacity(d.id));

            link.attr("stroke", "#c0d0e5")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 1);

            nodeLabel.attr("font-weight", "normal")
                .attr("font-size", 12)
                .attr("fill", "#000")
                .attr("opacity", d => getNodeOpacity(d.id));

            linkLabel.attr("opacity", 0.6)
                .attr("font-weight", "normal");

            if (!nodeId) {
                setSelectedNode(null);
                setNodeDetails(null);
                return;
            }

            setSelectedNode(nodeId);

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

            node.filter(d => d.id === nodeId)
                .attr("fill", "#4a6fa5")
                .attr("r", 12)
                .attr("stroke", "#2c4870")
                .attr("stroke-width", 2);

            nodeLabel.filter(d => d.id === nodeId)
                .attr("font-weight", "bold")
                .attr("font-size", 14)
                .attr("fill", "#2c4870");

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

        const resetGraph = () => {
            handleNodeClick(null);

            node.attr("fill", "#6b93c3")
                .attr("r", 8)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
                .attr("fill-opacity", d => getNodeOpacity(d.id));

            link.attr("stroke", "#c0d0e5")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 1);

            nodeLabel.attr("opacity", d => getNodeOpacity(d.id))
                .attr("font-size", 12)
                .attr("fill", "#000")
                .attr("font-weight", "normal");

            linkLabel.attr("opacity", 0.6)
                .attr("font-weight", "normal");

            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        };

        node.on("click", (event, d) => {
            event.stopPropagation();
            selectedNode === d.id ? handleNodeClick(null) : handleNodeClick(d.id);
        });

        svg.on("click", event => {
            if (event.target.tagName === 'svg' ||
                event.target.classList.contains('background-rect')) {
                event.stopPropagation();
                resetGraph();
            }
        });

        if (selectedNode) {
            handleNodeClick(selectedNode);
        }

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

    // Separate effect to handle highlighting and filtering changes
    useEffect(() => {
        if (!d3Refs.current.node) return;

        const {node, link, nodeLabel, linkLabel, links} = d3Refs.current;

        // Apply relationship type filtering
        link.style("display", d => selectedRelationships.has(d.label) ? null : "none");
        linkLabel.style("display", d => selectedRelationships.has(d.label) ? null : "none");

        // Apply importance indicator
        if (showImportanceIndicator && !selectedNode) {
            node.attr("fill-opacity", d => getNodeOpacity(d.id));
            nodeLabel.attr("opacity", d => getNodeOpacity(d.id));
        }

        // If no node is selected, just apply filters and return
        if (!selectedNode) return;

        // Reset all elements first
        node.attr("fill", "#6b93c3")
            .attr("r", 8)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("fill-opacity", d => getNodeOpacity(d.id));

        link.attr("stroke", "#c0d0e5")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 1);

        nodeLabel.attr("font-weight", "normal")
            .attr("font-size", 12)
            .attr("fill", "#000")
            .attr("opacity", d => getNodeOpacity(d.id));

        linkLabel.attr("opacity", 0.6)
            .attr("font-weight", "normal");

        // Highlight the selected node
        node.filter(d => d.id === selectedNode)
            .attr("fill", "#4a6fa5")
            .attr("r", 12)
            .attr("stroke", "#2c4870")
            .attr("stroke-width", 2)
            .attr("fill-opacity", 1);

        nodeLabel.filter(d => d.id === selectedNode)
            .attr("font-weight", "bold")
            .attr("font-size", 14)
            .attr("fill", "#2c4870")
            .attr("opacity", 1);

        // Find connected nodes (immediate connections)
        const connectedNodeIds = new Set();
        links.forEach(l => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            if (sourceId === selectedNode) connectedNodeIds.add(targetId);
            if (targetId === selectedNode) connectedNodeIds.add(sourceId);
        });

        // Get nodes within focus depth if focus mode is enabled
        const focusedNodes = focusDepth !== null
            ? getNodesWithinDepth(selectedNode, focusDepth, links)
            : null;

        // Highlight connected links and nodes
        link.filter(l => {
            const sourceId = l.source.id || l.source;
            const targetId = l.target.id || l.target;
            return sourceId === selectedNode || targetId === selectedNode;
        })
            .attr("stroke", "#4a6fa5")
            .attr("stroke-width", 3)
            .attr("stroke-opacity", 1);

        node.filter(d => connectedNodeIds.has(d.id))
            .attr("fill", "#78a2d8")
            .attr("r", 10)
            .attr("stroke", "#4a6fa5")
            .attr("stroke-width", 1.5)
            .attr("fill-opacity", 1);

        nodeLabel.filter(d => connectedNodeIds.has(d.id))
            .attr("font-weight", "bold")
            .attr("opacity", 1);

        linkLabel.filter(d => {
            const sourceId = d.source.id || d.source;
            const targetId = d.target.id || d.target;
            return sourceId === selectedNode || targetId === selectedNode;
        })
            .attr("opacity", 1)
            .attr("font-weight", "bold");

        // Apply fading based on settings
        if (fadeUnrelated || focusedNodes !== null) {
            let nodesToFade;
            if (focusedNodes !== null) {
                nodesToFade = d => d.id !== selectedNode && !focusedNodes.has(d.id);
            } else if (fadeUnrelated) {
                nodesToFade = d => d.id !== selectedNode && !connectedNodeIds.has(d.id);
            }

            node.filter(nodesToFade)
                .attr("fill-opacity", 0.15);

            nodeLabel.filter(nodesToFade)
                .attr("opacity", 0.15);

            const linkShouldBeFaded = (l) => {
                const sourceId = l.source.id || l.source;
                const targetId = l.target.id || l.target;

                if (focusedNodes !== null) {
                    return !focusedNodes.has(sourceId) || !focusedNodes.has(targetId);
                } else if (fadeUnrelated) {
                    return sourceId !== selectedNode && targetId !== selectedNode;
                }
                return false;
            };

            link.filter(linkShouldBeFaded)
                .attr("stroke-opacity", 0.1);

            linkLabel.filter(linkShouldBeFaded)
                .attr("opacity", 0.1);
        }

    }, [selectedNode, fadeUnrelated, focusDepth, showImportanceIndicator, selectedRelationships, graphMetrics]);

    const toggleRelationship = (relType) => {
        const newSelected = new Set(selectedRelationships);
        if (newSelected.has(relType)) {
            newSelected.delete(relType);
        } else {
            newSelected.add(relType);
        }
        setSelectedRelationships(newSelected);
    };

    const toggleAllRelationships = () => {
        if (selectedRelationships.size === graphMetrics.relationshipTypes.length) {
            setSelectedRelationships(new Set());
        } else {
            setSelectedRelationships(new Set(graphMetrics.relationshipTypes));
        }
    };

    return (
        <div className="graph-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* Control Panel Toggle Button */}
            <button
                onClick={() => setShowControlPanel(!showControlPanel)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '40px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(220, 220, 220, 0.8)',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    zIndex: 15,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(5px)',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease-in-out',
                    minWidth: '140px'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <span>View Controls</span>
                <span style={{
                    transform: showControlPanel ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease-in-out',
                    fontSize: '14px',
                }}>
                    ▼
                </span>
            </button>

            {/* Control Panel */}
            {showControlPanel && (
                <div className="info-panel" style={{
                    position: 'absolute',
                    top: '80px',
                    left: '40px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(220, 220, 220, 0.8)',
                    zIndex: 10,
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    width: '260px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                    }}>
                        <h4 style={{margin: '0', fontSize: '14px', fontWeight: '600', color: '#333'}}>
                            Settings
                        </h4>
                        <button
                            onClick={() => setShowControlPanel(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '18px',
                                color: '#888',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            ×
                        </button>
                    </div>

                    {/* Fade Unrelated Toggle */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        marginBottom: '12px',
                        fontSize: '13px',
                        color: '#555'
                    }}>
                        <input
                            type="checkbox"
                            checked={fadeUnrelated}
                            onChange={(e) => setFadeUnrelated(e.target.checked)}
                            style={{marginRight: '8px', cursor: 'pointer'}}
                        />
                        Fade Unrelated Nodes
                    </label>

                    {/* Node Importance Indicator */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        marginBottom: '12px',
                        fontSize: '13px',
                        color: '#555'
                    }}>
                        <input
                            type="checkbox"
                            checked={showImportanceIndicator}
                            onChange={(e) => setShowImportanceIndicator(e.target.checked)}
                            style={{marginRight: '8px', cursor: 'pointer'}}
                        />
                        Show Node Importance
                    </label>

                    {/* Focus Mode Depth Selector */}
                    <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0'}}>
                        <label style={{fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px'}}>
                            Focus Mode
                        </label>
                        <select
                            value={focusDepth === null ? 'off' : focusDepth}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFocusDepth(val === 'off' ? null : parseInt(val));
                            }}
                            style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                border: '1px solid #d0d0d0',
                                fontSize: '13px',
                                cursor: 'pointer',
                                backgroundColor: 'white'
                            }}
                            disabled={!selectedNode}
                        >
                            <option value="off">Off</option>
                            <option value="1">1 hop</option>
                            <option value="2">2 hops</option>
                            <option value="3">3 hops</option>
                            <option value="4">4 hops</option>
                        </select>
                        {!selectedNode && (
                            <div style={{fontSize: '11px', color: '#999', marginTop: '4px'}}>
                                Select a node to enable
                            </div>
                        )}
                    </div>

                    {/* Relationship Type Filter */}
                    <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0'}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                        }}>
                            <label style={{fontSize: '13px', color: '#555'}}>
                                Relationship Types
                            </label>
                            <button
                                onClick={toggleAllRelationships}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#4a6fa5',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                {selectedRelationships.size === graphMetrics.relationshipTypes.length ? 'None' : 'All'}
                            </button>
                        </div>
                        <div style={{maxHeight: '200px', overflowY: 'auto', fontSize: '12px'}}>
                            {graphMetrics.relationshipTypes.map(relType => (
                                <label
                                    key={relType}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        marginBottom: '6px',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        backgroundColor: selectedRelationships.has(relType) ? '#f0f4ff' : 'transparent'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRelationships.has(relType)}
                                        onChange={() => toggleRelationship(relType)}
                                        style={{marginRight: '8px', cursor: 'pointer'}}
                                    />
                                    <span style={{
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }} title={relType}>
                                        {relType}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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

                            {showImportanceIndicator && (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#fff3cd',
                                    borderRadius: '6px',
                                    marginBottom: '16px',
                                    borderLeft: '4px solid #ffc107'
                                }}>
                                    <div style={{fontSize: '13px', color: '#666', marginBottom: '4px'}}>NODE
                                        IMPORTANCE
                                    </div>
                                    <div style={{fontWeight: '500'}}>
                                        {graphMetrics.nodeDegrees[selectedNode] || 0} connections
                                        <span style={{fontSize: '11px', color: '#666', marginLeft: '8px'}}>
                                            ({Math.round(getNodeOpacity(selectedNode) * 100)}% opacity)
                                        </span>
                                    </div>
                                </div>
                            )}

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