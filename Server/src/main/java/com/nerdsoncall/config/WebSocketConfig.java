package com.nerdsoncall.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.nerdsoncall.websocket.TutoringSessionHandler;
import com.nerdsoncall.websocket.WebRTCSignalingHandler;

@Configuration
@EnableWebSocket
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketConfigurer, WebSocketMessageBrokerConfigurer {

    @Bean
    public SignalingHandler signalingHandler() {
        return new SignalingHandler();
    }

    @Bean
    public WebRTCSignalingHandler webRTCSignalingHandler() {
        return new WebRTCSignalingHandler();
    }

    @Bean
    public TutoringSessionHandler tutoringSessionHandler() {
        return new TutoringSessionHandler();
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Basic signaling endpoint
        registry.addHandler(signalingHandler(), "/ws/signaling")
                .setAllowedOrigins("*"); // In production, restrict to your frontend domain

        // WebRTC specific signaling endpoint
        registry.addHandler(webRTCSignalingHandler(), "/ws/webrtc")
                .setAllowedOrigins("*");

        // Tutoring session endpoint for canvas and screen sharing
        registry.addHandler(tutoringSessionHandler(), "/ws/session")
                .setAllowedOrigins("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to send messages to clients
        // on destinations prefixed with /topic and /queue
        config.enableSimpleBroker("/topic", "/queue");

        // Set prefix for messages bound for methods annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoints
        registry.addEndpoint("/ws/stomp")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
