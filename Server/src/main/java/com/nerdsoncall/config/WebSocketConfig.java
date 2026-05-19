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
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private WebRTCSignalingHandler webRTCSignalingHandler;

    @Autowired
    private TutoringSessionHandler tutoringSessionHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // WebRTC signaling endpoint (offer/answer/ICE candidates + presence)
        registry.addHandler(webRTCSignalingHandler, "/ws/webrtc")
                .setAllowedOriginPatterns("*");

        // Tutoring session endpoint (whiteboard, screen share, drawing events)
        registry.addHandler(tutoringSessionHandler, "/ws/session")
                .setAllowedOriginPatterns("*");
    }
}
