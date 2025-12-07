import { useMemo } from 'react';

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

        // Use links OR edges (VQA uses 'links', main graph uses 'edges')
        const edges = graphData.edges || graphData.links || [];

        // Count degrees and collect relationship types
        edges.forEach(edge => {
            const label = edge.label || edge.predicate;
            types.add(label);

            // Handle different edge formats
            const source = edge.subject || edge.source;
            const target = edge.object || edge.target;

            // Count degrees (number of connections per node)
            if (source) {
                degrees[source] = (degrees[source] || 0) + 1;
            }
            if (target) {
                degrees[target] = (degrees[target] || 0) + 1;
            }
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
