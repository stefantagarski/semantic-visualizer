import React, { useEffect, useState } from 'react';
import OntologyService from '../../services/OntologyService';
import './NodeHistoryPanel.css';

const NodeHistoryPanel = ({ onNodeClick, isVisible, onToggleVisibility, refreshTrigger }) => {
    const [history, setHistory] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch data when panel becomes visible
    useEffect(() => {
        if (isVisible) {
            fetchData();
        }
    }, [isVisible]);

    // Fetch data when refresh is triggered from parent (node click)
    useEffect(() => {
        if (refreshTrigger > 0 && isVisible) {
            fetchData();
        }
    }, [refreshTrigger, isVisible]);

    const fetchData = async () => {
        await Promise.all([fetchHistory(), fetchStatistics()]);
    };

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await OntologyService.getClickHistory();
            setHistory(data);
        } catch (err) {
            setError('Error fetching history');
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const data = await OntologyService.getClickStatistics();
            setStatistics(data);
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }
    };

    const clearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear the history?')) {
            return;
        }

        try {
            await OntologyService.clearClickHistory();
            setHistory([]);
            fetchStatistics();
        } catch (err) {
            setError('Error clearing history');
            console.error('Error clearing history:', err);
        }
    };

    const getWeightColor = (weight) => {
        const hue = 210;
        const saturation = 70;
        const lightness = 85 - (weight * 50);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const getAgingIndicator = (agingFactor) => {
        if (agingFactor > 0.8) return '🟢';
        if (agingFactor > 0.5) return '🟡';
        if (agingFactor > 0.2) return '🟠';
        return '🔴';
    };

    const formatTimeDifference = (timestamp) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="node-history-panel">
            <div className="history-header">
                <h3>Node History</h3>
                <button
                    className="close-btn"
                    onClick={onToggleVisibility}
                    title="Hide History"
                >
                    ✕
                </button>
            </div>

            {statistics && (
                <div className="statistics-section">
                    <div className="stat-card">
                        <div className="stat-label">Unique Nodes</div>
                        <div className="stat-value">{statistics.uniqueNodes}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Clicks</div>
                        <div className="stat-value">{statistics.totalClicks}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Avg Weight</div>
                        <div className="stat-value">{statistics.averageWeight.toFixed(3)}</div>
                    </div>
                </div>
            )}

            <div className="history-actions">
                <button
                    className="refresh-btn"
                    onClick={fetchData}
                    disabled={loading}
                >
                    🔄 Refresh
                </button>
                <button
                    className="clear-btn"
                    onClick={clearHistory}
                    disabled={history.length === 0}
                >
                    🗑️ Clear History
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading && history.length === 0 ? (
                <div className="loading">Loading history...</div>
            ) : (
                <div className="history-list">
                    {history.length === 0 ? (
                        <div className="empty-state">
                            <p>No nodes visited yet</p>
                            <small>Click on nodes in the graph to build your history</small>
                        </div>
                    ) : (
                        history.map((node, index) => (
                            <div
                                key={`${node.nodeId}-${index}`}
                                className="history-item"
                                style={{
                                    backgroundColor: getWeightColor(node.weight),
                                    borderLeft: `4px solid ${node.weight > 0.7 ? '#2c5aa0' : '#78a2d8'}`
                                }}
                                onClick={() => onNodeClick(node.nodeId)}
                                title={`Click to select this node`}
                            >
                                <div className="item-header">
                                    <span className="aging-indicator" title={`Aging Factor: ${node.agingFactor.toFixed(2)}`}>
                                        {getAgingIndicator(node.agingFactor)}
                                    </span>
                                    <span className="node-name">{node.nodeName}</span>
                                    <span className="click-order">#{node.clickOrder}</span>
                                </div>

                                <div className="item-stats">
                                    <span className="stat" title="Weight">
                                        ⚖️ {node.weight.toFixed(3)}
                                    </span>
                                    <span className="stat" title="Click Count">
                                        👆 {node.clickCount}
                                    </span>
                                    <span className="stat" title="Degree Opacity">
                                        🎯 {node.degreeOpacity.toFixed(2)}
                                    </span>
                                </div>

                                <div className="item-footer">
                                    <span className="timestamp">
                                        {formatTimeDifference(node.clickedAt)}
                                    </span>
                                    {node.changeType && (
                                        <span className="change-type">{node.changeType}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NodeHistoryPanel;
