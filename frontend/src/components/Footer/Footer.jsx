import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons
import './Footer.css';

const Footer = ({ nodeCount, edgeCount }) => {
    return (
        <footer className="app-footer">
            <div className="footer-title">Semantic Visualizer - Ontology Graph Explorer
                <a
                    href="https://github.com/stefantagarski/semantic-visualizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link">
                    <i className="bi bi-github" style={{ fontSize: '20px', marginRight: '8px' }}></i>
                </a>
            </div>

            <div className="footer-stats">
                <span className="stat-item">Nodes: {nodeCount}</span>
                <span className="stat-item">Relationships: {edgeCount}</span>
            </div>
        </footer>
    );
};

export default Footer;