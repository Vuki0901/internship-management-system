using InternshipManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InternshipManagementSystem.Persistency.EntityTypeConfigurations;

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        // Override the global 4000-character limit for base-64 content
        builder.Property(d => d.ContentBase64)
               .HasColumnType("nvarchar(max)") // unlimited length
               .IsRequired();

        // Configure relationship to User (who uploaded the document)
        builder.HasOne(d => d.UploadedByUser) // navigation
               .WithMany()                   // no back-reference collection needed
               .HasForeignKey(d => d.UploadedBy) // use UploadedBy as FK column
               .OnDelete(DeleteBehavior.Cascade);
    }
}
