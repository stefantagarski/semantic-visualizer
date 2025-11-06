// OntologyService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/ontology';

class OntologyService {
    /**
     * Parse ontology data by sending it to backend
     * @param {string} ontologyData - The ontology data as a string
     * @param {string} format - The format of the ontology data
     * @returns {Promise} - Promise with parsed graph data
     */
    static async parseOntologyData(ontologyData, format) {
        try {
            const response = await axios.post(`${API_BASE_URL}/parse?format=${format}`,
                ontologyData,
                {
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error parsing ontology data:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to parse ontology data';
            throw new Error(errorMessage);
        }
    }

    /**
     * Upload ontology file to backend
     * @param {File} file - The file to upload
     * @param {string} format - The format of the ontology file
     * @returns {Promise} - Promise with parsed graph data
     */
    static async uploadOntologyFile(file, format) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${API_BASE_URL}/upload?format=${format}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error uploading ontology file:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to upload ontology file';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get details for a specific node
     * @param {string} nodeId - ID of the node to get details for
     * @param {string} ontologyData - The original ontology data
     * @param {string} format - The format of the ontology data
     * @returns {Promise} - Promise with node details
     */
    static async getNodeDetails(nodeId, ontologyData, format) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/node-details/${encodeURIComponent(nodeId)}?format=${format}`,
                ontologyData,
                {
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching node details:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to fetch node details';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get statistics about an ontology
     * @param {string} ontologyData - The ontology data
     * @param {string} format - The format of the ontology data
     * @returns {Promise} - Promise with ontology statistics
     */
    static async getOntologyStatistics(ontologyData, format) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/statistics?format=${format}`,
                ontologyData,
                {
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching ontology statistics:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to fetch ontology statistics';
            throw new Error(errorMessage);
        }
    }

    // ========== NODE HISTORY METHODS ==========

    /**
     * Record a node click in the history
     * @param {string} nodeId - ID of the clicked node
     * @param {string} nodeName - Name/label of the clicked node
     * @param {number} degreeOpacity - Degree opacity value (0-1)
     * @returns {Promise} - Promise with success message
     */
    static async recordNodeClick(nodeId, nodeName, degreeOpacity) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/node-click`,
                null,
                {
                    params: {
                        nodeId,
                        nodeName,
                        degreeOpacity
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error recording node click:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to record node click';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get click history statistics
     * @returns {Promise} - Promise with click statistics
     */
    static async getClickStatistics() {
        try {
            const response = await axios.get(`${API_BASE_URL}/click-statistics`);
            return response.data;
        } catch (error) {
            console.error('Error fetching click statistics:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to fetch click statistics';
            throw new Error(errorMessage);
        }
    }

    /**
     * Get full click history
     * @returns {Promise} - Promise with click history array
     */
    static async getClickHistory() {
        try {
            const response = await axios.get(`${API_BASE_URL}/click-history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching click history:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to fetch click history';
            throw new Error(errorMessage);
        }
    }

    /**
     * Clear all click history
     * @returns {Promise} - Promise with success message
     */
    static async clearClickHistory() {
        try {
            const response = await axios.post(`${API_BASE_URL}/clear-history`);
            return response.data;
        } catch (error) {
            console.error('Error clearing click history:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to clear click history';
            throw new Error(errorMessage);
        }
    }
}

export default OntologyService;
