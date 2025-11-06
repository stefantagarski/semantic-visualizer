import * as React from 'react';
{/* Controls and settings panel for graph visualization interface. */}

const ControlPanel = ({
                          show,
                          onToggle,
                          fadeUnrelated,
                          onFadeUnrelatedChange,
                          showImportanceIndicator,
                          onShowImportanceChange,
                          focusDepth,
                          onFocusDepthChange,
                          selectedNode,
                          relationshipTypes,
                          selectedRelationships,
                          onToggleRelationship,
                          onToggleAllRelationships,
                          showHistoryPanel,
                          onToggleHistoryPanel
                      }) => {
    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
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
                    transform: show ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease-in-out',
                    fontSize: '14px',
                }}>
                    ▼
                </span>
            </button>

            {/* Panel Content */}
            {show && (
                <div style={{
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
                    <PanelHeader onClose={onToggle} />

                    <CheckboxOption
                        label="Fade Unrelated Nodes"
                        checked={fadeUnrelated}
                        onChange={onFadeUnrelatedChange}
                    />

                    <CheckboxOption
                        label="Show Node Importance"
                        checked={showImportanceIndicator}
                        onChange={onShowImportanceChange}
                    />

                    <CheckboxOption
                        label="📊 Show Node History"
                        checked={showHistoryPanel}
                        onChange={onToggleHistoryPanel}
                    />

                    <FocusModeSelector
                        focusDepth={focusDepth}
                        onFocusDepthChange={onFocusDepthChange}
                        selectedNode={selectedNode}
                    />

                    <RelationshipFilter
                        relationshipTypes={relationshipTypes}
                        selectedRelationships={selectedRelationships}
                        onToggleRelationship={onToggleRelationship}
                        onToggleAllRelationships={onToggleAllRelationships}
                    />
                </div>
            )}
        </>
    );
};

const PanelHeader = ({ onClose }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
    }}>
        <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            Settings
        </h4>
        <button
            onClick={onClose}
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
);

const CheckboxOption = ({ label, checked, onChange }) => (
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
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            style={{ marginRight: '8px', cursor: 'pointer' }}
        />
        {label}
    </label>
);

const FocusModeSelector = ({ focusDepth, onFocusDepthChange, selectedNode }) => (
    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
        <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>
            Focus Mode
        </label>
        <select
            value={focusDepth === null ? 'off' : focusDepth}
            onChange={(e) => {
                const val = e.target.value;
                onFocusDepthChange(val === 'off' ? null : parseInt(val));
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
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                Select a node to enable
            </div>
        )}
    </div>
);

const RelationshipFilter = ({
                                relationshipTypes,
                                selectedRelationships,
                                onToggleRelationship,
                                onToggleAllRelationships
                            }) => (
    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
        }}>
            <label style={{ fontSize: '13px', color: '#555' }}>
                Relationship Types
            </label>
            <button
                onClick={onToggleAllRelationships}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#4a6fa5',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                }}
            >
                {selectedRelationships.size === relationshipTypes.length ? 'None' : 'All'}
            </button>
        </div>
        <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px' }}>
            {relationshipTypes.map(relType => (
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
                        onChange={() => onToggleRelationship(relType)}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
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
);

export default ControlPanel;
