using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ErsaTraining.API.Migrations
{
    /// <inheritdoc />
    public partial class MissingMigrationfix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("10d7d32c-7846-4463-b286-097e6f281088"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("17e8936c-a6cd-4294-8f76-8bc9a1af9c6f"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("5149d824-ec82-408c-bc7d-27ceb8eb9818"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("819e1cce-dd3c-41d7-a218-93e5530584e7"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("97113fd5-630b-4c18-a52c-32cbabd1b852"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("a071533f-e0d7-45d1-b4b8-4fdf9bcf636b"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("a4d651b0-9232-43ae-a9f2-fb010d0edfe1"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("cb513d91-fc6d-4661-8c58-21b49f115e66"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("10416b98-d0b2-4b16-aed5-823c7cbe0819"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("a903dad1-bf00-45c0-876a-87cae4ced3e5"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("d1eba061-ada9-4b35-89e8-e22475a5ae13"));

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "EmailLogs",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true,
                oldDefaultValue: 1);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "EmailLogs",
                type: "INTEGER",
                nullable: true,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 1);

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("10d7d32c-7846-4463-b286-097e6f281088"), new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2345), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2346) },
                    { new Guid("17e8936c-a6cd-4294-8f76-8bc9a1af9c6f"), new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2331), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2331) },
                    { new Guid("5149d824-ec82-408c-bc7d-27ceb8eb9818"), new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(1841), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2082) },
                    { new Guid("819e1cce-dd3c-41d7-a218-93e5530584e7"), new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2321), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2321) },
                    { new Guid("97113fd5-630b-4c18-a52c-32cbabd1b852"), new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2337), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2337) },
                    { new Guid("a071533f-e0d7-45d1-b4b8-4fdf9bcf636b"), new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2328), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2328) },
                    { new Guid("a4d651b0-9232-43ae-a9f2-fb010d0edfe1"), new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2325), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2325) },
                    { new Guid("cb513d91-fc6d-4661-8c58-21b49f115e66"), new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2334), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 29, 19, 22, 15, 860, DateTimeKind.Utc).AddTicks(2334) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("10416b98-d0b2-4b16-aed5-823c7cbe0819"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 29, 19, 22, 15, 859, DateTimeKind.Utc).AddTicks(2116), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 29, 19, 22, 15, 859, DateTimeKind.Utc).AddTicks(2368) },
                    { new Guid("a903dad1-bf00-45c0-876a-87cae4ced3e5"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 29, 19, 22, 15, 859, DateTimeKind.Utc).AddTicks(2613), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 19, 22, 15, 859, DateTimeKind.Utc).AddTicks(2613) },
                    { new Guid("d1eba061-ada9-4b35-89e8-e22475a5ae13"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 29, 19, 22, 15, 859, DateTimeKind.Utc).AddTicks(2628), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 19, 22, 15, 859, DateTimeKind.Utc).AddTicks(2628) }
                });
        }
    }
}
