import React from 'react'; import { Network, MessageCircleQuestion } from 'lucide-react';

const LandingPage = ({ onGraphVisualizationClick, onVQAClick }) => { return ( <div className="landing-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px 20px' }}> <h1 style={{ fontSize: '2.5rem', fontWeight: '600', color: '#2c4870', marginBottom: '16px', textAlign: 'center' }}> Ontology Analysis Platform </h1> <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '48px', textAlign: 'center', maxWidth: '600px' }}> Choose your analysis method to get started with ontology data exploration </p>

        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            width: '100%',
            maxWidth: '800px'
        }}>
            {/* Graph Visualization Card */}
            <div
                onClick={onGraphVisualizationClick}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px 32px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent',
                    textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(74, 111, 165, 0.15)';
                    e.currentTarget.style.borderColor = '#4a6fa5';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'transparent';
                }}
            >
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(74, 111, 165, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <Network size={32} color="#4a6fa5" />
                </div>
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#2c4870',
                    marginBottom: '12px'
                }}>
                    Graph Visualization
                </h3>
                <p style={{
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    lineHeight: '1.6'
                }}>
                    Explore and visualize ontology structures through interactive graph representations
                </p>
            </div>

            {/* VQA Card */}
            <div
                onClick={onVQAClick}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px 32px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent',
                    textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(74, 111, 165, 0.15)';
                    e.currentTarget.style.borderColor = '#4a6fa5';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'transparent';
                }}
            >
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(74, 111, 165, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <MessageCircleQuestion size={32} color="#4a6fa5" />
                </div>
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#2c4870',
                    marginBottom: '12px'
                }}>
                    Visual Question Answering
                </h3>
                <p style={{
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    lineHeight: '1.6'
                }}>
                    Ask questions about your dataset and visualize answers with highlighted paths
                </p>
            </div>
        </div>
    </div>
);
};

export default LandingPage;
