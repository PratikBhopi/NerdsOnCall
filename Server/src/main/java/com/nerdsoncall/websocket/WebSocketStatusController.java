package com.nerdsoncall.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/websocket")
public class WebSocketStatusController {

    @Autowired
    private ApplicationContext applicationContext;

    @GetMapping("/status")
    public Map<String, Object> getWebSocketStatus() {
        Map<String, Object> status = new HashMap<>();

        String[] webSocketConfigurers = applicationContext.getBeanNamesForType(WebSocketConfigurer.class);
        status.put("webSocketConfigurersCount", webSocketConfigurers.length);
        status.put("webSocketConfigurers", webSocketConfigurers);

        status.put("webRTCHandlerRegistered",
                applicationContext.containsBean("webRTCSignalingHandler"));
        status.put("tutoringSessionHandlerRegistered",
                applicationContext.containsBean("tutoringSessionHandler"));

        return status;
    }
}
