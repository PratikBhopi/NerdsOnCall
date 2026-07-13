package com.nerdsoncall.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static com.nerdsoncall.websocket.WebSocketErrorHandler.*;

/**
 * Extended WebSocket handler specifically for WebRTC signaling
 * This handler supports more advanced WebRTC signaling features
 */
@Component
public class WebRTCSignalingHandler extends TextWebSocketHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(WebRTCSignalingHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Store active sessions by userId
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    
    // Store session mappings (tutoring session ID -> participants)
    private final Map<String, Map<String, WebSocketSession>> tutoringSessionParticipants = new ConcurrentHashMap<>();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        try {
            if (session == null) {
                logger.error("WebSocket session is null");
                return;
            }

            if (session.getUri() == null) {
                logger.error("WebSocket session URI is null");
                closeSessionSafely(session, CloseStatus.BAD_DATA, "Invalid session URI");
                return;
            }

            // Extract userId from query parameters
            String query = session.getUri().getQuery();
            if (query != null && query.contains("userId=")) {
                try {
                    String userId = extractParameterFromQuery(query, "userId");
                    if (userId == null || userId.trim().isEmpty()) {
                        logger.warn("Empty userId parameter in WebRTC connection");
                        closeSessionSafely(session, CloseStatus.BAD_DATA, "Invalid userId parameter");
                        return;
                    }

                    logger.info("WebRTC signaling connection established for user: {}", userId);

                    // Close any existing session for this user to prevent duplicates
                    WebSocketSession existingSession = userSessions.get(userId);
                    if (existingSession != null && existingSession.isOpen()) {
                        logger.info("Closing existing WebRTC session for user: {}", userId);
                        closeSessionSafely(existingSession, CloseStatus.NORMAL, "New session established");
                    }

                    userSessions.put(userId, session);

                    // Check if user is joining a specific tutoring session
                    if (query.contains("sessionId=")) {
                        String tutoringSessionId = extractParameterFromQuery(query, "sessionId");
                        if (tutoringSessionId != null && !tutoringSessionId.trim().isEmpty()) {
                            addUserToTutoringSession(userId, tutoringSessionId, session);
                        } else {
                            logger.warn("Empty sessionId parameter for user: {}", userId);
                        }
                    }

                    // Send connection confirmation
                    sendConnectionConfirmation(session, userId);

                } catch (Exception e) {
                    logger.error("Error parsing connection parameters", e);
                    closeSessionSafely(session, CloseStatus.BAD_DATA, "Invalid connection parameters");
                }
            } else {
                logger.error("WebRTC connection rejected: No userId provided");
                closeSessionSafely(session, CloseStatus.BAD_DATA, "No userId provided");
            }
        } catch (Exception e) {
            logger.error("Unexpected error establishing WebRTC connection", e);
            closeSessionSafely(session, CloseStatus.SERVER_ERROR, "Server error during connection establishment");
        }
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            logger.debug("Received WebRTC message: {}", payload);
            
            JsonNode jsonNode = objectMapper.readTree(payload);
            
            if (jsonNode.has("type")) {
                String type = jsonNode.get("type").asText();
                
                switch (type) {
                    case "join":
                        handleJoinMessage(session, jsonNode);
                        break;
                    case "offer":
                    case "answer":
                    case "ice-candidate":
                        forwardSignalingMessage(session, jsonNode);
                        break;
                    case "leave":
                        handleLeaveMessage(session, jsonNode);
                        break;
                    case "chat_message":
                        handleChatMessage(session, jsonNode);
                        break;
                    case "user_typing":
                        handleUserTyping(session, jsonNode);
                        break;
                    case "user-disconnect":
                        handleUserDisconnect(session, jsonNode);
                        break;
                    case "call_declined":
                        handleCallDeclinedMessage(session, jsonNode);
                        break;
                    default:
                        logger.debug("Unknown message type: {}", type);
                        // Don't send error for unknown message types to reduce frontend spam
                }
            } else {
                logger.warn("Invalid message format (missing type): {}", payload);
                sendErrorMessage(session, "Invalid message format");
            }
        } catch (Exception e) {
            logger.error("Error handling WebRTC message", e);
            // Don't send error messages to frontend to avoid spam
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        logger.info("WebRTC connection closed: {}", status);
        
        // Find and remove user from all mappings
        String userId = findUserIdBySession(session);
        if (userId != null) {
            userSessions.remove(userId);
            
            // Remove from all tutoring sessions
            for (Map.Entry<String, Map<String, WebSocketSession>> entry : tutoringSessionParticipants.entrySet()) {
                String sessionId = entry.getKey();
                Map<String, WebSocketSession> participants = entry.getValue();
                
                if (participants.containsKey(userId)) {
                    participants.remove(userId);
                    
                    // Notify other participants that this user has left
                    notifyParticipantLeft(sessionId, userId);
                    
                    // If no participants left, remove the session
                    if (participants.isEmpty()) {
                        tutoringSessionParticipants.remove(sessionId);
                    }
                }
            }
        }
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        logger.error("WebRTC transport error", exception);
        try {
            session.close(CloseStatus.SERVER_ERROR.withReason("Transport error"));
        } catch (IOException e) {
            logger.error("Error closing WebRTC session after transport error", e);
        }
    }
    
    // Helper methods
    
    private void handleJoinMessage(WebSocketSession session, JsonNode message) throws IOException {
        if (message.has("sessionId") && message.has("userId")) {
            String sessionId = message.get("sessionId").asText();
            String userId = message.get("userId").asText();
            
            addUserToTutoringSession(userId, sessionId, session);
            
            // Notify other participants that a new user has joined
            notifyParticipantJoined(sessionId, userId);
            
            // Send the list of existing participants to the new user
            sendParticipantsList(sessionId, userId);
        } else {
            sendErrorMessage(session, "Invalid join message format");
        }
    }
    
    private void handleLeaveMessage(WebSocketSession session, JsonNode message) throws IOException {
        if (message.has("sessionId") && message.has("userId")) {
            String sessionId = message.get("sessionId").asText();
            String userId = message.get("userId").asText();
            
            Map<String, WebSocketSession> participants = tutoringSessionParticipants.get(sessionId);
            if (participants != null) {
                participants.remove(userId);
                
                // Notify other participants that this user has left
                notifyParticipantLeft(sessionId, userId);
                
                // If no participants left, remove the session
                if (participants.isEmpty()) {
                    tutoringSessionParticipants.remove(sessionId);
                }
            }
        } else {
            sendErrorMessage(session, "Invalid leave message format");
        }
    }
    
    private void forwardSignalingMessage(WebSocketSession session, JsonNode message) throws IOException {
        if (message.has("to")) {
            String toUserId = message.get("to").asText();
            
            WebSocketSession recipientSession = userSessions.get(toUserId);
            if (recipientSession != null && recipientSession.isOpen()) {
                recipientSession.sendMessage(new TextMessage(message.toString()));
                logger.debug("WebRTC message forwarded to user: {}", toUserId);
            } else {
                logger.debug("WebRTC recipient not found or offline: {}", toUserId);
                
                // Don't send error message for recipient offline - this is normal behavior
                // The frontend handles this gracefully by timeout mechanisms
            }
        } else {
            sendErrorMessage(session, "Invalid message format (missing recipient)");
        }
    }
    
    private void addUserToTutoringSession(String userId, String sessionId, WebSocketSession session) {
        tutoringSessionParticipants.computeIfAbsent(sessionId, k -> new ConcurrentHashMap<>())
                                  .put(userId, session);
        logger.info("User {} added to tutoring session {}", userId, sessionId);
    }
    
    private void notifyParticipantJoined(String sessionId, String userId) throws IOException {
        Map<String, WebSocketSession> participants = tutoringSessionParticipants.get(sessionId);
        if (participants != null) {
            ObjectNode joinMsg = objectMapper.createObjectNode();
            joinMsg.put("type", "user-joined");
            joinMsg.put("userId", userId);
            joinMsg.put("sessionId", sessionId);
            
            TextMessage textMessage = new TextMessage(joinMsg.toString());
            
            for (Map.Entry<String, WebSocketSession> entry : participants.entrySet()) {
                String participantId = entry.getKey();
                WebSocketSession participantSession = entry.getValue();
                
                // Don't send notification to the user who just joined
                if (!participantId.equals(userId) && participantSession.isOpen()) {
                    participantSession.sendMessage(textMessage);
                }
            }
        }
    }
    
    private void notifyParticipantLeft(String sessionId, String userId) {
        Map<String, WebSocketSession> participants = tutoringSessionParticipants.get(sessionId);
        if (participants != null) {
            ObjectNode leaveMsg = objectMapper.createObjectNode();
            leaveMsg.put("type", "user-left");
            leaveMsg.put("userId", userId);
            leaveMsg.put("sessionId", sessionId);
            
            TextMessage textMessage = new TextMessage(leaveMsg.toString());
            
            for (Map.Entry<String, WebSocketSession> entry : participants.entrySet()) {
                WebSocketSession participantSession = entry.getValue();
                
                if (participantSession.isOpen()) {
                    try {
                        participantSession.sendMessage(textMessage);
                    } catch (IOException e) {
                        logger.error("Error sending participant-left notification", e);
                    }
                }
            }
        }
    }
    
    private void sendParticipantsList(String sessionId, String toUserId) throws IOException {
        Map<String, WebSocketSession> participants = tutoringSessionParticipants.get(sessionId);
        if (participants != null) {
            WebSocketSession recipientSession = participants.get(toUserId);
            
            if (recipientSession != null && recipientSession.isOpen()) {
                ObjectNode participantsMsg = objectMapper.createObjectNode();
                participantsMsg.put("type", "participants-list");
                participantsMsg.put("sessionId", sessionId);
                
                // Add participants array
                var participantsArray = participantsMsg.putArray("participants");
                participants.keySet().stream()
                        .filter(id -> !id.equals(toUserId))
                        .forEach(id -> participantsArray.add(id));
                
                recipientSession.sendMessage(new TextMessage(participantsMsg.toString()));
            }
        }
    }
    
    private String findUserIdBySession(WebSocketSession session) {
        for (Map.Entry<String, WebSocketSession> entry : userSessions.entrySet()) {
            if (entry.getValue().getId().equals(session.getId())) {
                return entry.getKey();
            }
        }
        return null;
    }
    
    private void sendErrorMessage(WebSocketSession session, String errorMessage) throws IOException {
        ObjectNode errorMsg = objectMapper.createObjectNode();
        errorMsg.put("type", "error");
        errorMsg.put("message", errorMessage);
        session.sendMessage(new TextMessage(errorMsg.toString()));
    }
    
    private void handleChatMessage(WebSocketSession session, JsonNode message) throws IOException {
        if (message.has("sessionId") && message.has("userId") && message.has("message")) {
            String sessionId = message.get("sessionId").asText();
            String userId = message.get("userId").asText();
            String chatMessage = message.get("message").asText();
            String userName = message.has("userName") ? message.get("userName").asText() : "Unknown User";
            String timestamp = message.has("timestamp") ? message.get("timestamp").asText() : "";
            String messageId = message.has("id") ? message.get("id").asText() : String.valueOf(System.currentTimeMillis());
            
            logger.info("Chat message from user {} in session {}: {}", userId, sessionId, chatMessage);
            
            // Broadcast the chat message to all participants in the session
            Map<String, WebSocketSession> participants = tutoringSessionParticipants.get(sessionId);
            if (participants != null) {
                ObjectNode chatMsg = objectMapper.createObjectNode();
                chatMsg.put("type", "chat_message");
                chatMsg.put("sessionId", sessionId);
                chatMsg.put("userId", userId);
                chatMsg.put("userName", userName);
                chatMsg.put("message", chatMessage);
                chatMsg.put("timestamp", timestamp);
                chatMsg.put("id", messageId);
                
                TextMessage textMessage = new TextMessage(chatMsg.toString());
                
                for (Map.Entry<String, WebSocketSession> entry : participants.entrySet()) {
                    WebSocketSession participantSession = entry.getValue();
                    
                    if (participantSession.isOpen()) {
                        participantSession.sendMessage(textMessage);
                    }
                }
            } else {
                logger.warn("No participants found for session: {}", sessionId);
            }
        } else {
            sendErrorMessage(session, "Invalid chat message format");
        }
    }
    
    private void handleUserTyping(WebSocketSession session, JsonNode message) throws IOException {
        if (message.has("sessionId") && message.has("userId")) {
            String sessionId = message.get("sessionId").asText();
            String userId = message.get("userId").asText();
            String userName = message.has("userName") ? message.get("userName").asText() : "Unknown User";
            
            logger.debug("⌨User {} typing in session {}", userId, sessionId);
            
            // Broadcast typing indicator to all participants in the session
            Map<String, WebSocketSession> participants = tutoringSessionParticipants.get(sessionId);
            if (participants != null) {
                ObjectNode typingMsg = objectMapper.createObjectNode();
                typingMsg.put("type", "user_typing");
                typingMsg.put("sessionId", sessionId);
                typingMsg.put("userId", userId);
                typingMsg.put("userName", userName);
                
                TextMessage textMessage = new TextMessage(typingMsg.toString());
                
                for (Map.Entry<String, WebSocketSession> entry : participants.entrySet()) {
                    String participantId = entry.getKey();
                    WebSocketSession participantSession = entry.getValue();
                    
                    // Don't send typing indicator to the user who is typing
                    if (!participantId.equals(userId) && participantSession.isOpen()) {
                        participantSession.sendMessage(textMessage);
                    }
                }
            }
        } else {
            sendErrorMessage(session, "Invalid typing message format");
        }
    }
    
    private void handleUserDisconnect(WebSocketSession session, JsonNode message) throws IOException {
        if (message.has("sessionId") && message.has("userId")) {
            String sessionId = message.get("sessionId").asText();
            String userId = message.get("userId").asText();
            
            logger.info("User {} disconnecting from session {}", userId, sessionId);
            
            // Remove user from session participants
            Map<String, WebSocketSession> participants = tutoringSessionParticipants.get(sessionId);
            if (participants != null) {
                participants.remove(userId);
                
                // Notify other participants that this user has left
                notifyParticipantLeft(sessionId, userId);
                
                // If no participants left, remove the session
                if (participants.isEmpty()) {
                    tutoringSessionParticipants.remove(sessionId);
                    logger.info("Session {} removed - no participants left", sessionId);
                }
            }
        } else {
            sendErrorMessage(session, "Invalid disconnect message format");
        }
    }

    private void handleCallDeclinedMessage(WebSocketSession session, JsonNode message) throws IOException {
        if (message.has("to") && message.has("from") && message.has("sessionId")) {
            String toUserId = message.get("to").asText();
            String fromUserId = message.get("from").asText();
            String sessionId = message.get("sessionId").asText();
            String declinerName = message.has("declinerName") ? message.get("declinerName").asText() : "Teacher";

            logger.info("Call declined by {} (ID: {}) for session {}", declinerName, fromUserId, sessionId);

            // Forward the decline message to the caller using direct user sessions
            WebSocketSession targetSession = userSessions.get(toUserId);
            if (targetSession != null && targetSession.isOpen()) {
                try {
                    targetSession.sendMessage(new TextMessage(message.toString()));
                    logger.info("Call decline message forwarded to user {} via direct session", toUserId);
                } catch (IOException e) {
                    logger.error("Failed to forward call decline message to user {}: {}", toUserId, e.getMessage());
                }
            } else {
                logger.warn("Target user {} not found in active sessions or session is closed", toUserId);

                // Try fallback with tutoring session participants
                Map<String, WebSocketSession> participants = tutoringSessionParticipants.get(sessionId);
                if (participants != null) {
                    WebSocketSession fallbackSession = participants.get(toUserId);
                    if (fallbackSession != null && fallbackSession.isOpen()) {
                        try {
                            fallbackSession.sendMessage(new TextMessage(message.toString()));
                            logger.info("Call decline message forwarded to user {} via fallback method", toUserId);
                        } catch (IOException e) {
                            logger.error("Fallback method also failed for user {}: {}", toUserId, e.getMessage());
                        }
                    }
                }
            }

            // Clean up session participants
            Map<String, WebSocketSession> participants = tutoringSessionParticipants.get(sessionId);
            if (participants != null) {
                participants.clear();
                tutoringSessionParticipants.remove(sessionId);
                logger.info("Session {} cleaned up after call decline", sessionId);
            }
        } else {
            sendErrorMessage(session, "Invalid call declined message format");
        }
    }
}