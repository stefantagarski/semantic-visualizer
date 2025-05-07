import React from 'react';
import './InteractionGuide.css';

const InteractionGuide = () => {
    const guideItems = [
        { icon: '👆', text: 'Click a node to highlight connections' },
        { icon: '🔄', text: 'Click empty space to clear selection' },
        { icon: '✋', text: 'Drag nodes to reposition them' },
        { icon: '🖱️', text: 'Use mouse wheel to zoom in/out' },
        { icon: '👁️', text: 'Drag canvas to pan the view' }
    ];

    return (
        <div className="interaction-guide">
            <div className="guide-header">
                <span className="guide-icon">ℹ️</span> Interaction Guide
            </div>
            <ul className="guide-list">
                {guideItems.map((item, index) => (
                    <li key={index} className="guide-item">
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-text">{item.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InteractionGuide;