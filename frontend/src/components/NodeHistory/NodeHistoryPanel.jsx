import React, {useEffect, useState} from 'react';
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
            fetchHistory();
            fetchStatistics();
        }
    }, [isVisible]);

    // Fetch data when refresh is triggered from parent (node click)
    useEffect(() => {
        if (refreshTrigger > 0 && isVisible) {
            fetchHistory();
            fetchStatistics();
        }
    }, [refreshTrigger, isVisible]);

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

    // useEffect(() => {
    //     if (!isVisible) return;
    //     // triggers on panel open and any refreshTrigger change
    //     fetchData();
    // }, [isVisible, refreshTrigger, fetchData]);

    const getWeightColor = (weight, agingFactor) => {
        // Use hue transition: red (0) -> orange (30) -> yellow (60) -> green (120)
        // Fresh nodes are green, old nodes are red
        const hue = agingFactor * 120; // 0 (red) to 120 (green)
        const saturation = 50 + (weight * 30);
        const lightness = 85 - (weight * 25);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const getBorderColor = (agingFactor) => {
        if (agingFactor > 0.8) return '#10b981'; // green
        if (agingFactor > 0.5) return '#f59e0b'; // amber
        if (agingFactor > 0.2) return '#f97316'; // orange
        return '#ef4444'; // red
    };

    const getAgingIndicator = (agingFactor) => {
        if (agingFactor > 0.8) return { color: '#22c55e', label: 'Fresh' };
        if (agingFactor > 0.5) return { color: '#eab308', label: 'Recent' };
        if (agingFactor > 0.2) return { color: '#f97316', label: 'Aging' };
        return { color: '#ef4444', label: 'Old' };
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
                        <div className="stat-value">{statistics.uniqueNodes}</div>
                        <div className="stat-label">Unique Nodes</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{statistics.totalClicks}</div>
                        <div className="stat-label">Total Clicks</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{(statistics.averageWeight ?? 0).toFixed(3)}</div>
                        <div className="stat-label">Avg Weight</div>
                    </div>
                </div>
            )}

            <div className="history-actions">
                <button
                    className="refresh-btn"
                    onClick={() => { fetchHistory(); fetchStatistics(); }}
                    disabled={loading}
                >
                    Refresh
                </button>
                <button
                    className="clear-btn"
                    onClick={clearHistory}
                    disabled={history.length === 0}
                >
                    Clear History
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
                        history.map((node, index) => {
                            const agingInfo = getAgingIndicator(node.agingFactor);
                            return (
                                <div
                                    key={`${node.nodeId}-${index}`}
                                    className="history-item"
                                    style={{
                                        backgroundColor: getWeightColor(node.weight, node.agingFactor),
                                        borderLeft: `4px solid ${getBorderColor(node.agingFactor)}`
                                    }}
                                    onClick={() => onNodeClick(node.nodeId)}
                                    title={`Click to select ${node.nodeName}`}
                                >
                                    <div className="item-header">
                                        <div className="node-info">
                                            <span className="node-name">{node.nodeName}</span>
                                            <span className="click-order">#{node.clickOrder}</span>
                                        </div>
                                        <div className="aging-badge" style={{
                                            backgroundColor: `${agingInfo.color}20`,
                                            color: agingInfo.color,
                                            border: `1px solid ${agingInfo.color}40`
                                        }}>
                                            <span className="aging-dot" style={{ color: agingInfo.color }}>
                                                {agingInfo.emoji}
                                            </span>
                                            <span className="aging-label">{agingInfo.label}</span>
                                        </div>
                                    </div>

                                    <div className="item-metrics">
                                        <div className="metric-group">
                                            <div className="metric">
                                                <span className="metric-label">Weight</span>
                                                <span className="metric-value">{node.weight.toFixed(3)}</span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-label">Clicks</span>
                                                <span className="metric-value">{node.clickCount}</span>
                                            </div>
                                        </div>
                                        <div className="metric-group">
                                            <div className="metric">
                                                <span className="metric-label">Aging</span>
                                                <span className="metric-value">{node.agingFactor.toFixed(2)}</span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-label">Opacity</span>
                                                <span className="metric-value">{node.degreeOpacity.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="item-footer">
                                        <span className="timestamp">
                                            {formatTimeDifference(node.clickedAt)}
                                        </span>
                                        {node.changeType && (
                                            <span className="change-badge">{node.changeType}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default NodeHistoryPanel;
