// src/components/GraphVisualizer/node-history/ClickPathBar.jsx
import React, { useState, useEffect } from 'react';
import './ClickPathBar.css';

const ClickPathBar = ({ onNodeSelect }) => {
    const [clickPath, setClickPath] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClickPath();

        // Poll for updates every 2 seconds
        const interval = setInterval(fetchClickPath, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchClickPath = async () => {
        try {
            setError(null);
            const response = await fetch('http://localhost:8080/api/ontology/click-history');
            if (!response.ok) {
                throw new Error(`Failed to fetch path: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched click path:', data); // Debug log
            setClickPath(data);
        } catch (err) {
            console.error('Error fetching click path:', err);
            setError(err.message);
        }
    };

    // Calculate opacity based on position in sequence
    // First clicked = lowest opacity (0.3), last clicked = highest opacity (1.0)
    const calculatePositionOpacity = (index, totalNodes) => {
        if (totalNodes === 1) return 1.0;

        // index 0 = first clicked (oldest) = 0.3 opacity
        // index (totalNodes-1) = last clicked (newest) = 1.0 opacity
        const normalizedPosition = index / (totalNodes - 1);
        return 0.3 + (normalizedPosition * 0.7);
    };

    // Get node size based on weight
    const getNodeSize = (weight) => {
        const baseSize = 28;
        const maxExtraSize = 16;
        return baseSize + (weight * maxExtraSize);
    };

    const handleNodeClick = (nodeId) => {
        console.log('Node clicked from path:', nodeId); // Debug log
        onNodeSelect(nodeId);
    };

    if (isMinimized) {
        return (
            <div className="click-path-bar minimized">
                <button
                    className="expand-btn"
                    onClick={() => setIsMinimized(false)}
                    title="Expand navigation path"
                >
                    Path ({clickPath.length})
                </button>
            </div>
        );
    }

    return (
        <div className="click-path-bar">
            <div className="path-bar-header">
                <div className="header-left">
                    <span className="path-icon">️</span>
                    <span className="path-title">Navigation Path</span>
                    {clickPath.length > 0 && (
                        <span className="path-count">{clickPath.length}</span>
                    )}
                </div>
                <div className="path-bar-actions">
                    <button
                        className="minimize-btn"
                        onClick={() => setIsMinimized(true)}
                        title="Minimize"
                    >
                        −
                    </button>
                </div>
            </div>

            {error && (
                <div className="path-error">
                    ⚠️ {error}
                </div>
            )}

            <div className="path-container">
                {clickPath.length === 0 ? (
                    <div className="empty-path">
                        <span className="empty-icon"></span>
                        <span>Start exploring nodes</span>
                    </div>
                ) : (
                    <div className="path-nodes">
                        {clickPath.map((node, index) => {
                            // Position opacity: first = 0.3, last = 1.0
                            const positionOpacity = calculatePositionOpacity(index, clickPath.length);

                            // Weight already comes from backend [0.1 - 1.0]
                            const weight = node.weight || 0.5;

                            // Final opacity combines position and weight
                            // But ensure it's still visible (min 0.4)
                            const finalOpacity = Math.max(0.4, positionOpacity * weight);

                            const nodeSize = getNodeSize(weight);

                            return (
                                <React.Fragment key={`${node.nodeId}-${index}`}>
                                    <div
                                        className="path-node"
                                        onClick={() => handleNodeClick(node.nodeId)}
                                        style={{
                                            width: `${nodeSize}px`,
                                            height: `${nodeSize}px`,
                                            opacity: finalOpacity,
                                            backgroundColor: `rgba(74, 111, 165, ${finalOpacity})`,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        title={`${node.nodeName} (Weight: ${weight.toFixed(2)})`}
                                    >
                                        <div className="node-content">
                                            <span className="node-order">{index + 1}</span>
                                        </div>

                                        <div className="node-tooltip">
                                            <div className="tooltip-name">{node.nodeName}</div>
                                            <div className="tooltip-stats">
                                                <span>Position: #{index + 1}</span>
                                                <span>Clicks: {node.clickCount}</span>
                                                <span>Weight: {weight.toFixed(2)}</span>
                                                <span>Aging: {(node.agingFactor || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="tooltip-time">
                                                {new Date(node.clickedAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>

                                    {index < clickPath.length - 1 && (
                                        <div
                                            className="path-connector"
                                            style={{
                                                opacity: (positionOpacity + calculatePositionOpacity(index + 1, clickPath.length)) / 2,
                                                backgroundColor: `rgba(74, 111, 165, 0.5)`
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
            </div>

            {clickPath.length > 0 && (
                <div className="path-stats">
                    <span className="stat-item">
                        <span className="stat-label">Nodes:</span>
                        <span className="stat-value">{clickPath.length}</span>
                    </span>
                    <span className="stat-divider">|</span>
                    <span className="stat-item">
                        <span className="stat-label">Total Clicks:</span>
                        <span className="stat-value">
                            {clickPath.reduce((sum, n) => sum + (n.clickCount || 1), 0)}
                        </span>
                    </span>
                    <span className="stat-divider">|</span>
                    <span className="stat-item">
                        <span className="stat-label">Avg Weight:</span>
                        <span className="stat-value">
                            {(clickPath.reduce((sum, n) => sum + (n.weight || 0.5), 0) / clickPath.length).toFixed(2)}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
};

export default ClickPathBar;