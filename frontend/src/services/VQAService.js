import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api/vqa';

class VQAService {

    /**
     * Get graph visualization data for a dataset
     * @param datasetId datasetID
     * @returns {Promise<void>} Promise with graph data
     */
    static async getGraph(datasetId) {
        try {
            const backendGraph = await axios.get(`${API_BASE_URL}/${datasetId}/graph`);
            return backendGraph.data;
        } catch (error) {
            console.error('Error fetching graph visualization:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to fetch graph visualization';
            throw new Error(errorMessage);
        }
    }

    /**
     * Upload VQA dataset file
     * @param {File} file - The VQA dataset file to upload
     * @returns {Promise} - Promise with dataset information
     */
    static async uploadDataset(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${API_BASE_URL}/dataset/upload`,
                    formData
            );
            return response.data;
        } catch (error) {
            console.error('Error uploading VQA dataset file:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to upload VQA dataset';
            throw new Error(errorMessage);
        }
    }

    /**
     * Start a new VQA session
     * @param {string} questionId - ID of the question to answer
     * @returns {Promise} - Promise with session information
     */
    static async startSession(questionId){
        try{
            const response = await axios.post(
                `${API_BASE_URL}/sessions/start/${questionId}`);
            return response.data;
        } catch (error) {
            console.error('Error starting VQA session:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to start VQA session';
            throw new Error(errorMessage);
        }
    }

    /**
     * Validate user's answer path
     * @param {string} sessionId - ID of the session
     * @param {Object} userAnswerPath - User's answer path {questionId, nodeURIs}
     * @returns {Promise} - Promise with validation result
     */
    static async validatePath(sessionId, userAnswerPath) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/sessions/${sessionId}/validate`,
                userAnswerPath);
            return response.data;
        } catch (error) {
            console.error('Error validating path:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data || error.message || 'Failed to validate path';
            throw new Error(errorMessage);
        }
    }
}

export default VQAService;