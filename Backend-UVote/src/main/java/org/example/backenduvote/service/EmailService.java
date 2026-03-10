package org.example.backenduvote.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

    private final RestTemplate restTemplate;

    @Value("${app.mail.from}")
    private String from;

    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    public EmailService() {
        this.restTemplate = new RestTemplate();
    }

    public void enviarCodigoVerificacion(String to, String code, int minutes) {
        String subject = "U-Vote | Código de verificación";
        String body = """
                Tu código de verificación es: %s

                Expira en %d minutos.
                Si no solicitaste este código, ignora este correo.
                """.formatted(code, minutes);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(sendGridApiKey);

            Map<String, Object> payload = Map.of(
                    "personalizations", List.of(
                            Map.of(
                                    "to", List.of(
                                            Map.of("email", to)
                                    )
                            )
                    ),
                    "from", Map.of("email", from),
                    "subject", subject,
                    "content", List.of(
                            Map.of(
                                    "type", "text/plain",
                                    "value", body
                            )
                    )
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    SENDGRID_URL,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("SendGrid respondió con estado {} para {}", response.getStatusCode(), to);
                throw new RuntimeException("Error enviando correo con SendGrid");
            }

            log.info("Correo enviado correctamente a {}", to);

        } catch (RestClientResponseException e) {
            log.error("Error SendGrid enviando correo a {}. Status: {} Body: {}",
                    to, e.getRawStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("Error enviando correo", e);
        } catch (Exception e) {
            log.error("Error enviando correo a {} desde {}", to, from, e);
            throw new RuntimeException("Error enviando correo", e);
        }
    }
}