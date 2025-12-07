package com.semantic.semanticvisualizer.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.semantic.semanticvisualizer.model.vqa.*;
import com.semantic.semanticvisualizer.model.vqa.TripleVQA.KGEntity;
import com.semantic.semanticvisualizer.model.vqa.graph.GraphEdge;
import com.semantic.semanticvisualizer.model.vqa.graph.GraphNode;
import com.semantic.semanticvisualizer.model.vqa.graph.GraphResponse;
import com.semantic.semanticvisualizer.service.VQAService;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

@Service
@Slf4j
public class VQAServiceImplementation implements VQAService {

    private final ObjectMapper objectMapper; // for JSON processing (serialization/deserialization)
    private final Map<String, VQADataset> vqaDatasets = new ConcurrentHashMap<>();
    private final Map<String, VQASessionDTO> vqaSessions = new ConcurrentHashMap<>();

    public VQAServiceImplementation(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public VQADataset loadVQADataset(MultipartFile file) throws IOException {
        String content = new String(file.getBytes());
        return loadVQADatasetFromJson(content);
    }

    @Override
    public VQADataset loadVQADatasetFromJson(String jsonContent) {
        try {
            JsonNode root = objectMapper.readTree(jsonContent);

            List<VQAQuestion> questions = new ArrayList<>();

            if (root.isArray()) {
                for (JsonNode qNode : root) {
                    VQAQuestion q = objectMapper.treeToValue(qNode, VQAQuestion.class);
                    questions.add(q);
                }
            } else if (root.has("questions") && root.get("questions").isArray()) {
                for (JsonNode qNode : root.get("questions")) {
                    VQAQuestion q = objectMapper.treeToValue(qNode, VQAQuestion.class);
                    questions.add(q);
                }
            } else {
                throw new IllegalArgumentException("Invalid dataset JSON: must be an array or an object containing a 'questions' array");
            }

            String datasetId = generateDatasetId();

            VQADataset dataset = new VQADataset();
            dataset.setId(datasetId);
            dataset.setName("fvqa-" + datasetId);
            dataset.setQuestions(questions);
            dataset.setQuestionCount(questions.size());
            dataset.setUploadedAt(LocalDateTime.now());
            dataset.setFormat("FVQA");
            dataset.setDescription("Automatically imported FVQA dataset");

            vqaDatasets.put(datasetId, dataset);

            return dataset;

        } catch (Exception e) {
            log.error("Failed to parse VQA dataset JSON", e);
            throw new IllegalArgumentException("Invalid VQA dataset JSON", e);
        }
    }

    @Override
    public List<VQAQuestion> getAllQuestions(String datasetId) {
        VQADataset dataset = vqaDatasets.get(datasetId);
        if (dataset == null) {
            throw new IllegalArgumentException("Dataset not found: " + datasetId);
        }
        return dataset.getQuestions();
    }

    @Override
    public VQAQuestion getQuestionById(String questionId) {
        return vqaDatasets.values()
                .stream()
                .flatMap(dataset -> dataset.getQuestions().stream())
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));
    }

    @Override
    public VQASessionDTO startVQASession(String questionId) {

        if (questionId == null || questionId.isEmpty() || questionId.equals("undefined")) {
            throw new IllegalArgumentException("Invalid questionId: " + questionId);
        }

        VQASessionDTO session = VQASessionDTO.builder()
                .sessionId(UUID.randomUUID().toString())
                .questionId(questionId)
                .currentPathNodeURIs(new ArrayList<>())
                .startTime(LocalDateTime.now())
                .completed(false)
                .build();

        vqaSessions.put(session.getSessionId(), session);
        return session;
    }

    @Override
    public PathValidationResult validateUserPath(String sessionId, UserAnswerPath userPath) {

        VQASessionDTO session = vqaSessions.get(sessionId);
        if (session == null) throw new IllegalArgumentException("Session not found: " + sessionId);

        VQAQuestion question = getQuestionById(userPath.getQuestionId());

        List<String> correctPath = resolveCorrectPath(question);
        List<String> userNodeURIs = userPath.getNodeURIs();

        double similarity = calculatePathSimilarity(correctPath, userNodeURIs);

        // Normalize both paths
        List<String> normalizedUser = normalizePath(userNodeURIs);
        List<String> normalizedExpected = normalizePath(correctPath);

        boolean isCorrect = new HashSet<>(normalizedUser).equals(new HashSet<>(normalizedExpected));

        //  classify nodes properly ----
        List<String> correctNodes = new ArrayList<>();
        List<String> incorrectNodes = new ArrayList<>();

        for (String node : userNodeURIs) {
            if (normalizedExpected.contains(node)) correctNodes.add(node);
            else incorrectNodes.add(node);
        }

        // Missed nodes
        List<String> missedNodes = new ArrayList<>();
        for (String expected : normalizedExpected) {
            if (!normalizedUser.contains(expected)) missedNodes.add(expected);
        }

        Map<String, Double> opacity = calculateNodeOpacity(userNodeURIs, correctPath);

        String feedback = generateFeedback(similarity, correctNodes.size(), incorrectNodes.size(), missedNodes.size());

        return PathValidationResult.builder()
                .isCorrect(isCorrect)
                .similarityScore(similarity)
                .correctNodes(correctNodes)
                .incorrectNodes(incorrectNodes)
                .missedNodes(missedNodes)
                .highlightedTriples(question.getAnswerTriplets() == null ?
                        List.of(question.getTriple()) :
                        question.getAnswerTriplets())
                .nodeOpacityMap(opacity)
                .expectedPath(correctPath)
                .userPath(userNodeURIs)
                .feedback(feedback)
                .build();
    }

    @Override
    public GraphResponse generateGraphForDataset(String datasetId) {

        VQADataset dataset = vqaDatasets.get(datasetId);
        if (dataset == null)
            throw new IllegalArgumentException("Dataset not found: " + datasetId);

        Map<String, GraphNode> nodes = new LinkedHashMap<>();
        List<GraphEdge> edges = new ArrayList<>();

        for (VQAQuestion q : dataset.getQuestions()) {

            // FVQA single triple
            if (q.getTriple() != null) {
                addTriple(q.getTriple(), nodes, edges);
            }

            // FVQA multiple triples
            if (q.getAnswerTriplets() != null) {
                for (TripleVQA t : q.getAnswerTriplets()) {
                    addTriple(t, nodes, edges);
                }
            }

            // Path-based datasets
            List<String> path = q.getExpectedPath();
            if (path != null && !path.isEmpty()) {
                for (int i = 0; i < path.size(); i++) {

                    String nodeId = path.get(i);
                    if (nodeId == null) continue;

                    String label = nodeId.contains("/")
                            ? nodeId.substring(nodeId.lastIndexOf("/") + 1)
                            : nodeId;

                    nodes.putIfAbsent(nodeId, new GraphNode(nodeId, label, "entity"));

                    if (i < path.size() - 1) {
                        edges.add(new GraphEdge(
                                nodeId,
                                path.get(i + 1),
                                "relatedTo"
                        ));
                    }
                }
            }
        }

        return new GraphResponse(new ArrayList<>(nodes.values()), edges);
    }


    // ---------------------------------------------------------
    // UTILITY METHODS
    // ---------------------------------------------------------

    private String generateDatasetId() {
        return "fvqa-" + UUID.randomUUID().toString().substring(0, 7);
    }

    private List<String> normalizePath(List<String> rawPath) {
        return rawPath.stream()
                .map(node -> {
                    // If it's already a full URI → keep it
                    if (node.startsWith("http://") || node.startsWith("https://")) {
                        return node.trim();
                    }
                    // otherwise keep label AS IS (no splitting!)
                    return node.trim();
                })
                .toList();
    }


    private void addTriple(TripleVQA triple,
                           Map<String, GraphNode> nodeMap,
                           List<GraphEdge> edges) {

        if (triple == null ||
                triple.getSubject() == null ||
                triple.getObject() == null ||
                triple.getRelation() == null) {
            return; // skip invalid triple
        }

        // subject
        String subjectId = triple.getSubject().getUri();
        if (subjectId == null || subjectId.isBlank()) {
            subjectId = triple.getSubject().getLabel();
        }
        if (subjectId == null || subjectId.isBlank()) {
            return; // skip broken triple
        }
        subjectId = subjectId.trim();

        String sLabel = triple.getSubject().getLabel();
        if (sLabel == null || sLabel.isBlank()) {
            sLabel = subjectId.contains("/") ? subjectId.substring(subjectId.lastIndexOf("/") + 1) : subjectId;
        }

        // object
        String objectId = triple.getObject().getUri();
        if (objectId == null || objectId.isBlank()) {
            objectId = triple.getObject().getLabel();
        }
        if (objectId == null || objectId.isBlank()) {
            return; // skip broken triple
        }
        objectId = objectId.trim();

        String oLabel = triple.getObject().getLabel();
        if (oLabel == null || oLabel.isBlank()) {
            oLabel = objectId.contains("/") ? objectId.substring(objectId.lastIndexOf("/") + 1) : objectId;
        }

        // ---- RELATION ----
        String rLabel = triple.getRelation().getLabel();
        if (rLabel == null || rLabel.isBlank()) {
            rLabel = triple.getRelation().getUri();
        }
        if (rLabel == null || rLabel.isBlank()) {
            rLabel = "relatedTo"; // fallback
        }
        rLabel = rLabel.trim();

        // ---- Add nodes ----
        nodeMap.putIfAbsent(subjectId, new GraphNode(subjectId, sLabel, "entity"));
        nodeMap.putIfAbsent(objectId, new GraphNode(objectId, oLabel, "entity"));

        // ---- Add edge ----
        edges.add(new GraphEdge(subjectId, objectId, rLabel));
    }

    private List<String> resolveCorrectPath(VQAQuestion question) {

        if (question.getExpectedPath() != null && !question.getExpectedPath().isEmpty()) {
            return question.getExpectedPath();
        }

        Function<KGEntity, String> nodeId = entity -> {
            if (entity.getUri() != null && !entity.getUri().isBlank()) {
                return entity.getUri();
            }
            return entity.getLabel();
        };

        if (question.getAnswerTriplets() != null && !question.getAnswerTriplets().isEmpty()) {
            List<String> seq = new ArrayList<>();
            for (TripleVQA t : question.getAnswerTriplets()) {
                // subject → object (relation stays as edge label, NOT a node)
                seq.add(nodeId.apply(t.getSubject()));
                seq.add(nodeId.apply(t.getObject()));
            }
            return seq;
        }

        if (question.getTriple() != null) {
            TripleVQA t = question.getTriple();
            return List.of(
                    nodeId.apply(t.getSubject()),
                    nodeId.apply(t.getObject())
            );
        }

        throw new IllegalArgumentException("No valid path found in VQAQuestion: " + question.getId());
    }


    /**
     * Calculate similarity between correct path and user path using Jaccard similarity
     *
     * @param correctPath correct path of the user
     * @param userPath    user's answer path
     * @return similarity score between 0.0 and 1.0
     */
    private double calculatePathSimilarity(List<String> correctPath, List<String> userPath) {

        Set<String> A = new HashSet<>(correctPath);
        Set<String> B = new HashSet<>(userPath);

        Set<String> intersection = new HashSet<>(A);
        intersection.retainAll(B);

        Set<String> union = new HashSet<>(A);
        union.addAll(B);

        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

    /**
     * Calculate node opacity based on correctness
     *
     * @param userPath    user's answer path
     * @param correctPath correct path of the user
     * @return Map of node URIs to their opacity values
     */
    private Map<String, Double> calculateNodeOpacity(List<String> userPath, List<String> correctPath) {
        Map<String, Double> opacityMap = new HashMap<>();

        for (String u : userPath) {
            opacityMap.put(u, correctPath.contains(u) ? 1.0 : 0.3);
        }

        for (String c : correctPath) {
            opacityMap.putIfAbsent(c, 0.5);
        }

        return opacityMap;
    }

    private String generateFeedback(double similarity, int correct, int incorrect, int missed) {

        if (similarity >= 0.9) return "Excellent! You found the correct path.";
        if (similarity >= 0.7) return "Good attempt! You found " + correct + " correct nodes.";
        if (similarity >= 0.5) return "Not bad. " + correct + " correct, " + incorrect + " incorrect.";
        return "Try exploring related nodes. You can request a hint!";
    }
}
