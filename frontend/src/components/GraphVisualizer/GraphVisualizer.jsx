import React, { useEffect, useRef, useState } from 'react';
import ControlPanel from './control-panel/ControlPanel';
import NodeDetailsPanel from './node-details-panel/NodeDetailsPanel';
import ClickPathBar from './node-history/ClickPathBar';
import { useGraphMetrics, useGraphVisualization, useNodeSelection } from './hooks';


const GraphVisualizer = ({
                             graphData,
                             originalOntologyData,
                             formatType,
                             selectedNode: externalSelectedNode,
                             onNodeSelect
                         }) => {
    const svgRef = useRef();
    const d3Refs = useRef({});

    // State management
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeDetails, setNodeDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [fadeUnrelated, setFadeUnrelated] = useState(true);
    const [focusDepth, setFocusDepth] = useState(null);
    const [showImportanceIndicator, setShowImportanceIndicator] = useState(false);
    const [selectedRelationships, setSelectedRelationships] = useState(new Set());
    const [showControlPanel, setShowControlPanel] = useState(false);

    // Calculate graph metrics
    const graphMetrics = useGraphMetrics(graphData);

    const handleNodeClick = async (nodeId, nodeName, degreeOpacity) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/ontology/node-click?nodeId=${encodeURIComponent(nodeId)}&nodeName=${encodeURIComponent(nodeName)}&degreeOpacity=${degreeOpacity}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                console.error('Failed to record node click:', response.status);
            } else {
                console.log('Node click recorded:', nodeId, nodeName, degreeOpacity);
            }
        } catch (error) {
            console.error('Error recording node click:', error);
        }
    };

    // Initialize selected relationships
    useEffect(() => {
        if (graphMetrics.relationshipTypes.length > 0 && selectedRelationships.size === 0) {
            setSelectedRelationships(new Set(graphMetrics.relationshipTypes));
        }
    }, [graphMetrics.relationshipTypes]);

    // Main graph visualization
    useGraphVisualization({
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
    });

    // Handle external node selection
    useNodeSelection({
        externalSelectedNode,
        selectedNode,
        setSelectedNode,
        setNodeDetails,
        setIsLoadingDetails,
        originalOntologyData,
        formatType
    });

    // Handle highlighting and filtering
    useEffect(() => {
        if (!d3Refs.current.node || !graphData) return;

        const { node, link, nodeLabel, linkLabel, links } = d3Refs.current;

        // Apply relationship filtering
        link.style("display", d => selectedRelationships.has(d.label) ? null : "none");
        linkLabel.style("display", d => selectedRelationships.has(d.label) ? null : "none");

        // TODO: we will change this when we are going to implement weighted knowlegde graphs
        // Importance indicator based on node degree
        const getNodeOpacity = (nodeId) => {
            if (!showImportanceIndicator) return 1;

            const degree = graphMetrics.nodeDegrees[nodeId] || 0;
            const normalized = degree / graphMetrics.maxDegree;

            // Map to opacity range: 0.3 (low degree) to 1.0 (high degree)
            return 0.3 + (normalized * 0.7);
        };


        if (showImportanceIndicator && !selectedNode) {
            node.attr("fill-opacity", d => getNodeOpacity(d.id));
            nodeLabel.attr("opacity", d => getNodeOpacity(d.id));
        }

        if (!selectedNode) return;

        // Apply selection highlighting
        applySelectionHighlighting({
            node,
            link,
            nodeLabel,
            linkLabel,
            links,
            selectedNode,
            fadeUnrelated,
            focusDepth,
            graphMetrics,
            getNodeOpacity
        });

    }, [selectedNode, fadeUnrelated, focusDepth, showImportanceIndicator, selectedRelationships, graphMetrics, graphData]);

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
            <ControlPanel
                show={showControlPanel}
                onToggle={() => setShowControlPanel(!showControlPanel)}
                fadeUnrelated={fadeUnrelated}
                onFadeUnrelatedChange={setFadeUnrelated}
                showImportanceIndicator={showImportanceIndicator}
                onShowImportanceChange={setShowImportanceIndicator}
                focusDepth={focusDepth}
                onFocusDepthChange={setFocusDepth}
                selectedNode={selectedNode}
                relationshipTypes={graphMetrics.relationshipTypes}
                selectedRelationships={selectedRelationships}
                onToggleRelationship={toggleRelationship}
                onToggleAllRelationships={toggleAllRelationships}
            />

            <svg ref={svgRef} width="100%" height="100%" />

            {selectedNode && (
                <NodeDetailsPanel
                    selectedNode={selectedNode}
                    nodeDetails={nodeDetails}
                    isLoading={isLoadingDetails}
                    showImportanceIndicator={showImportanceIndicator}
                    graphMetrics={graphMetrics}
                    onClose={() => {
                        setSelectedNode(null);
                        setNodeDetails(null);
                    }}
                />
            )}

            <ClickPathBar
                onNodeSelect={(nodeId) => {
                    setSelectedNode(nodeId);
                }}
            />

        </div>
    );
};

// Helper function for selection highlighting
const applySelectionHighlighting = ({
                                        node, link, nodeLabel, linkLabel, links,
                                        selectedNode, fadeUnrelated, focusDepth, graphMetrics, getNodeOpacity
                                    }) => {
    // Reset all elements
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

    // Highlight selected node
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

    // Find connected nodes
    const connectedNodeIds = new Set();
    links.forEach(l => {
        const sourceId = l.source.id || l.source;
        const targetId = l.target.id || l.target;
        if (sourceId === selectedNode) connectedNodeIds.add(targetId);
        if (targetId === selectedNode) connectedNodeIds.add(sourceId);
    });

    // Get focused nodes if focus mode enabled
    const focusedNodes = focusDepth !== null
        ? getNodesWithinDepth(selectedNode, focusDepth, links)
        : null;

    // Highlight connected elements
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

    // Apply fading
    if (fadeUnrelated || focusedNodes !== null) {
        let nodesToFade;
        if (focusedNodes !== null) {
            nodesToFade = d => d.id !== selectedNode && !focusedNodes.has(d.id);
        } else if (fadeUnrelated) {
            nodesToFade = d => d.id !== selectedNode && !connectedNodeIds.has(d.id);
        }

        node.filter(nodesToFade).attr("fill-opacity", 0.15);
        nodeLabel.filter(nodesToFade).attr("opacity", 0.15);

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

        link.filter(linkShouldBeFaded).attr("stroke-opacity", 0.1);
        linkLabel.filter(linkShouldBeFaded).attr("opacity", 0.1);
    }
};

// BFS to find all nodes within N hops from the selected node
const getNodesWithinDepth = (startNodeId, depth, links) => {
    if (depth === null) return null;

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

export default GraphVisualizer;