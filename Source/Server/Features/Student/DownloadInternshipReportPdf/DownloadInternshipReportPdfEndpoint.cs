using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Colors;
using iText.Layout.Borders;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using Document = iText.Layout.Document;

namespace InternshipManagementSystem.Features.Student.DownloadInternshipReportPdf;

public class DownloadInternshipReportPdfEndpoint : Endpoint<DownloadInternshipReportPdfRequest, DownloadInternshipReportPdfResult>
{
    private readonly DatabaseContext _databaseContext;

    public DownloadInternshipReportPdfEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("students/internships/{internshipId}/report/download");
        Roles(nameof(Domain.Student));
    }

    public override async Task HandleAsync(DownloadInternshipReportPdfRequest request, CancellationToken cancellationToken)
    {
        var student = HttpContext.GetAuthenticatedStudent()!;

        // Verify internship exists and belongs to the student
        var internship = await _databaseContext.Internships
            .FirstOrDefaultAsync(i => i.Id == request.InternshipId && i.StudentId == student.Id, cancellationToken);

        if (internship == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipNotFound);

        // Get the internship report with all related data
        var report = await _databaseContext.InternshipReports
            .Include(r => r.Internship)
                .ThenInclude(i => i!.InternshipProvider)
            .FirstOrDefaultAsync(r => r.InternshipId == request.InternshipId, cancellationToken);

        if (report == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipReportNotFound);

        // Verify report is at least confirmed by mentor
        if (!report.IsConfirmedByMentor)
            ErrorSender.SendError(ErrorDefinitions.InternshipReportNotConfirmedByMentor);

        // Get student and mentor user information
        var studentUser = HttpContext.GetAuthenticatedUser()!;
        
        User? mentorUser = null;
        if (internship.MentorId.HasValue)
        {
            mentorUser = await _databaseContext.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Roles.Any(r => r is Domain.Mentor && r.Id == internship.MentorId), cancellationToken);
        }

        // Get internship logs for detailed report
        var logs = await _databaseContext.InternshipLogs
            .Where(l => l.Internship!.Id == request.InternshipId)
            .OrderBy(l => l.Date)
            .ToListAsync(cancellationToken);

        // Generate PDF
        var pdfBytes = GeneratePdfReport(report, logs, studentUser, mentorUser);
        var base64Content = Convert.ToBase64String(pdfBytes);
        
        var fileName = $"Internship_Report_{studentUser.FirstName}_{studentUser.LastName}_{DateTime.Now:yyyyMMdd}.pdf";

        await SendAsync(new DownloadInternshipReportPdfResult
        {
            FileName = fileName,
            ContentBase64 = base64Content,
            MimeType = "application/pdf",
            FileSize = pdfBytes.Length
        }, cancellation: cancellationToken);
    }

    private static byte[] GeneratePdfReport(InternshipReport report, List<InternshipLog> logs, User studentUser, User? mentorUser)
    {
        using var memoryStream = new MemoryStream();
        using var writer = new PdfWriter(memoryStream);
        using var pdf = new PdfDocument(writer);
        using var document = new Document(pdf);

        var internship = report.Internship!;
        var provider = internship.InternshipProvider;

        // Create fonts
        var regularFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
        var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

        // Title
        var titleText = new Text("IZVJEŠTAJ O PRAKSI").SetFont(boldFont);
        document.Add(new Paragraph(titleText)
            .SetTextAlignment(TextAlignment.CENTER)
            .SetFontSize(20)
            .SetMarginBottom(20));

        // Basic Information Section
        var sectionTitleText = new Text("OSNOVNE INFORMACIJE").SetFont(boldFont);
        document.Add(new Paragraph(sectionTitleText)
            .SetFontSize(14)
            .SetMarginTop(20)
            .SetMarginBottom(10));

        var infoTable = new Table(2).UseAllAvailableWidth();
        infoTable.SetBorder(Border.NO_BORDER);

        AddTableRow(infoTable, "Student:", $"{studentUser.FirstName} {studentUser.LastName}", boldFont, regularFont);
        AddTableRow(infoTable, "Email:", studentUser.EmailAddress, boldFont, regularFont);
        AddTableRow(infoTable, "Razina studija:", GetStudyLevelText(internship.StudyLevel), boldFont, regularFont);
        
        if (mentorUser != null)
            AddTableRow(infoTable, "Mentor:", $"{mentorUser.FirstName} {mentorUser.LastName}", boldFont, regularFont);
        
        if (provider != null)
            AddTableRow(infoTable, "Poslodavac:", provider.Name ?? "N/A", boldFont, regularFont);
        
        if (internship.StartDate.HasValue)
            AddTableRow(infoTable, "Datum početka:", internship.StartDate.Value.ToString("dd.MM.yyyy"), boldFont, regularFont);
        
        if (internship.EndDate.HasValue)
            AddTableRow(infoTable, "Datum završetka:", internship.EndDate.Value.ToString("dd.MM.yyyy"), boldFont, regularFont);

        AddTableRow(infoTable, "Status prakse:", GetInternshipStatusText(internship.Status), boldFont, regularFont);
        AddTableRow(infoTable, "Ukupno sati:", $"{report.TotalHoursWorked:F1}", boldFont, regularFont);
        AddTableRow(infoTable, "Broj unosa:", report.TotalLogEntries.ToString(), boldFont, regularFont);
        
        if (report.Grade.HasValue)
            AddTableRow(infoTable, "Ocjena:", $"{report.Grade.Value}/5", boldFont, regularFont);
        
        if (report.ConfirmedAt.HasValue)
            AddTableRow(infoTable, "Potvrđeno:", report.ConfirmedAt.Value.ToString("dd.MM.yyyy HH:mm"), boldFont, regularFont);

        document.Add(infoTable);

        // Mentor Content Section
        if (!string.IsNullOrWhiteSpace(report.MentorContent))
        {
            var mentorSectionText = new Text("KOMENTAR MENTORA").SetFont(boldFont);
            document.Add(new Paragraph(mentorSectionText)
                .SetFontSize(14)
                .SetMarginTop(20)
                .SetMarginBottom(10));

            document.Add(new Paragraph(report.MentorContent)
                .SetMarginBottom(20)
                .SetBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1))
                .SetPadding(10));
        }

        // Logs Section
        if (logs.Any())
        {
            var logsSectionText = new Text("DNEVNIK RADA").SetFont(boldFont);
            document.Add(new Paragraph(logsSectionText)
                .SetFontSize(14)
                .SetMarginTop(20)
                .SetMarginBottom(10));

            var logsTable = new Table(new float[] { 2, 1, 2, 4, 3 }).UseAllAvailableWidth();
            logsTable.SetBorder(new SolidBorder(ColorConstants.BLACK, 1));

            // Headers
            AddTableHeader(logsTable, "Datum", boldFont);
            AddTableHeader(logsTable, "Sati", boldFont);
            AddTableHeader(logsTable, "Lokacija", boldFont);
            AddTableHeader(logsTable, "Opis aktivnosti", boldFont);
            AddTableHeader(logsTable, "Povratne informacije", boldFont);

            foreach (var log in logs)
            {
                AddTableCell(logsTable, log.Date.ToString("dd.MM.yyyy"), regularFont);
                AddTableCell(logsTable, $"{log.NumberOfWorkingHours:F1}", regularFont);
                AddTableCell(logsTable, GetWorkLocationText(log.Location), regularFont);
                AddTableCell(logsTable, log.Description ?? "", regularFont);
                AddTableCell(logsTable, log.Feedback ?? "", regularFont);
            }

            document.Add(logsTable);
        }

        // Footer
        document.Add(new Paragraph($"Izvještaj generiran: {DateTime.Now:dd.MM.yyyy HH:mm}")
            .SetTextAlignment(TextAlignment.RIGHT)
            .SetFontSize(10)
            .SetMarginTop(30)
            .SetFontColor(ColorConstants.GRAY));

        document.Close();
        return memoryStream.ToArray();
    }

    private static void AddTableRow(Table table, string label, string value, PdfFont boldFont, PdfFont regularFont)
    {
        var labelText = new Text(label).SetFont(boldFont);
        var valueText = new Text(value).SetFont(regularFont);
        table.AddCell(new Cell().Add(new Paragraph(labelText)).SetBorder(Border.NO_BORDER));
        table.AddCell(new Cell().Add(new Paragraph(valueText)).SetBorder(Border.NO_BORDER));
    }

    private static void AddTableHeader(Table table, string text, PdfFont boldFont)
    {
        var headerText = new Text(text).SetFont(boldFont);
        table.AddHeaderCell(new Cell().Add(new Paragraph(headerText))
            .SetBackgroundColor(ColorConstants.LIGHT_GRAY)
            .SetBorder(new SolidBorder(ColorConstants.BLACK, 1))
            .SetPadding(5));
    }

    private static void AddTableCell(Table table, string text, PdfFont regularFont)
    {
        var cellText = new Text(text).SetFont(regularFont);
        table.AddCell(new Cell().Add(new Paragraph(cellText))
            .SetBorder(new SolidBorder(ColorConstants.GRAY, 0.5f))
            .SetPadding(5));
    }

    private static string GetStudyLevelText(StudyLevel level) => level switch
    {
        StudyLevel.Undergraduate => "Preddiplomski",
        StudyLevel.Graduate => "Diplomski",
        _ => level.ToString()
    };

    private static string GetInternshipStatusText(InternshipStatus status) => status switch
    {
        InternshipStatus.Pending => "Na čekanju",
        InternshipStatus.Accepted => "Prihvaćena",
        InternshipStatus.Rejected => "Odbijena",
        InternshipStatus.Completed => "Završena",
        _ => status.ToString()
    };

    private static string GetWorkLocationText(WorkLocation location) => location switch
    {
        WorkLocation.Onsite => "Ured",
        WorkLocation.Remote => "Udaljeno",
        WorkLocation.Field => "Teren",
        _ => location.ToString()
    };
} 