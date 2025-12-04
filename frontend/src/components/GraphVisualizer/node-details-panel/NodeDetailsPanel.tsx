import React from 'react';

{/* Controls and settings panel for graph visualization interface. */}

const NodeDetailsPanel = ({
                              selectedNode,
                              nodeDetails,
                              isLoading,
                              showImportanceIndicator,
                              graphMetrics,
                              onClose
                          }) => {
    const getNodeOpacity = (nodeId) => {
        if (!showImportanceIndicator) return 1;
        const degree = graphMetrics.nodeDegrees[nodeId] || 0;
        const normalized = degree / graphMetrics.maxDegree;
        return 0.3 + (normalized * 0.7);
    };

    return (
        <div style={{
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
            <PanelHeader onClose={onClose} />

            {isLoading ? (
                <LoadingState />
            ) : (
                <>
                    <InfoCard
                        title="IDENTIFIER"
                        borderColor="#4a6fa5"
                        backgroundColor="#f7f9fc"               >
                        {nodeDetails?.label || selectedNode.split('#').pop()}
                    </InfoCard>

                    {showImportanceIndicator && (
                        <InfoCard
                            title="NODE IMPORTANCE"
                            borderColor="#ffc107"
                            backgroundColor="#fff3cd"                       >
                            {graphMetrics.nodeDegrees[selectedNode] || 0} connections
                            <span style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>
                                ({Math.round(getNodeOpacity(selectedNode) * 100)}% opacity)
                            </span>
                        </InfoCard>
                    )}

                    <InfoCard
                        title="FULL URI"
                        borderColor="#4a6fa5"
                        backgroundColor="#f7f9fc"                 >
                        <div style={{ fontSize: '14px', wordBreak: 'break-all' }}>
                            {selectedNode}
                        </div>
                    </InfoCard>

                    {nodeDetails?.incomingConnections?.length > 0 && (
                        <ConnectionsList
                            title="INCOMING CONNECTIONS"
                            connections={nodeDetails.incomingConnections}
                            borderColor="#6b8e23"
                            keyPrefix="in"
                        />
                    )}

                    {nodeDetails?.outgoingConnections?.length > 0 && (
                        <ConnectionsList
                            title="OUTGOING CONNECTIONS"
                            connections={nodeDetails.outgoingConnections}
                            borderColor="#cd5c5c"
                            keyPrefix="out"
                        />
                    )}
                </>
            )}
        </div>
    );
};

const PanelHeader = ({ onClose }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Node Details
        </h3>
        <button
            onClick={onClose}
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
);

const LoadingState = () => (
    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Loading node details...
    </div>
);

const InfoCard = ({ title, borderColor, backgroundColor, children }) => (
    <div style={{
        padding: '12px',
        backgroundColor,
        borderRadius: '6px',
        marginBottom: '16px',
        borderLeft: `4px solid ${borderColor}`
    }}>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            {title}
        </div>
        <div style={{ fontWeight: '500', wordBreak: 'break-all' }}>
            {children}
        </div>
    </div>
);

const ConnectionsList = ({ title, connections, borderColor, keyPrefix }) => (
    <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f7f9fc',
        borderRadius: '6px',
        borderLeft: `4px solid ${borderColor}`
    }}>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
            {title}
        </div>
        <ul style={{ margin: '0', padding: '0 0 0 16px' }}>
            {connections.map((conn, idx) => (
                <li key={`${keyPrefix}-${idx}`} style={{ marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ fontWeight: '500' }}>{conn.nodeLabel}</span>
                    <span style={{ color: '#666' }}> via </span>
                    <span style={{ fontStyle: 'italic', color: '#4a6fa5' }}>
                        {conn.relationshipType}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

export default NodeDetailsPanel;