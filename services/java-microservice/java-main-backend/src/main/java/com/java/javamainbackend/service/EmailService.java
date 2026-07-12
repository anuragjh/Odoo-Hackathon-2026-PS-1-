package com.java.javamainbackend.service;

import com.java.javamainbackend.config.AppProperties;
import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.transactional.SendContact;
import com.mailjet.client.transactional.SendEmailsRequest;
import com.mailjet.client.transactional.TransactionalEmail;
import com.mailjet.client.transactional.response.SendEmailsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;


@Service
@Slf4j
public class EmailService {

    private final AppProperties properties;
    private final MailjetClient mailjetClient;
    private final boolean configured;
    private final String brandName;

    public EmailService(AppProperties properties) {
        this.properties = properties;
        AppProperties.Mailjet mj = properties.mailjet();
        this.configured = mj != null
                && isNotBlank(mj.apiKey())
                && isNotBlank(mj.secretKey())
                && isNotBlank(mj.senderEmail());
        this.mailjetClient = configured
                ? new MailjetClient(ClientOptions.builder()
                        .apiKey(mj.apiKey())
                        .apiSecretKey(mj.secretKey())
                        .build())
                : null;
        this.brandName = firstNonBlank(mj != null ? mj.senderName() : null, properties.name(), "AssetFlow");
        if (configured) {
            log.info("Mailjet email delivery ENABLED (sender: {} <{}>)", brandName, mj.senderEmail());
        } else {
            log.warn("Mailjet not fully configured - emails will be LOGGED to console instead of sent.");
        }
    }

    @Async("emailExecutor")
    public void sendVerificationEmail(String to, String name, String rawToken) {
        String link = properties.frontendUrl() + "/verify-email?token="
                + UriUtils.encodeQueryParam(rawToken, StandardCharsets.UTF_8);
        long ttlHours = properties.security().verificationTokenTtlHours();
        send(to, name,
                "Verify your email - " + brandName,
                buildHtml("Verify your email address", name,
                        "Thanks for joining " + brandName + ". Please confirm this email address to activate sign-in. "
                                + "This link expires in " + ttlHours + " hours.",
                        "Verify Email", link),
                "Verify your email address in " + brandName + ": " + link,
                "verification", link);
    }

    @Async("emailExecutor")
    public void sendPasswordResetEmail(String to, String name, String rawToken) {
        String link = properties.frontendUrl() + "/reset-password?token="
                + UriUtils.encodeQueryParam(rawToken, StandardCharsets.UTF_8);
        long ttlMinutes = properties.security().resetTokenTtlMinutes();
        send(to, name,
                "Reset your password - " + brandName,
                buildHtml("Password reset requested", name,
                        "We received a request to reset your password. If this wasn't you, you can safely ignore "
                                + "this email. The link expires in " + ttlMinutes + " minutes and can be used once.",
                        "Reset Password", link),
                "Reset your " + brandName + " password: " + link,
                "password reset", link);
    }

    @Async("emailExecutor")
    public void sendAccountApprovedEmail(String to, String name) {
        String link = properties.frontendUrl() + "/signin";
        send(to, name,
                "Your account has been approved - " + brandName,
                buildHtml("You're in!", name,
                        "An administrator has approved your account. You can now log in and start using " + brandName + ".",
                        "Go to Login", link),
                "Your " + brandName + " account has been approved. Log in: " + link,
                "account approved", link);
    }


    private void send(String to, String toName, String subject, String html, String text,
                      String kind, String link) {
        if (!configured) {
            log.info("[MAIL DISABLED] {} link for {}: {}", kind, to, link);
            return;
        }
        try {
            TransactionalEmail message = TransactionalEmail.builder()
                    .to(new SendContact(to, toName))
                    .from(new SendContact(properties.mailjet().senderEmail(), brandName))
                    .subject(subject)
                    .htmlPart(html)
                    .textPart(text)
                    .build();
            SendEmailsRequest request = SendEmailsRequest.builder().message(message).build();
            SendEmailsResponse response = request.sendWith(mailjetClient);
            log.info("Sent {} email to {} via Mailjet ({} message(s) accepted)",
                    kind, to, response.getMessages().length);
        } catch (Exception e) {
            log.error("Failed to send {} email to {} via Mailjet: {}", kind, to, e.getMessage());
        }
    }

    private String buildHtml(String title, String name, String body, String buttonText, String buttonUrl) {
        String safeName = HtmlUtils.htmlEscape(name == null ? "there" : name);
        return """
                <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f5f7;padding:32px">
                  <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:8px;padding:32px;border:1px solid #e5e7eb">
                    <h2 style="color:#111827;margin:0 0 16px">%s</h2>
                    <p style="color:#374151;font-size:15px">Hi %s,</p>
                    <p style="color:#374151;font-size:15px;line-height:1.6">%s</p>
                    <p style="text-align:center;margin:32px 0">
                      <a href="%s" style="background:#4f46e5;color:#ffffff;text-decoration:none;
                         padding:12px 28px;border-radius:6px;font-size:15px;display:inline-block">%s</a>
                    </p>
                    <p style="color:#6b7280;font-size:13px;line-height:1.6">
                      If the button doesn't work, copy and paste this link into your browser:<br>
                      <a href="%s" style="color:#4f46e5;word-break:break-all">%s</a>
                    </p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
                    <p style="color:#9ca3af;font-size:12px">%s - this is an automated message, please do not reply.</p>
                  </div>
                </div>
                """.formatted(HtmlUtils.htmlEscape(title), safeName, HtmlUtils.htmlEscape(body),
                buttonUrl, HtmlUtils.htmlEscape(buttonText), buttonUrl, buttonUrl,
                HtmlUtils.htmlEscape(brandName));
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (isNotBlank(value)) {
                return value.trim();
            }
        }
        return "AssetFlow";
    }
}
