package com.semantic.semanticvisualizer.service;

import com.semantic.semanticvisualizer.model.vqa.*;
import com.semantic.semanticvisualizer.model.vqa.graph.GraphResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Service for handling VQA (Visual Question Answering) dataset operations
 */
public interface VQAService {


    /**
     * Upload and parse VQA dataset from file
     *
     * @param file The uploaded VQA dataset file
     * @return Response containing dataset information and validation results
     * @throws IOException If there is an error reading the file
     */
    VQADataset loadVQADataset(MultipartFile file) throws IOException;

    /**
     * Load VQA dataset from JSON content
     *
     * @param jsonContent The JSON content of the VQA dataset
     * @return The loaded VQA dataset
     */
    VQADataset loadVQADatasetFromJson(String jsonContent);

    /**
     * Get all questions for a specific dataset
     * This method is designed for loading FVQA (Fact-based Visual Question Answering) datasets (JSON format)
     *
     * @param datasetId dataset ID
     * @return List of VQA questions
     */
    List<VQAQuestion> getAllQuestions(String datasetId);

    /**
     * Get a specific question by its ID
     *
     * @param questionId question ID
     * @return The VQA question
     */
    VQAQuestion getQuestionById(String questionId);

    /**
     * Start a VQA session for a specific question
     *
     * @param questionId question ID
     * @return The started VQA session details
     */
    VQASessionDTO startVQASession(String questionId);

    /**
     * Validate the user's answer path for a specific session
     *
     * @param sessionId the VQA session ID
     * @param userPath  the user's answer path
     * @return The result of the path validation
     */
    PathValidationResult validateUserPath(String sessionId, UserAnswerPath userPath);

    /**
     * Extract triples from a given path of node URIs
     *
     * @param sessionId the VQA session ID
     * @param nodeURIs  List of node URIs representing the path
     * @return List of extracted triples
     */
    List<TripleVQA> extractTriplesFromPath(String sessionId, List<String> nodeURIs);

    /**
     * Generate a graph representation for a specific dataset
     *
     * @param datasetId dataset ID
     * @return GraphResponse containing graph data
     */
    GraphResponse generateGraphForDataset(String datasetId);

    /**
     * Get a hint for the next step in answering a question based on the current path
     * @param questionId question ID
     * @param currentPath List of node URIs representing the current path
     * @return A map containing hint information
     */
//    Map<String, Object> getHint(String questionId, List<String> currentPath);

}
