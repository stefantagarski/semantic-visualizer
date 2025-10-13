import { useEffect } from 'react';
import OntologyService from "../../../services/OntologyService";

{/* Custom hook to manage node selection and fetch node details */ }

export const useNodeSelection = ({
                                     externalSelectedNode,
                                     selectedNode,
                                     setSelectedNode,
                                     setNodeDetails,
                                     setIsLoadingDetails,
                                     originalOntologyData,
                                     formatType
                                 }) => {
    useEffect(() => {
        if (externalSelectedNode !== selectedNode) {
            setSelectedNode(externalSelectedNode);
            if (externalSelectedNode && originalOntologyData) {
                setIsLoadingDetails(true);
                OntologyService.getNodeDetails(externalSelectedNode, originalOntologyData, formatType)
                    .then(details => {
                        setNodeDetails(details);
                        setIsLoadingDetails(false);
                    })
                    .catch(error => {
                        console.error("Error fetching node details:", error);
                        setIsLoadingDetails(false);
                    });
            } else if (!externalSelectedNode) {
                setNodeDetails(null);
            }
        }
    }, [externalSelectedNode, originalOntologyData, formatType, selectedNode]);
};