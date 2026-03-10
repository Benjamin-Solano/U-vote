package org.example.backenduvote.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCodigoVerificacion(String to, String code, int minutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("U-Vote | Código de verificación");
            helper.setText(
                    "Tu código de verificación es: " + code + "\n\n" +
                            "Expira en " + minutes + " minutos.\n" +
                            "Si no solicitaste este código, ignora este correo.",
                    false
            );

            mailSender.send(message);
            log.info("Correo enviado correctamente a {}", to);

        } catch (Exception e) {
            log.error("Error enviando correo a {} desde {}", to, from, e);
            throw new RuntimeException("Error enviando correo", e);
        }
    }
}