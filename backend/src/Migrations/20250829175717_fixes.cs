using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ErsaTraining.API.Migrations
{
    /// <inheritdoc />
    public partial class fixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("0bc7ae26-8a8f-4d1e-b136-d74b3408cf53"), new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7908), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7908) },
                    { new Guid("1458ab68-52f5-40fe-8ae4-1c41f9006637"), new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7911), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7911) },
                    { new Guid("18df973a-1ab4-4f66-9c99-b3d58a3eff64"), new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7895), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7895) },
                    { new Guid("25e115c8-996d-48ae-9ae4-79ca3837bbb0"), new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7898), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7898) },
                    { new Guid("4527f3e6-84a4-48c0-b8d4-dec7e90d2c89"), new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7905), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7905) },
                    { new Guid("bc69cfbe-fcd8-42e9-a935-7c35719e3fbf"), new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7442), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7670) },
                    { new Guid("df722bd9-df01-4e1b-b09e-84828b8e50ee"), new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7892), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7892) },
                    { new Guid("f9286764-cafc-4da9-8d58-5a4bb668ba50"), new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7889), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 29, 17, 57, 16, 465, DateTimeKind.Utc).AddTicks(7889) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("616635ed-34ae-49a9-97c5-665a44c973e0"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 29, 17, 57, 16, 464, DateTimeKind.Utc).AddTicks(9696), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 17, 57, 16, 464, DateTimeKind.Utc).AddTicks(9696) },
                    { new Guid("96bd1da6-f886-4210-a9d2-da1c008609ad"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 29, 17, 57, 16, 464, DateTimeKind.Utc).AddTicks(9699), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 17, 57, 16, 464, DateTimeKind.Utc).AddTicks(9699) },
                    { new Guid("bcfff640-c026-4fb8-be56-960ba2fdc26b"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 29, 17, 57, 16, 464, DateTimeKind.Utc).AddTicks(9245), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 29, 17, 57, 16, 464, DateTimeKind.Utc).AddTicks(9476) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("0bc7ae26-8a8f-4d1e-b136-d74b3408cf53"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("1458ab68-52f5-40fe-8ae4-1c41f9006637"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("18df973a-1ab4-4f66-9c99-b3d58a3eff64"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("25e115c8-996d-48ae-9ae4-79ca3837bbb0"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("4527f3e6-84a4-48c0-b8d4-dec7e90d2c89"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("bc69cfbe-fcd8-42e9-a935-7c35719e3fbf"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("df722bd9-df01-4e1b-b09e-84828b8e50ee"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("f9286764-cafc-4da9-8d58-5a4bb668ba50"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("616635ed-34ae-49a9-97c5-665a44c973e0"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("96bd1da6-f886-4210-a9d2-da1c008609ad"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("bcfff640-c026-4fb8-be56-960ba2fdc26b"));

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
    }
}
