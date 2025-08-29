using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ErsaTraining.API.Migrations
{
    /// <inheritdoc />
    public partial class YourMigrationName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("1fb4de47-8e80-41fd-848c-ecce6505651d"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("51674142-a47d-4d25-bc84-a28fdb39e295"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("57a17fa9-dea8-46e3-9241-e3b47d0e4e35"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("5bcc620c-e2d2-45c9-ac63-53c98b789066"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("6dbb8f2a-f1b9-47b9-a25e-99094bdc9fb2"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("90d5a015-5d8a-42c8-ab6d-d90024431d9c"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("92d2579f-0c79-423f-9936-72d66b3704b7"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("d4e06e6f-f6f0-4312-81de-67f9f0b23f88"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("63a7762b-4efc-4e7b-9c62-e0dcaabf3415"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("88db7805-767a-4490-8cef-12cd09d3a2f6"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("c50fe399-21d9-44e3-babe-3d074fa13d66"));

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("12937c8c-4073-4976-92a0-dc13ff5f1178"), new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3774), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3775) },
                    { new Guid("267ecd73-5541-428a-a4f8-1c0fd59d74f1"), new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3128), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3456) },
                    { new Guid("3a74992c-afb3-4c06-ad72-1af69bac66ef"), new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3767), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3768) },
                    { new Guid("5a858fba-348a-4f34-85cf-7ed9218bb617"), new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3771), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3772) },
                    { new Guid("717bda13-3986-4996-9a15-784f38a9a129"), new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3952), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3953) },
                    { new Guid("a94037c0-e23c-426d-870f-b69f823b694d"), new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3933), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3935) },
                    { new Guid("b7d764a2-4200-4ac3-8355-4d47405b8f03"), new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3797), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3797) },
                    { new Guid("be1464fb-4854-4647-bd68-8c6db9d4a945"), new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3955), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 29, 19, 25, 36, 404, DateTimeKind.Utc).AddTicks(3956) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("2330cbd3-f497-4d0a-b1b7-96a854cbfc58"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 29, 19, 25, 36, 402, DateTimeKind.Utc).AddTicks(8337), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 19, 25, 36, 402, DateTimeKind.Utc).AddTicks(8338) },
                    { new Guid("4b1cb102-5477-43bb-8b9d-b9c6f4931d93"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 29, 19, 25, 36, 402, DateTimeKind.Utc).AddTicks(7865), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 29, 19, 25, 36, 402, DateTimeKind.Utc).AddTicks(8104) },
                    { new Guid("ea5dcba6-e76b-427b-bd26-2d260b3fac55"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 29, 19, 25, 36, 402, DateTimeKind.Utc).AddTicks(8341), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 19, 25, 36, 402, DateTimeKind.Utc).AddTicks(8341) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("12937c8c-4073-4976-92a0-dc13ff5f1178"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("267ecd73-5541-428a-a4f8-1c0fd59d74f1"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("3a74992c-afb3-4c06-ad72-1af69bac66ef"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("5a858fba-348a-4f34-85cf-7ed9218bb617"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("717bda13-3986-4996-9a15-784f38a9a129"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("a94037c0-e23c-426d-870f-b69f823b694d"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("b7d764a2-4200-4ac3-8355-4d47405b8f03"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("be1464fb-4854-4647-bd68-8c6db9d4a945"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("2330cbd3-f497-4d0a-b1b7-96a854cbfc58"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("4b1cb102-5477-43bb-8b9d-b9c6f4931d93"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("ea5dcba6-e76b-427b-bd26-2d260b3fac55"));

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("1fb4de47-8e80-41fd-848c-ecce6505651d"), new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3628), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3629) },
                    { new Guid("51674142-a47d-4d25-bc84-a28fdb39e295"), new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(2365), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(2771) },
                    { new Guid("57a17fa9-dea8-46e3-9241-e3b47d0e4e35"), new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3679), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3680) },
                    { new Guid("5bcc620c-e2d2-45c9-ac63-53c98b789066"), new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3687), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3688) },
                    { new Guid("6dbb8f2a-f1b9-47b9-a25e-99094bdc9fb2"), new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3618), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3619) },
                    { new Guid("90d5a015-5d8a-42c8-ab6d-d90024431d9c"), new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3669), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3670) },
                    { new Guid("92d2579f-0c79-423f-9936-72d66b3704b7"), new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3696), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3697) },
                    { new Guid("d4e06e6f-f6f0-4312-81de-67f9f0b23f88"), new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3636), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 29, 19, 24, 14, 909, DateTimeKind.Utc).AddTicks(3637) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("63a7762b-4efc-4e7b-9c62-e0dcaabf3415"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 29, 19, 24, 14, 906, DateTimeKind.Utc).AddTicks(8754), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 19, 24, 14, 906, DateTimeKind.Utc).AddTicks(8755) },
                    { new Guid("88db7805-767a-4490-8cef-12cd09d3a2f6"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 29, 19, 24, 14, 906, DateTimeKind.Utc).AddTicks(7648), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 29, 19, 24, 14, 906, DateTimeKind.Utc).AddTicks(8127) },
                    { new Guid("c50fe399-21d9-44e3-babe-3d074fa13d66"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 29, 19, 24, 14, 906, DateTimeKind.Utc).AddTicks(8749), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 19, 24, 14, 906, DateTimeKind.Utc).AddTicks(8750) }
                });
        }
    }
}
