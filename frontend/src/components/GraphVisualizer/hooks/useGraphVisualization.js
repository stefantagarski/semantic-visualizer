import { useEffect } from 'react';
import * as d3 from 'd3';
import OntologyService from "../../../services/OntologyService";

{/* Custom hook to manage D3 graph visualization */ }

export const useGraphVisualization = ({
                                          graphData,
                                          svgRef,
                                          d3Refs,
                                          selectedNode,
                                          setSelectedNode,
                                          setNodeDetails,
                                          setIsLoadingDetails,
                                          originalOntologyData,
                                          formatType,
                                          onNodeSelect,
                                          graphMetrics,
                                          handleNodeClick
                                      }) => {
    useEffect(() => {
        if (!graphData) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Create background
        const background = svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "#f9fafc")
            .attr("class", "background-rect");

        const container = svg.append("g")
            .attr("class", "graph-container");

        // Setup zoom
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Create grid
        createGrid(container, width, height);

        // Prepare data
        const nodes = graphData.nodes.map(node => ({ id: node.id, label: node.label }));
        const links = graphData.edges.map(edge => ({
            source: edge.subject,
            target: edge.object,
            label: edge.label || edge.predicate
        }));

        // Create links
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

        // Create link labels
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

        // Helper function for node opacity
        const getNodeOpacity = (nodeId) => {
            const degree = graphMetrics.nodeDegrees[nodeId] || 0;
            const normalized = degree / graphMetrics.maxDegree;
            return 0.3 + (normalized * 0.7);
        };

        // Create nodes
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
            .attr("fill-opacity", d => getNodeOpacity(d.id));

        // Create node labels
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

        // Store D3 selections
        d3Refs.current = { node, link, nodeLabel, linkLabel, links, svg, zoom };

        // Setup force simulation
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // Add drag behavior
        node.call(d3.drag()
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

        // Node click handler - FIXED VERSION
        const handleInternalNodeClick = async (nodeId) => {
            resetAllStyles(node, link, nodeLabel, linkLabel, getNodeOpacity);

            if (!nodeId) {
                setSelectedNode(null);
                setNodeDetails(null);
                if (onNodeSelect) onNodeSelect(null);
                return;
            }

            // Find the node data to get its label and degree
            const nodeData = nodes.find(n => n.id === nodeId);
            const nodeName = nodeData ? nodeData.label : nodeId;

            // Calculate degree opacity (normalized degree value)
            const degree = graphMetrics.nodeDegrees[nodeId] || 0;
            const degreeOpacity = graphMetrics.maxDegree > 0 ? degree / graphMetrics.maxDegree : 0;

            // Call the external handleNodeClick to track the click - AWAIT IT
            if (handleNodeClick) {
                try {
                    await handleNodeClick(nodeId, nodeName, degreeOpacity);
                    console.log(' Node click tracked successfully:', nodeId);
                } catch (error) {
                    console.error(' Error tracking node click:', error);
                }
            }

            setSelectedNode(nodeId);
            if (onNodeSelect) onNodeSelect(nodeId);

            // Fetch node details
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

            // Apply highlighting
            applyNodeHighlighting(node, link, nodeLabel, linkLabel, links, nodeId, getNodeOpacity);
        };

        // Reset graph handler
        const resetGraph = () => {
            handleInternalNodeClick(null);
            resetAllStyles(node, link, nodeLabel, linkLabel, getNodeOpacity);
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        };

        // Event listeners - FIXED VERSION
        node.on("click", async (event, d) => {
            event.stopPropagation();

            // Calculate degree opacity
            const degree = graphMetrics.nodeDegrees[d.id] || 0;
            const degreeOpacity = graphMetrics.maxDegree > 0 ? degree / graphMetrics.maxDegree : 0;
            const nodeName = d.label || d.id;

            // Always record the click for navigation path tracking - AWAIT IT
            if (handleNodeClick) {
                try {
                    await handleNodeClick(d.id, nodeName, degreeOpacity);
                    console.log('✅ Click recorded for:', d.id, 'weight:', degreeOpacity.toFixed(2));
                } catch (error) {
                    console.error('❌ Failed to record click:', error);
                }
            }

            // Toggle or select the node
            if (selectedNode === d.id) {
                await handleInternalNodeClick(null);
            } else {
                await handleInternalNodeClick(d.id);
            }
        });

        svg.on("click", event => {
            if (event.target.tagName === 'svg' ||
                event.target.classList.contains('background-rect')) {
                event.stopPropagation();
                resetGraph();
            }
        });

        // Apply initial selection if exists
        if (selectedNode) {
            handleInternalNodeClick(selectedNode);
        }

        // Simulation tick
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

    }, [graphData, originalOntologyData, formatType, handleNodeClick, graphMetrics]);
};

// Helper function to create grid
const createGrid = (container, width, height) => {
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
};

// Helper function to reset all styles
const resetAllStyles = (node, link, nodeLabel, linkLabel, getNodeOpacity) => {
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
};

// Helper function to apply node highlighting
const applyNodeHighlighting = (node, link, nodeLabel, linkLabel, links, nodeId, getNodeOpacity) => {
    // Highlight selected node
    node.filter(d => d.id === nodeId)
        .attr("fill", "#4a6fa5")
        .attr("r", 12)
        .attr("stroke", "#2c4870")
        .attr("stroke-width", 2);

    nodeLabel.filter(d => d.id === nodeId)
        .attr("font-weight", "bold")
        .attr("font-size", 14)
        .attr("fill", "#2c4870");

    // Find connected nodes
    const connectedNodeIds = new Set();
    links.forEach(l => {
        const sourceId = l.source.id || l.source;
        const targetId = l.target.id || l.target;
        if (sourceId === nodeId) connectedNodeIds.add(targetId);
        if (targetId === nodeId) connectedNodeIds.add(sourceId);
    });

    // Highlight connected links
    link.filter(l => (l.source.id === nodeId || l.source === nodeId) ||
        (l.target.id === nodeId || l.target === nodeId))
        .attr("stroke", "#4a6fa5")
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 1);

    // Highlight connected nodes
    node.filter(d => connectedNodeIds.has(d.id))
        .attr("fill", "#78a2d8")
        .attr("r", 10)
        .attr("stroke", "#4a6fa5")
        .attr("stroke-width", 1.5);

    nodeLabel.filter(d => connectedNodeIds.has(d.id))
        .attr("font-weight", "bold");

    // Highlight connected link labels
    linkLabel.filter(d => (d.source.id === nodeId || d.source === nodeId) ||
        (d.target.id === nodeId || d.target === nodeId))
        .attr("opacity", 1)
        .attr("font-weight", "bold");

    // Fade unconnected elements
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