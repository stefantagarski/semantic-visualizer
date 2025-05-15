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
            throw new Error(error.response?.data || 'Failed to parse ontology data');
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
            throw new Error(error.response?.data || 'Failed to upload ontology file');
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
            throw new Error(error.response?.data || 'Failed to fetch node details');
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
            throw new Error(error.response?.data || 'Failed to fetch ontology statistics');
        }
    }
}

export default OntologyService;