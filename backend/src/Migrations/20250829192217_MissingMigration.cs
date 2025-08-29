using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ErsaTraining.API.Migrations
{
    /// <inheritdoc />
    public partial class MissingMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("03cff99c-ce27-4f2b-a75b-ee0791f7faf7"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("2486e34d-1aa7-4f1a-8d03-bc3b07984e1d"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("381472ab-60ed-48cf-8178-96ff1bc96494"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("41794009-4403-4626-bdba-18d679b0d8a4"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("4832a76a-fcb6-4838-a0a3-2132bbe4228e"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("9129fda5-9843-4b63-9a0d-853e8dabb0dc"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("b784e49b-1c28-4667-ac01-c01d09a5f243"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("cdf9af5e-0cf0-4497-a471-1e3399dae397"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("14b21d21-962a-44ad-916a-6dc4793e060c"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("1b10b786-eee9-4ce6-b53d-d4bb89847610"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("71b11239-2933-41db-9b4c-8e5f00678492"));

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("03cff99c-ce27-4f2b-a75b-ee0791f7faf7"), new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(260), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(261) },
                    { new Guid("2486e34d-1aa7-4f1a-8d03-bc3b07984e1d"), new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(264), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(264) },
                    { new Guid("381472ab-60ed-48cf-8178-96ff1bc96494"), new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(258), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(258) },
                    { new Guid("41794009-4403-4626-bdba-18d679b0d8a4"), new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(266), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(267) },
                    { new Guid("4832a76a-fcb6-4838-a0a3-2132bbe4228e"), new DateTime(2025, 8, 29, 19, 21, 39, 712, DateTimeKind.Utc).AddTicks(9752), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc) },
                    { new Guid("9129fda5-9843-4b63-9a0d-853e8dabb0dc"), new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(242), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(242) },
                    { new Guid("b784e49b-1c28-4667-ac01-c01d09a5f243"), new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(269), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(270) },
                    { new Guid("cdf9af5e-0cf0-4497-a471-1e3399dae397"), new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(245), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 29, 19, 21, 39, 713, DateTimeKind.Utc).AddTicks(245) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("14b21d21-962a-44ad-916a-6dc4793e060c"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 29, 19, 21, 39, 712, DateTimeKind.Utc).AddTicks(624), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 29, 19, 21, 39, 712, DateTimeKind.Utc).AddTicks(880) },
                    { new Guid("1b10b786-eee9-4ce6-b53d-d4bb89847610"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 29, 19, 21, 39, 712, DateTimeKind.Utc).AddTicks(1133), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 19, 21, 39, 712, DateTimeKind.Utc).AddTicks(1134) },
                    { new Guid("71b11239-2933-41db-9b4c-8e5f00678492"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 29, 19, 21, 39, 712, DateTimeKind.Utc).AddTicks(1129), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 19, 21, 39, 712, DateTimeKind.Utc).AddTicks(1130) }
                });
        }
    }
}
