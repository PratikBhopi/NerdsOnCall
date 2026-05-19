package com.nerdsoncall.service;

import com.nerdsoncall.entity.Payout;
import com.nerdsoncall.entity.Subscription;
import com.nerdsoncall.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PdfService pdfService;

    public void sendPasswordResetEmail(String to, String resetToken, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request - NerdsOnCall");
        message.setText(
            "Hello,\n\n" +
            "You have requested to reset your password for your NerdsOnCall account.\n\n" +
            "Please click the following link to reset your password:\n" +
            resetUrl + "?token=" + resetToken + "\n\n" +
            "This link will expire in 1 hour.\n\n" +
            "If you did not request this password reset, please ignore this email.\n\n" +
            "Best regards,\n" +
            "NerdsOnCall Team"
        );
        
        mailSender.send(message);
    }

    public void sendPasswordResetSuccessEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Successful - NerdsOnCall");
        message.setText(
            "Hello,\n\n" +
            "Your password has been successfully reset for your NerdsOnCall account.\n\n" +
            "If you did not perform this action, please contact our support team immediately.\n\n" +
            "Best regards,\n" +
            "NerdsOnCall Team"
        );
        
        mailSender.send(message);
    }

    public String buildReceiptEmailBody(String userName, Subscription subscription) {
        return """
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            </style>
        </head>
        <body style=\"font-family: 'Inter', Arial, sans-serif; background: linear-gradient(45deg, #FFE066, #FF6B9D, #66D9EF); padding: 20px; margin: 0;\">
            <div style=\"max-width: 600px; margin: auto; background: #FFFF00; padding: 0; border: 5px solid #000; box-shadow: 8px 8px 0px #000; transform: rotate(-1deg);\">
                <!-- Header Section -->
                <div style=\"background: #FF6B9D; padding: 25px; border-bottom: 5px solid #000; transform: rotate(1deg); margin: -2px -2px 0 -2px;\">
                    <h1 style=\"font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 28px; color: #000; margin: 0; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #FFF;\">NERDS ON CALL</h1>
                    <p style=\"font-weight: 700; font-size: 16px; color: #000; margin: 5px 0 0 0; text-transform: uppercase;\">SUBSCRIPTION CONFIRMED!</p>
                </div>

                <!-- Main Content -->
                <div style=\"padding: 30px; background: #FFFF00;\">
                    <div style=\"background: #66D9EF; padding: 20px; border: 4px solid #000; box-shadow: 4px 4px 0px #000; margin-bottom: 20px; transform: rotate(0.5deg);\">
                        <h2 style=\"font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 20px; color: #000; margin: 0 0 10px 0; text-transform: uppercase;\">Hey %s! </h2>
                        <p style=\"font-weight: 700; color: #000; margin: 0; font-size: 16px;\">Your subscription is LIVE and ready to rock!</p>
                    </div>

                    <!-- Receipt Details -->
                    <div style=\"background: #FFF; padding: 25px; border: 4px solid #000; box-shadow: 6px 6px 0px #000; margin-bottom: 20px; transform: rotate(-0.5deg);\">
                        <h3 style=\"font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 18px; color: #000; margin: 0 0 15px 0; text-transform: uppercase; border-bottom: 3px solid #000; padding-bottom: 10px;\">RECEIPT DETAILS</h3>
                        <div style=\"display: grid; gap: 10px;\">
                            <div style=\"background: #FFE066; padding: 10px; border: 2px solid #000;\">
                                <strong style=\"color: #000; text-transform: uppercase;\">Receipt ID:</strong> <span style=\"font-weight: 900; color: #000;\">#%06d</span>
                            </div>
                            <div style=\"background: #FF6B9D; padding: 10px; border: 2px solid #000;\">
                                <strong style=\"color: #000; text-transform: uppercase;\">Plan:</strong> <span style=\"font-weight: 900; color: #000;\">%s</span>
                            </div>
                            <div style=\"background: #66D9EF; padding: 10px; border: 2px solid #000;\">
                                <strong style=\"color: #000; text-transform: uppercase;\">Price:</strong> <span style=\"font-weight: 900; color: #000; font-size: 18px;\">₹%.2f</span>
                            </div>
                            <div style=\"background: #90EE90; padding: 10px; border: 2px solid #000;\">
                                <strong style=\"color: #000; text-transform: uppercase;\">Status:</strong> <span style=\"font-weight: 900; color: #000;\">%s </span>
                            </div>
                            <div style=\"background: #FFB347; padding: 10px; border: 2px solid #000;\">
                                <strong style=\"color: #000; text-transform: uppercase;\">Duration:</strong> <span style=\"font-weight: 900; color: #000;\">%s → %s</span>
                            </div>
                        </div>
                    </div>
                <p><strong>NerdsOnCall</strong> is a real-time doubt-solving platform that connects students with tutors via live video calls, interactive whiteboards, and screen sharing. We’re thrilled to have you on board!</p>


                    <!-- About Section -->
                    <div style=\"background: #FF6B9D; padding: 20px; border: 4px solid #000; box-shadow: 4px 4px 0px #000; margin-bottom: 20px; transform: rotate(0.3deg);\">
                        <h3 style=\"font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 16px; color: #000; margin: 0 0 10px 0; text-transform: uppercase;\">WHAT'S NEXT?</h3>
                        <p style=\"font-weight: 700; color: #000; margin: 0; line-height: 1.4;\"><strong>NerdsOnCall</strong> connects you with expert tutors via live video calls, interactive whiteboards, and screen sharing. Time to crush those doubts! </p>
                    </div>

                    <!-- Footer -->
                    <div style=\"background: #000; color: #FFFF00; padding: 20px; border: 4px solid #000; text-align: center; transform: rotate(-0.2deg);\">
                        <p style=\"font-weight: 900; margin: 0; text-transform: uppercase; font-size: 16px;\">Questions? Just reply! </p>
                        <p style=\"font-weight: 700; margin: 10px 0 0 0;\">— The NerdsOnCall Squad </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """.formatted(
            userName,
            subscription.getId(),
            subscription.getPlanName(),
            subscription.getPrice(),
            subscription.getStatus(),
            subscription.getStartDate().toLocalDate(),
            subscription.getEndDate().toLocalDate()
        );
    }

    public void sendSubscriptionReceiptWithPdf(String to, String userName, User user, Subscription subscription) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("Subscription Confirmed - Payment Receipt Attached | NerdsOnCall");

        // Build greeting email body with newbrutalism styling
        String emailBody = """
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            </style>
        </head>
        <body style="font-family: 'Inter', Arial, sans-serif; background: linear-gradient(45deg, #FFE066, #FF6B9D, #66D9EF); padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: auto; background: #FFFF00; padding: 0; border: 5px solid #000; box-shadow: 8px 8px 0px #000; transform: rotate(-1deg);">
                <!-- Header Section -->
                <div style="background: #FF6B9D; padding: 25px; border-bottom: 5px solid #000; transform: rotate(1deg); margin: -2px -2px 0 -2px;">
                    <h1 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 28px; color: #000; margin: 0; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #FFF;">NERDS ON CALL</h1>
                    <p style="font-weight: 700; font-size: 16px; color: #000; margin: 5px 0 0 0; text-transform: uppercase;">PAYMENT CONFIRMED!</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 30px; background: #FFFF00;">
                    <div style="background: #66D9EF; padding: 20px; border: 4px solid #000; box-shadow: 4px 4px 0px #000; margin-bottom: 20px; transform: rotate(0.5deg);">
                        <h2 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 20px; color: #000; margin: 0 0 10px 0; text-transform: uppercase;">Hey %s! </h2>
                        <p style="font-weight: 700; color: #000; margin: 0; font-size: 16px;">Your payment is CONFIRMED and your subscription is LIVE! Welcome to the squad! </p>
                    </div>

                    <!-- PDF Info Section -->
                    <div style="background: #FFF; padding: 25px; border: 4px solid #000; box-shadow: 6px 6px 0px #000; margin-bottom: 20px; transform: rotate(-0.5deg);">
                        <h3 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 18px; color: #000; margin: 0 0 15px 0; text-transform: uppercase; border-bottom: 3px solid #000; padding-bottom: 10px;">YOUR RECEIPT IS ATTACHED!</h3>
                        <p style="font-weight: 700; color: #000; margin: 0 0 15px 0;">Check out your detailed PDF receipt with all the important stuff:</p>
                        <div style="display: grid; gap: 8px;">
                            <div style="background: #FFE066; padding: 8px; border: 2px solid #000; font-weight: 700; color: #000;">Subscription plan details</div>
                            <div style="background: #FF6B9D; padding: 8px; border: 2px solid #000; font-weight: 700; color: #000;">Payment information</div>
                            <div style="background: #66D9EF; padding: 8px; border: 2px solid #000; font-weight: 700; color: #000;">Start and end dates</div>
                            <div style="background: #90EE90; padding: 8px; border: 2px solid #000; font-weight: 700; color: #000;">Session limits and usage</div>
                        </div>
                    </div>

                    <!-- About Section -->
                    <div style="background: #FF6B9D; padding: 20px; border: 4px solid #000; box-shadow: 4px 4px 0px #000; margin-bottom: 20px; transform: rotate(0.3deg);">
                        <h3 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 16px; color: #000; margin: 0 0 10px 0; text-transform: uppercase;">READY TO LEARN?</h3>
                        <p style="font-weight: 700; color: #000; margin: 0; line-height: 1.4;"><strong>NerdsOnCall</strong> connects you with expert tutors via live video calls, interactive whiteboards, and screen sharing. Start booking sessions and crush those doubts! </p>
                    </div>

                    <!-- Footer -->
                    <div style="background: #000; color: #FFFF00; padding: 20px; border: 4px solid #000; text-align: center; transform: rotate(-0.2deg);">
                        <p style="font-weight: 900; margin: 0; text-transform: uppercase; font-size: 16px;">Questions? Just reply! </p>
                        <p style="font-weight: 700; margin: 10px 0 0 0;">— The NerdsOnCall Squad </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """.formatted(userName);

        helper.setText(emailBody, true);

        // Generate PDF receipt
        byte[] pdfBytes = pdfService.generateSubscriptionReceipt(user, subscription);

        // Attach PDF
        String fileName = String.format("NerdsOnCall_Receipt_%06d.pdf", subscription.getId());
        helper.addAttachment(fileName, new ByteArrayResource(pdfBytes));

        mailSender.send(message);
    }

    @Deprecated
    public void sendHtmlReceiptMailOfSubscription(String to, String userName, Subscription subscription) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Subscription Receipt - NerdsOnCall");
        helper.setText(buildReceiptEmailBody(userName, subscription), true);
        mailSender.send(message);
    }

    public void sendMonthlyPayoutMail(String to, String tutorName, double amount, String month, String billingDate, String transactionId) throws MessagingException {
        String subject = "Payout Processed - Payment Receipt Attached | NerdsOnCall";
        String body = """
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                </style>
            </head>
            <body style="font-family: 'Inter', Arial, sans-serif; background: linear-gradient(45deg, #FFE066, #FF6B9D, #66D9EF); padding: 20px; margin: 0;">
                <div style="max-width: 600px; margin: auto; background: #FFFF00; padding: 0; border: 5px solid #000; box-shadow: 8px 8px 0px #000; transform: rotate(-1deg);">
                    <!-- Header Section -->
                    <div style="background: #66D9EF; padding: 25px; border-bottom: 5px solid #000; transform: rotate(1deg); margin: -2px -2px 0 -2px;">
                        <h1 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 28px; color: #000; margin: 0; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #FFF;">NERDS ON CALL</h1>
                        <p style="font-weight: 700; font-size: 16px; color: #000; margin: 5px 0 0 0; text-transform: uppercase;">PAYOUT PROCESSED!</p>
                    </div>

                    <!-- Main Content -->
                    <div style="padding: 30px; background: #FFFF00;">
                        <div style="background: #FF6B9D; padding: 20px; border: 4px solid #000; box-shadow: 4px 4px 0px #000; margin-bottom: 20px; transform: rotate(0.5deg);">
                            <h2 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 20px; color: #000; margin: 0 0 10px 0; text-transform: uppercase;">Hey %s! </h2>
                            <p style="font-weight: 700; color: #000; margin: 0; font-size: 16px;">Your monthly payout is READY and has been processed! Time to celebrate! </p>
                        </div>

                        <!-- Payout Details -->
                        <div style="background: #FFF; padding: 25px; border: 4px solid #000; box-shadow: 6px 6px 0px #000; margin-bottom: 20px; transform: rotate(-0.5deg);">
                            <h3 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 18px; color: #000; margin: 0 0 15px 0; text-transform: uppercase; border-bottom: 3px solid #000; padding-bottom: 10px;">PAYOUT DETAILS</h3>
                            <div style="display: grid; gap: 10px;">
                                <div style="background: #FFE066; padding: 10px; border: 2px solid #000;">
                                    <strong style="color: #000; text-transform: uppercase;">Amount:</strong> <span style="font-weight: 900; color: #000; font-size: 18px;">₹%.2f</span>
                                </div>
                                <div style="background: #FF6B9D; padding: 10px; border: 2px solid #000;">
                                    <strong style="color: #000; text-transform: uppercase;">Period:</strong> <span style="font-weight: 900; color: #000;">%s</span>
                                </div>
                                <div style="background: #66D9EF; padding: 10px; border: 2px solid #000;">
                                    <strong style="color: #000; text-transform: uppercase;">Billing Date:</strong> <span style="font-weight: 900; color: #000;">%s</span>
                                </div>
                                <div style="background: #90EE90; padding: 10px; border: 2px solid #000;">
                                    <strong style="color: #000; text-transform: uppercase;">Transaction ID:</strong> <span style="font-weight: 900; color: #000;">%s</span>
                                </div>
                            </div>
                        </div>

                        <!-- PDF Info Section -->
                        <div style="background: #FFF; padding: 25px; border: 4px solid #000; box-shadow: 6px 6px 0px #000; margin-bottom: 20px; transform: rotate(0.3deg);">
                            <h3 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 18px; color: #000; margin: 0 0 15px 0; text-transform: uppercase; border-bottom: 3px solid #000; padding-bottom: 10px;">YOUR RECEIPT IS ATTACHED!</h3>
                            <p style="font-weight: 700; color: #000; margin: 0;">Check out your detailed PDF receipt with all the important payout information! </p>
                        </div>

                        <!-- Thank You Section -->
                        <div style="background: #FF6B9D; padding: 20px; border: 4px solid #000; box-shadow: 4px 4px 0px #000; margin-bottom: 20px; transform: rotate(-0.3deg);">
                            <h3 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 16px; color: #000; margin: 0 0 10px 0; text-transform: uppercase;">THANK YOU!</h3>
                            <p style="font-weight: 700; color: #000; margin: 0; line-height: 1.4;">Your dedication to helping students learn and grow is truly appreciated. Keep being awesome! </p>
                        </div>

                        <!-- Footer -->
                        <div style="background: #000; color: #FFFF00; padding: 20px; border: 4px solid #000; text-align: center; transform: rotate(-0.2deg);">
                            <p style="font-weight: 900; margin: 0; text-transform: uppercase; font-size: 16px;">Questions? Just reply! </p>
                            <p style="font-weight: 700; margin: 10px 0 0 0;">— The NerdsOnCall Squad </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(tutorName, amount, month, billingDate, transactionId);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true); // true = HTML

        mailSender.send(message);
    }

    public void sendMonthlyPayoutMailWithPdf(User tutor, Payout payout) throws MessagingException, IOException {
        String tutorName = tutor.getFirstName() + " " + tutor.getLastName();
        String month = payout.getPeriodStart().getMonth().name() + " " + payout.getPeriodStart().getYear();
        String billingDate = payout.getPeriodStart().toLocalDate().toString();

        String subject = "Payout Processed - Payment Receipt Attached | NerdsOnCall";
        String body = buildTutorPayoutEmailBody(tutorName, payout, month, billingDate);

        // Generate PDF receipt
        byte[] pdfBytes = pdfService.generateTutorPayoutReceipt(tutor, payout);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(tutor.getEmail());
        helper.setSubject(subject);
        helper.setText(body, true); // true = HTML

        // Attach PDF
        String fileName = String.format("payout_receipt_%s_%s.pdf",
            tutor.getFirstName().toLowerCase(),
            month.toLowerCase().replace(" ", "_"));
        helper.addAttachment(fileName, new ByteArrayResource(pdfBytes));

        mailSender.send(message);
    }

    public String buildTutorPayoutEmailBody(String tutorName, Payout payout, String month, String billingDate) {
        return """
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            </style>
        </head>
        <body style="font-family: 'Inter', Arial, sans-serif; background: linear-gradient(45deg, #FFE066, #FF6B9D, #66D9EF); padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: auto; background: #FFFF00; padding: 0; border: 5px solid #000; box-shadow: 8px 8px 0px #000; transform: rotate(-1deg);">
                <!-- Header Section -->
                <div style="background: #66D9EF; padding: 25px; border-bottom: 5px solid #000; transform: rotate(1deg); margin: -2px -2px 0 -2px;">
                    <h1 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 28px; color: #000; margin: 0; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #FFF;">NERDS ON CALL</h1>
                    <p style="font-weight: 700; font-size: 16px; color: #000; margin: 5px 0 0 0; text-transform: uppercase;">PAYOUT PROCESSED!</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 30px; background: #FFFF00;">
                    <div style="background: #FF6B9D; padding: 20px; border: 4px solid #000; box-shadow: 4px 4px 0px #000; margin-bottom: 20px; transform: rotate(0.5deg);">
                        <h2 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 20px; color: #000; margin: 0 0 10px 0; text-transform: uppercase;">Hey %s! </h2>
                        <p style="font-weight: 700; color: #000; margin: 0; font-size: 16px;">Your monthly payout is READY and has been processed! Time to celebrate! </p>
                    </div>

                    <!-- Payout Details -->
                    <div style="background: #FFF; padding: 25px; border: 4px solid #000; box-shadow: 6px 6px 0px #000; margin-bottom: 20px; transform: rotate(-0.5deg);">
                        <h3 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 18px; color: #000; margin: 0 0 15px 0; text-transform: uppercase; border-bottom: 3px solid #000; padding-bottom: 10px;">PAYOUT DETAILS</h3>
                        <div style="display: grid; gap: 10px;">
                            <div style="background: #FFE066; padding: 10px; border: 2px solid #000;">
                                <strong style="color: #000; text-transform: uppercase;">Amount:</strong> <span style="font-weight: 900; color: #000; font-size: 18px;">₹%.2f</span>
                            </div>
                            <div style="background: #FF6B9D; padding: 10px; border: 2px solid #000;">
                                <strong style="color: #000; text-transform: uppercase;">Period:</strong> <span style="font-weight: 900; color: #000;">%s</span>
                            </div>
                            <div style="background: #66D9EF; padding: 10px; border: 2px solid #000;">
                                <strong style="color: #000; text-transform: uppercase;">Billing Date:</strong> <span style="font-weight: 900; color: #000;">%s</span>
                            </div>
                            <div style="background: #90EE90; padding: 10px; border: 2px solid #000;">
                                <strong style="color: #000; text-transform: uppercase;">Transaction ID:</strong> <span style="font-weight: 900; color: #000;">%s</span>
                            </div>
                        </div>
                    </div>

                    <!-- PDF Info Section -->
                    <div style="background: #FFF; padding: 25px; border: 4px solid #000; box-shadow: 6px 6px 0px #000; margin-bottom: 20px; transform: rotate(0.3deg);">
                        <h3 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 18px; color: #000; margin: 0 0 15px 0; text-transform: uppercase; border-bottom: 3px solid #000; padding-bottom: 10px;">YOUR RECEIPT IS ATTACHED!</h3>
                        <p style="font-weight: 700; color: #000; margin: 0;">Check out your detailed PDF receipt with all the important payout information! </p>
                    </div>

                    <!-- Thank You Section -->
                    <div style="background: #FF6B9D; padding: 20px; border: 4px solid #000; box-shadow: 4px 4px 0px #000; margin-bottom: 20px; transform: rotate(-0.3deg);">
                        <h3 style="font-family: 'Inter', Arial, sans-serif; font-weight: 900; font-size: 16px; color: #000; margin: 0 0 10px 0; text-transform: uppercase;">THANK YOU!</h3>
                        <p style="font-weight: 700; color: #000; margin: 0; line-height: 1.4;">Your dedication to helping students learn and grow is truly appreciated. Keep being awesome! </p>
                    </div>

                    <!-- Footer -->
                    <div style="background: #000; color: #FFFF00; padding: 20px; border: 4px solid #000; text-align: center; transform: rotate(-0.2deg);">
                        <p style="font-weight: 900; margin: 0; text-transform: uppercase; font-size: 16px;">Questions? Just reply! </p>
                        <p style="font-weight: 700; margin: 10px 0 0 0;">— The NerdsOnCall Squad </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """.formatted(
            tutorName,
            payout.getAmount(),
            month,
            billingDate,
            payout.getTransactionId()
        );
    }
    
} 