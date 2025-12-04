import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ControlPanel from './control-panel/ControlPanel';
import NodeDetailsPanel from './node-details-panel/NodeDetailsPanel';
import NodeHistoryPanel from '../NodeHistory/NodeHistoryPanel';
import OntologyService from '../../services/OntologyService';
import { useGraphMetrics, useGraphVisualization, useNodeSelection } from './hooks';

const GraphVisualizer = React.forwardRef(({
                             graphData,
                             originalOntologyData,
                             formatType,
                             selectedNode: externalSelectedNode,
                             onNodeSelect,
                             hideControls = false,
                         },
                                          ref) => {
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
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

    // Calculate graph metrics
    const graphMetrics = useGraphMetrics(graphData);

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
        graphMetrics
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

    useEffect(() => {
        const clearHistoryOnGraphChange = async () => {
            try {
                await OntologyService.clearClickHistory();

                // Reset all graph-related state
                setSelectedNode(null);
                setNodeDetails(null);
                setShowHistoryPanel(false);
                setHistoryRefreshTrigger(0);
            } catch (error) {
                console.error('Error clearing history on graph change:', error);
            }
        };
        // Clear history when graphData changes (new graph loaded)
        if (graphData && graphData.nodes && graphData.nodes.length > 0) {
            clearHistoryOnGraphChange();
        }
    }, [graphData?.nodes?.length, formatType]); // Track graph changes

    // Record node clicks to history and trigger auto-refresh
    useEffect(() => {
        if (selectedNode && graphMetrics.nodeDegrees && graphData) {
            const recordClick = async () => {
                try {
                    const degree = graphMetrics.nodeDegrees[selectedNode] || 0;
                    const maxDegree = graphMetrics.maxDegree || 1;
                    const degreeOpacity = degree / maxDegree;

                    const node = graphData.nodes.find(n => n.id === selectedNode);
                    const nodeLabel = node?.label || selectedNode;

                    await OntologyService.recordNodeClick(
                        selectedNode,
                        nodeLabel,
                        parseFloat(degreeOpacity.toFixed(2))
                    );

                    console.log('✅ Node click recorded:', selectedNode, nodeLabel);

                    // Trigger history panel refresh
                    setHistoryRefreshTrigger(prev => prev + 1);

                } catch (error) {
                    console.error('❌ Error recording node click:', error);
                }
            };

            recordClick();
        }
    }, [selectedNode, graphMetrics, graphData]);

    // Handle highlighting and filtering
    useEffect(() => {
        if (!d3Refs.current.node || !graphData) return;

        const { node, link, nodeLabel, linkLabel, links } = d3Refs.current;

        link.style("display", d => selectedRelationships.has(d.label) ? null : "none");
        linkLabel.style("display", d => selectedRelationships.has(d.label) ? null : "none");

        const getNodeOpacity = (nodeId) => {
            if (!showImportanceIndicator) return 1;
            const degree = graphMetrics.nodeDegrees[nodeId] || 0;
            const normalized = degree / graphMetrics.maxDegree;
            return 0.3 + (normalized * 0.7);
        };

        if (showImportanceIndicator && !selectedNode) {
            node.attr("fill-opacity", d => getNodeOpacity(d.id));
            nodeLabel.attr("opacity", d => getNodeOpacity(d.id));
        }

        if (!selectedNode) return;

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

    const handleHistoryNodeClick = (nodeId) => {
        // Find the node in the graph
        const nodeData = graphData.nodes.find(n => n.id === nodeId);
        if (!nodeData) {
            console.error('Node not found in graph:', nodeId);
            return;
        }

        // Set the selected node (this triggers the useEffect in useNodeSelection hook)
        setSelectedNode(nodeId);

        // Fetch node details
        if (originalOntologyData) {
            setIsLoadingDetails(true);
            OntologyService.getNodeDetails(nodeId, originalOntologyData, formatType)
                .then(details => {
                    setNodeDetails(details);
                    setIsLoadingDetails(false);
                })
                .catch (error => {
                    console.error("Error fetching node details:", error);
                    setIsLoadingDetails(false);
                });
        }

        // Call external handler
        if (onNodeSelect) {
            onNodeSelect(nodeId);
        }
    };

    React.useImperativeHandle(ref, () => ({
        focusNode: (nodeId) => {
            const { simulation, svg, zoom } = d3Refs.current;
            if (!simulation) return;

            // stop simulation from moving nodes further
            simulation.alphaTarget(0);
            simulation.stop();

            // find the node in simulation
            const target = simulation.nodes().find(n => n.id === nodeId);
            if (!target) return;

            const width = window.innerWidth;
            const height = window.innerHeight;
            const scale = 1.2; // zoom in more for clarity

            // build transform that centers the node
            const transform = d3.zoomIdentity
                .translate(width / 2 - target.x * scale, height / 2 - target.y * scale)
                .scale(scale);

            // apply smooth zoom transition
            svg.transition()
                .duration(900)
                .ease(d3.easeCubicOut)
                .call(zoom.transform, transform);
        },
        resetView: () => {
            const { svg, zoom } = d3Refs.current;
            if (!svg || !zoom) return;

            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity
            );
        },

        clearHighlights: () => {
            const { node, link } = d3Refs.current;
            if (!node || !link) return;

            node.classed('highlighted', false);
            link.classed('highlighted', false);
        },

        deselectNode: () => {
            const { node, simulation } = d3Refs.current;
            if (!node || !simulation) return;

            // Clear CSS class
            node.classed('selected', false);

            // Clear the selected property from all node data
            simulation.nodes().forEach(n => {
                n.selected = false;
            });

            setSelectedNode(null);
            setNodeDetails(null);
        }

    }));


    return (
        <div className="graph-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
            {!hideControls && (
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
                    showHistoryPanel={showHistoryPanel}
                    onToggleHistoryPanel={() => setShowHistoryPanel(!showHistoryPanel)}
                />
            )}

            <NodeHistoryPanel
                isVisible={showHistoryPanel}
                onToggleVisibility={() => setShowHistoryPanel(!showHistoryPanel)}
                onNodeClick={handleHistoryNodeClick}
                refreshTrigger={historyRefreshTrigger}
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
        </div>
    );
});

// Helper function for selection highlighting
const applySelectionHighlighting = ({
                                        node, link, nodeLabel, linkLabel, links,
                                        selectedNode, fadeUnrelated, focusDepth, getNodeOpacity
                                    }) => {
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

    const connectedNodeIds = new Set();
    links.forEach(l => {
        const sourceId = l.source.id || l.source;
        const targetId = l.target.id || l.target;
        if (sourceId === selectedNode) connectedNodeIds.add(targetId);
        if (targetId === selectedNode) connectedNodeIds.add(sourceId);
    });

    const focusedNodes = focusDepth !== null
        ? getNodesWithinDepth(selectedNode, focusDepth, links)
        : null;

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
