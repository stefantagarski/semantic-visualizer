import { useMemo } from 'react';

{/* Custom hook to compute graph metrics such as relationship types and node degrees (statistics) */ }

export const useGraphMetrics = (graphData) => {
    return useMemo(() => {
        if (!graphData) {
            return {
                relationshipTypes: [],
                nodeDegrees: {},
                maxDegree: 1
            };
        }

        const types = new Set();
        const degrees = {};

        // Initialize all nodes with 0 degree
        graphData.nodes.forEach(node => {
            degrees[node.id] = 0;
        });

        // Count degrees and collect relationship types
        graphData.edges.forEach(edge => {
            const label = edge.label || edge.predicate;
            types.add(label);

            // Count degrees (number of connections per node)
            degrees[edge.subject] = (degrees[edge.subject] || 0) + 1;
            degrees[edge.object] = (degrees[edge.object] || 0) + 1;
        });

        // Calculate max degree for normalization
        const maxDegree = Math.max(...Object.values(degrees), 1);

        return {
            relationshipTypes: Array.from(types).sort(),
            nodeDegrees: degrees,
            maxDegree
        };
    }, [graphData]);
};