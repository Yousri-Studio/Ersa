using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ErsaTraining.API.Migrations
{
    /// <inheritdoc />
    public partial class addLevel_to_Course : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("01d7b0f0-9133-44b4-ac9c-e6a99636c21a"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("2ed13c42-2486-4ff6-b085-45fb239fcdaa"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("305220f6-6c44-49c5-957e-c6e6df4337d3"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("4562f2d4-cde2-463e-a521-e6e50dd74ac3"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("955bb687-c935-4a53-a764-b3d869d868d6"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("a174bcca-bf8f-4936-b5ab-89dd9017fe10"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("df478517-4af6-4637-b045-63337db56f44"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("fbb7c634-4531-4aa2-a76d-14ac0798f820"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("2bf1aa21-e832-4d6f-a3aa-f1ed647ebfca"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("5d3ad09e-d900-4399-8d09-a9ae24f92c1c"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("e228d662-0fb5-4ec7-a430-bf3cbdca7c42"));

            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "Courses",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("0da5c5a4-8d40-4e96-911e-4a4c8806d97c"), new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1065), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1065) },
                    { new Guid("1af074ec-135e-4c2c-8c3e-b7317d5459c2"), new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1051), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1052) },
                    { new Guid("634cd86f-4a71-4036-b5d3-1f771ab23812"), new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(583), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(815) },
                    { new Guid("8be4f63a-c840-4d96-abbe-12fe122f2813"), new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1062), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1062) },
                    { new Guid("98435e70-0d98-4c3a-9cac-cdefdc368f3f"), new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1070), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1071) },
                    { new Guid("a99ab858-3308-4e99-a154-79647f277d75"), new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1045), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1046) },
                    { new Guid("ae5811a7-867a-4bd3-831c-800584fdb22c"), new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1048), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1049) },
                    { new Guid("de4c7795-4e96-4fad-b63c-c6b7d2fb7061"), new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1068), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 29, 17, 54, 57, 735, DateTimeKind.Utc).AddTicks(1068) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("1d8698d8-71f5-474a-b25c-3cb355b9d91e"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 29, 17, 54, 57, 734, DateTimeKind.Utc).AddTicks(2942), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 17, 54, 57, 734, DateTimeKind.Utc).AddTicks(2942) },
                    { new Guid("949e6ff4-20dd-4ee4-826b-0c5f1359edf4"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 29, 17, 54, 57, 734, DateTimeKind.Utc).AddTicks(2945), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 17, 54, 57, 734, DateTimeKind.Utc).AddTicks(2945) },
                    { new Guid("cbb89ebf-76b1-4259-b75b-fee97059daf7"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 29, 17, 54, 57, 734, DateTimeKind.Utc).AddTicks(2480), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 29, 17, 54, 57, 734, DateTimeKind.Utc).AddTicks(2715) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("0da5c5a4-8d40-4e96-911e-4a4c8806d97c"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("1af074ec-135e-4c2c-8c3e-b7317d5459c2"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("634cd86f-4a71-4036-b5d3-1f771ab23812"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("8be4f63a-c840-4d96-abbe-12fe122f2813"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("98435e70-0d98-4c3a-9cac-cdefdc368f3f"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("a99ab858-3308-4e99-a154-79647f277d75"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("ae5811a7-867a-4bd3-831c-800584fdb22c"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("de4c7795-4e96-4fad-b63c-c6b7d2fb7061"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("1d8698d8-71f5-474a-b25c-3cb355b9d91e"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("949e6ff4-20dd-4ee4-826b-0c5f1359edf4"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("cbb89ebf-76b1-4259-b75b-fee97059daf7"));

            migrationBuilder.DropColumn(
                name: "Level",
                table: "Courses");

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("01d7b0f0-9133-44b4-ac9c-e6a99636c21a"), new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9820), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9820) },
                    { new Guid("2ed13c42-2486-4ff6-b085-45fb239fcdaa"), new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9807), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9807) },
                    { new Guid("305220f6-6c44-49c5-957e-c6e6df4337d3"), new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9814), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9814) },
                    { new Guid("4562f2d4-cde2-463e-a521-e6e50dd74ac3"), new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9829), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9830) },
                    { new Guid("955bb687-c935-4a53-a764-b3d869d868d6"), new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9826), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9826) },
                    { new Guid("a174bcca-bf8f-4936-b5ab-89dd9017fe10"), new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9832), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9833) },
                    { new Guid("df478517-4af6-4637-b045-63337db56f44"), new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9817), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9817) },
                    { new Guid("fbb7c634-4531-4aa2-a76d-14ac0798f820"), new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9811), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9811) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("2bf1aa21-e832-4d6f-a3aa-f1ed647ebfca"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9648), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9648) },
                    { new Guid("5d3ad09e-d900-4399-8d09-a9ae24f92c1c"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9639), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9640) },
                    { new Guid("e228d662-0fb5-4ec7-a430-bf3cbdca7c42"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9645), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 7, 25, 53, 680, DateTimeKind.Utc).AddTicks(9645) }
                });
        }
    }
}
