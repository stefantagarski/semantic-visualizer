import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

{/* For now it searches based on keywords, not using semantic search */}

const SearchBar = ({ graphData, onNodeSelect, selectedNode }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredNodes, setFilteredNodes] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const searchRef = useRef();
    const dropdownRef = useRef();
    const containerRef = useRef();

    // Calculate dropdown position
    const updateDropdownPosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        if (showDropdown) {
            updateDropdownPosition();
            // Update position on scroll or resize
            const handleUpdate = () => updateDropdownPosition();
            window.addEventListener('scroll', handleUpdate);
            window.addEventListener('resize', handleUpdate);
            return () => {
                window.removeEventListener('scroll', handleUpdate);
                window.removeEventListener('resize', handleUpdate);
            };
        }
    }, [showDropdown]);

    useEffect(() => {
        if (!graphData || !searchTerm.trim()) {
            setFilteredNodes([]);
            setShowDropdown(false);
            return;
        }

        const filtered = graphData.nodes
            .filter(node =>
                node.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 10) // Limit to 10 results
            .sort((a, b) => {
                // Prioritize exact matches and shorter labels
                const aExact = a.label.toLowerCase() === searchTerm.toLowerCase();
                const bExact = b.label.toLowerCase() === searchTerm.toLowerCase();
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                return a.label.length - b.label.length;
            });

        setFilteredNodes(filtered);
        setShowDropdown(filtered.length > 0);
        setHighlightedIndex(-1);
    }, [searchTerm, graphData]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleNodeClick = (node) => {
        onNodeSelect(node.id);
        setSearchTerm(node.label);
        setShowDropdown(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || filteredNodes.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredNodes.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredNodes.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredNodes.length) {
                    handleNodeClick(filteredNodes[highlightedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setHighlightedIndex(-1);
                searchRef.current?.blur();
                break;
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setShowDropdown(false);
        onNodeSelect(null);
        searchRef.current?.focus();
    };

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                containerRef.current && !containerRef.current.contains(event.target)) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '400px'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '10px',
                    border: '1px solid rgba(220, 220, 220, 0.8)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(5px)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '12px 16px',
                        color: '#666',
                        fontSize: '16px'
                    }}>
                        🔍
                    </div>
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search nodes by label..."
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (searchTerm && filteredNodes.length > 0) {
                                setShowDropdown(true);
                                updateDropdownPosition();
                            }
                        }}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            padding: '12px 0',
                            fontSize: '14px',
                            background: 'transparent',
                            color: '#333',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            style={{
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#888',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {showDropdown && filteredNodes.length > 0 && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid rgba(220, 220, 220, 0.8)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        zIndex: 99999
                    }}
                >
                    {filteredNodes.map((node, index) => (
                        <div
                            key={node.id}
                            onClick={() => handleNodeClick(node)}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: index < filteredNodes.length - 1 ? '1px solid rgba(220, 220, 220, 0.5)' : 'none',
                                backgroundColor: index === highlightedIndex ? '#f0f4ff' : 'transparent',
                                transition: 'background-color 0.15s ease',
                                fontSize: '14px',
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                            }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <div style={{
                                fontWeight: '500',
                                color: selectedNode === node.id ? '#4a6fa5' : '#333',
                                marginBottom: '2px'
                            }}>
                                {highlightSearchTerm(node.label, searchTerm)}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#666',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {node.id}
                            </div>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

// Helper function to highlight search term in results
const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <mark key={index} style={{
                backgroundColor: '#fff3cd',
                padding: '0 2px',
                borderRadius: '2px',
                fontWeight: '600'
            }}>
                {part}
            </mark>
        ) : part
    );
};

export default SearchBar;