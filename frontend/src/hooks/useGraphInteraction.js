import { useState, useCallback } from 'react';

export const useGraphInteraction = () => {
    const [userPath, setUserPath] = useState([]);

    const handleNodeClick = useCallback((node) => {
        if (!node) return;

        const nodeId = typeof node === "string"
            ? node                      // already URI
            : node.id || node.uri || node.label;

        setUserPath(prev => [...prev, nodeId]);

        console.log("Node added to VQA path:", nodeId);
    }, []);

    const removeLastNode = useCallback(() => {
        setUserPath(prev => prev.slice(0, -1));
    }, []);

    const resetPath = useCallback(() => {
        setUserPath([]);
        console.log('🔄 VQA path reset');
    }, []);

    const isNodeInPath = useCallback((nodeId) => {
        return userPath.includes(nodeId);
    }, [userPath]);

    const removeNodeAtIndex = (index) => {
        setUserPath(prev => prev.filter((_, i) => i !== index));
    };

    return {
        userPath,
        handleNodeClick,
        removeLastNode,
        resetPath,
        isNodeInPath,
        removeNodeAtIndex
    };
};