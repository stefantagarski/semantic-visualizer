// OntologyService.js
const API_BASE_URL = 'http://localhost:8080/api/ontology';

class OntologyService {
    /**
     * Parse ontology data via API
     *
     * @param {string} ontologyContent - The ontology content to parse
     * @param {string} format - The format of the ontology data (turtle, rdfxml, jsonld, etc.)
     * @returns {Promise<Object>} - The parsed graph data
     */
    static async parseOntologyData(ontologyContent, format = 'turtle') {
        try {
            const response = await fetch(`${API_BASE_URL}/parse?format=${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: ontologyContent,
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error parsing ontology data:', error);
            throw error;
        }
    }

    /**
     * Upload ontology file via API
     *
     * @param {File} file - The file to upload
     * @param {string} format - The format of the ontology data (turtle, rdfxml, jsonld, etc.)
     * @returns {Promise<Object>} - The parsed graph data
     */
    static async uploadOntologyFile(file, format = 'turtle') {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/upload?format=${format}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading ontology file:', error);
            throw error;
        }
    }
}

export default OntologyService;