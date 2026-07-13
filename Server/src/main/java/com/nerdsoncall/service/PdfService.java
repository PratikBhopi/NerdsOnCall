package com.nerdsoncall.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.nerdsoncall.entity.Payout;
import com.nerdsoncall.entity.Subscription;
import com.nerdsoncall.entity.User;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    // Newbrutalism Color Palette
    private static final DeviceRgb BRIGHT_YELLOW = new DeviceRgb(255, 255, 0); // #FFFF00
    private static final DeviceRgb HOT_PINK = new DeviceRgb(255, 107, 157); // #FF6B9D
    private static final DeviceRgb CYAN_BLUE = new DeviceRgb(102, 217, 239); // #66D9EF
    private static final DeviceRgb LIME_GREEN = new DeviceRgb(144, 238, 144); // #90EE90
    private static final DeviceRgb ORANGE = new DeviceRgb(255, 179, 71); // #FFB347
    private static final DeviceRgb PURE_BLACK = new DeviceRgb(0, 0, 0); // #000000
    private static final DeviceRgb PURE_WHITE = new DeviceRgb(255, 255, 255); // #FFFFFF

    public byte[] generateSubscriptionReceipt(User user, Subscription subscription) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);
        document.setMargins(40, 40, 40, 40);

        // Fonts
        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // Header Section
        addHeader(document, boldFont, regularFont);
        
        // Receipt Title
        addReceiptTitle(document, boldFont, subscription);
        
        // Customer Information
        addCustomerInfo(document, boldFont, regularFont, user);
        
        // Subscription Details
        addSubscriptionDetails(document, boldFont, regularFont, subscription);
        
        // Payment Summary
        addPaymentSummary(document, boldFont, regularFont, subscription);
        
        // Footer
        addFooter(document, regularFont);

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateTutorPayoutReceipt(User tutor, Payout payout) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);
        document.setMargins(40, 40, 40, 40);

        // Fonts
        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // Header Section
        addPayoutHeader(document, boldFont, regularFont);

        // Payout Title
        addPayoutTitle(document, boldFont, payout);

        // Tutor Information
        addTutorInfo(document, boldFont, regularFont, tutor);

        // Payout Details
        addPayoutDetails(document, boldFont, regularFont, payout);

        // Payment Summary
        addPayoutSummary(document, boldFont, regularFont, payout);

        // Footer
        addPayoutFooter(document, regularFont);

        document.close();
        return baos.toByteArray();
    }

    private void addHeader(Document document, PdfFont boldFont, PdfFont regularFont) {
        // Newbrutalism Header with bold styling
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(HOT_PINK)
                .setBorder(new SolidBorder(PURE_BLACK, 4))
                .setPadding(25);

        // Company Info
        Cell companyCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);

        Paragraph companyName = new Paragraph("NERDS ON CALL")
                .setFont(boldFont)
                .setFontSize(28)
                .setFontColor(PURE_BLACK)
                .setMargin(0)
                .setBold();

        Paragraph tagline = new Paragraph("REAL-TIME DOUBT SOLVING PLATFORM")
                .setFont(boldFont)
                .setFontSize(12)
                .setFontColor(PURE_BLACK)
                .setMargin(0);

        companyCell.add(companyName).add(tagline);

        // Receipt Info
        Cell receiptCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);

        Paragraph receiptText = new Paragraph("PAYMENT RECEIPT")
                .setFont(boldFont)
                .setFontSize(18)
                .setFontColor(PURE_BLACK)
                .setMargin(0)
                .setBold();

        Paragraph dateText = new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")))
                .setFont(boldFont)
                .setFontSize(10)
                .setFontColor(PURE_BLACK)
                .setMargin(0);

        receiptCell.add(receiptText).add(dateText);

        headerTable.addCell(companyCell);
        headerTable.addCell(receiptCell);
        
        document.add(headerTable);
        document.add(new Paragraph("\n"));
    }

    private void addReceiptTitle(Document document, PdfFont boldFont, Subscription subscription) {
        // Receipt ID and Status
        Table titleTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100));

        Cell receiptIdCell = new Cell()
                .setBorder(Border.NO_BORDER);
        receiptIdCell.add(new Paragraph("Receipt ID: #" + String.format("%06d", subscription.getId()))
                .setFont(boldFont)
                .setFontSize(14)
                .setFontColor(PURE_BLACK));

        Cell statusCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT);
        
        Paragraph statusPara = new Paragraph("" + subscription.getStatus().toString())
                .setFont(boldFont)
                .setFontSize(12)
                .setFontColor(LIME_GREEN);
        statusCell.add(statusPara);

        titleTable.addCell(receiptIdCell);
        titleTable.addCell(statusCell);
        
        document.add(titleTable);
        document.add(new Paragraph("\n"));
    }

    private void addCustomerInfo(Document document, PdfFont boldFont, PdfFont regularFont, User user) {
        // Customer Information Section
        Paragraph sectionTitle = new Paragraph("CUSTOMER INFORMATION")
                .setFont(boldFont)
                .setFontSize(16)
                .setFontColor(PURE_BLACK)
                .setMarginBottom(10)
                .setBold();
        document.add(sectionTitle);

        Table customerTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(BRIGHT_YELLOW)
                .setBorder(new SolidBorder(PURE_BLACK, 3))
                .setPadding(20)
                .setMarginBottom(20);

        addInfoRow(customerTable, "Name:", user.getFullName(), boldFont, regularFont);
        addInfoRow(customerTable, "Email:", user.getEmail(), boldFont, regularFont);
        if (user.getPhoneNumber() != null) {
            addInfoRow(customerTable, "Phone:", user.getPhoneNumber(), boldFont, regularFont);
        }
        addInfoRow(customerTable, "Customer ID:", "#" + String.format("%06d", user.getId()), boldFont, regularFont);

        document.add(customerTable);
    }

    private void addSubscriptionDetails(Document document, PdfFont boldFont, PdfFont regularFont, Subscription subscription) {
        // Subscription Details Section
        Paragraph sectionTitle = new Paragraph("SUBSCRIPTION DETAILS")
                .setFont(boldFont)
                .setFontSize(16)
                .setFontColor(PURE_BLACK)
                .setMarginBottom(10)
                .setBold();
        document.add(sectionTitle);

        Table subscriptionTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(CYAN_BLUE)
                .setBorder(new SolidBorder(PURE_BLACK, 3))
                .setPadding(20)
                .setMarginBottom(20);

        addInfoRow(subscriptionTable, "Plan Name:", subscription.getPlanName(), boldFont, regularFont);
        addInfoRow(subscriptionTable, "Plan Type:", subscription.getPlanType(), boldFont, regularFont);
        addInfoRow(subscriptionTable, "Start Date:", subscription.getStartDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")), boldFont, regularFont);
        addInfoRow(subscriptionTable, "End Date:", subscription.getEndDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")), boldFont, regularFont);
        
        if (subscription.getSessionsLimit() != null) {
            addInfoRow(subscriptionTable, "Sessions Included:", subscription.getSessionsLimit().toString(), boldFont, regularFont);
            addInfoRow(subscriptionTable, "Sessions Used:", subscription.getSessionsUsed().toString(), boldFont, regularFont);
            addInfoRow(subscriptionTable, "Sessions Remaining:", String.valueOf(subscription.getSessionsLimit() - subscription.getSessionsUsed()), boldFont, regularFont);
        }

        document.add(subscriptionTable);
    }

    private void addPaymentSummary(Document document, PdfFont boldFont, PdfFont regularFont, Subscription subscription) {
        // Payment Summary Section
        Paragraph sectionTitle = new Paragraph("PAYMENT SUMMARY")
                .setFont(boldFont)
                .setFontSize(16)
                .setFontColor(PURE_BLACK)
                .setMarginBottom(10)
                .setBold();
        document.add(sectionTitle);

        Table paymentTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(LIME_GREEN)
                .setBorder(new SolidBorder(PURE_BLACK, 4))
                .setMarginBottom(20);

        // Payment rows
        addPaymentRow(paymentTable, "Subscription Amount", "₹" + String.format("%.2f", subscription.getPrice()), regularFont, false);
        addPaymentRow(paymentTable, "Taxes & Fees", "₹0.00", regularFont, false);
        addPaymentRow(paymentTable, "Total Amount Paid", "₹" + String.format("%.2f", subscription.getPrice()), boldFont, true);

        document.add(paymentTable);
    }

    private void addFooter(Document document, PdfFont regularFont) {
        // Thank you message
        Paragraph thankYou = new Paragraph("THANK YOU FOR CHOOSING NERDS ON CALL! ")
                .setFont(regularFont)
                .setFontSize(18)
                .setFontColor(PURE_BLACK)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30)
                .setMarginBottom(20)
                .setBold();
        document.add(thankYou);

        // Service description
        Paragraph description = new Paragraph(
                "NerdsOnCall connects students with expert tutors through live video calls, " +
                "interactive whiteboards, and screen sharing for real-time doubt solving. " +
                "We're committed to making quality education accessible to everyone."
        )
                .setFont(regularFont)
                .setFontSize(10)
                .setFontColor(PURE_BLACK)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(description);

        // Contact information
        Paragraph contact = new Paragraph("For support, contact us at support@nerdsoncall.com")
                .setFont(regularFont)
                .setFontSize(10)
                .setFontColor(PURE_BLACK)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(contact);
    }

    private void addInfoRow(Table table, String label, String value, PdfFont boldFont, PdfFont regularFont) {
        Cell labelCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPaddingBottom(5);
        labelCell.add(new Paragraph(label)
                .setFont(boldFont)
                .setFontSize(10)
                .setFontColor(PURE_BLACK));

        Cell valueCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPaddingBottom(5);
        valueCell.add(new Paragraph(value)
                .setFont(regularFont)
                .setFontSize(10)
                .setFontColor(ColorConstants.BLACK));

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addPaymentRow(Table table, String description, String amount, PdfFont font, boolean isTotal) {
        Cell descCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(10)
                .setBackgroundColor(isTotal ? ORANGE : PURE_WHITE);
        
        Cell amountCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBackgroundColor(isTotal ? ORANGE : PURE_WHITE);

        Paragraph descPara = new Paragraph(description)
                .setFont(font)
                .setFontSize(isTotal ? 12 : 10)
                .setFontColor(PURE_BLACK);

        Paragraph amountPara = new Paragraph(amount)
                .setFont(font)
                .setFontSize(isTotal ? 12 : 10)
                .setFontColor(PURE_BLACK);

        descCell.add(descPara);
        amountCell.add(amountPara);

        table.addCell(descCell);
        table.addCell(amountCell);
    }

    // Tutor Payout PDF Methods
    private void addPayoutHeader(Document document, PdfFont boldFont, PdfFont regularFont) {
        // Newbrutalism Header with bold styling
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(CYAN_BLUE)
                .setBorder(new SolidBorder(PURE_BLACK, 4))
                .setPadding(25);

        // Company Info
        Cell companyCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);

        Paragraph companyName = new Paragraph("NERDS ON CALL")
                .setFont(boldFont)
                .setFontSize(28)
                .setFontColor(PURE_BLACK)
                .setMargin(0)
                .setBold();

        Paragraph tagline = new Paragraph("TUTOR PAYOUT SYSTEM")
                .setFont(boldFont)
                .setFontSize(12)
                .setFontColor(PURE_BLACK)
                .setMargin(0);

        companyCell.add(companyName).add(tagline);

        // Payout Info
        Cell payoutCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);

        Paragraph payoutText = new Paragraph("PAYOUT RECEIPT")
                .setFont(boldFont)
                .setFontSize(18)
                .setFontColor(PURE_BLACK)
                .setMargin(0)
                .setBold();

        Paragraph dateText = new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")))
                .setFont(boldFont)
                .setFontSize(10)
                .setFontColor(PURE_BLACK)
                .setMargin(0);

        payoutCell.add(payoutText).add(dateText);

        headerTable.addCell(companyCell);
        headerTable.addCell(payoutCell);

        document.add(headerTable);
        document.add(new Paragraph("\n"));
    }

    private void addPayoutTitle(Document document, PdfFont boldFont, Payout payout) {
        // Payout ID and Status
        Table titleTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100));

        Cell payoutIdCell = new Cell()
                .setBorder(Border.NO_BORDER);
        payoutIdCell.add(new Paragraph("Payout ID: #" + String.format("%06d", payout.getId()))
                .setFont(boldFont)
                .setFontSize(14)
                .setFontColor(PURE_BLACK));

        Cell statusCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT);

        Paragraph statusPara = new Paragraph("" + payout.getStatus().toString())
                .setFont(boldFont)
                .setFontSize(12)
                .setFontColor(LIME_GREEN);
        statusCell.add(statusPara);

        titleTable.addCell(payoutIdCell);
        titleTable.addCell(statusCell);

        document.add(titleTable);
        document.add(new Paragraph("\n"));
    }

    private void addTutorInfo(Document document, PdfFont boldFont, PdfFont regularFont, User tutor) {
        // Tutor Information Section
        Paragraph sectionTitle = new Paragraph("TUTOR INFORMATION")
                .setFont(boldFont)
                .setFontSize(16)
                .setFontColor(PURE_BLACK)
                .setMarginBottom(10)
                .setBold();
        document.add(sectionTitle);

        Table tutorTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(HOT_PINK)
                .setBorder(new SolidBorder(PURE_BLACK, 3))
                .setPadding(20)
                .setMarginBottom(20);

        addInfoRow(tutorTable, "Name:", tutor.getFirstName() + " " + tutor.getLastName(), boldFont, regularFont);
        addInfoRow(tutorTable, "Email:", tutor.getEmail(), boldFont, regularFont);
        if (tutor.getPhoneNumber() != null) {
            addInfoRow(tutorTable, "Phone:", tutor.getPhoneNumber(), boldFont, regularFont);
        }
        addInfoRow(tutorTable, "Total Sessions:", tutor.getTotalSessions().toString(), boldFont, regularFont);
        addInfoRow(tutorTable, "Total Earnings:", "₹" + String.format("%.2f", tutor.getTotalEarnings()), boldFont, regularFont);
        addInfoRow(tutorTable, "Hourly Rate:", "₹" + String.format("%.2f", tutor.getHourlyRate()), boldFont, regularFont);

        document.add(tutorTable);
    }

    private void addPayoutDetails(Document document, PdfFont boldFont, PdfFont regularFont, Payout payout) {
        // Payout Details Section
        Paragraph sectionTitle = new Paragraph("PAYOUT DETAILS")
                .setFont(boldFont)
                .setFontSize(16)
                .setFontColor(PURE_BLACK)
                .setMarginBottom(10)
                .setBold();
        document.add(sectionTitle);

        Table payoutTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(BRIGHT_YELLOW)
                .setBorder(new SolidBorder(PURE_BLACK, 3))
                .setPadding(20)
                .setMarginBottom(20);

        String month = payout.getPeriodStart().getMonth().name() + " " + payout.getPeriodStart().getYear();
        addInfoRow(payoutTable, "Period:", month, boldFont, regularFont);
        addInfoRow(payoutTable, "Period Start:", payout.getPeriodStart().toLocalDate().toString(), boldFont, regularFont);
        addInfoRow(payoutTable, "Period End:", payout.getPeriodEnd().toLocalDate().toString(), boldFont, regularFont);
        addInfoRow(payoutTable, "Transaction ID:", payout.getTransactionId(), boldFont, regularFont);
        addInfoRow(payoutTable, "Status:", payout.getStatus().toString(), boldFont, regularFont);
        if (payout.getDescription() != null) {
            addInfoRow(payoutTable, "Description:", payout.getDescription(), boldFont, regularFont);
        }

        document.add(payoutTable);
    }

    private void addPayoutSummary(Document document, PdfFont boldFont, PdfFont regularFont, Payout payout) {
        // Payment Summary Section
        Paragraph sectionTitle = new Paragraph("PAYMENT SUMMARY")
                .setFont(boldFont)
                .setFontSize(16)
                .setFontColor(PURE_BLACK)
                .setMarginBottom(10)
                .setBold();
        document.add(sectionTitle);

        Table paymentTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(LIME_GREEN)
                .setBorder(new SolidBorder(PURE_BLACK, 4))
                .setMarginBottom(20);

        // Payment rows
        addPaymentRow(paymentTable, "Gross Earnings", "₹" + String.format("%.2f", payout.getAmount()), regularFont, false);
        addPaymentRow(paymentTable, "Platform Fee (0%)", "₹0.00", regularFont, false);
        addPaymentRow(paymentTable, "Total Payout Amount", "₹" + String.format("%.2f", payout.getAmount()), boldFont, true);

        document.add(paymentTable);
    }

    private void addPayoutFooter(Document document, PdfFont regularFont) {
        // Thank you message
        Paragraph thankYou = new Paragraph("THANK YOU FOR BEING AN AMAZING TUTOR! ")
                .setFont(regularFont)
                .setFontSize(18)
                .setFontColor(PURE_BLACK)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30)
                .setMarginBottom(20)
                .setBold();
        document.add(thankYou);

        // Description
        Paragraph description = new Paragraph(
            "This payout receipt confirms the successful transfer of your monthly earnings. " +
            "Your dedication to helping students learn and grow is truly appreciated. " +
            "Keep up the excellent work!"
        )
                .setFont(regularFont)
                .setFontSize(10)
                .setFontColor(PURE_BLACK)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(description);

        // Contact info
        Paragraph contact = new Paragraph("For support, contact us at support@nerdsoncall.com")
                .setFont(regularFont)
                .setFontSize(10)
                .setFontColor(PURE_BLACK)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(contact);
    }
}
