using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ErsaTraining.API.Migrations
{
    /// <inheritdoc />
    public partial class missing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("0fe8df77-3ec2-4511-a9c1-2a8e850ac061"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("1e15ad9d-a1e9-47c8-963c-542e4a10fb06"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("217b867a-6300-4a48-9203-c3402d111430"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("3fe25ac6-7d19-4b2c-aa38-1c53044afe51"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("4af1fca1-ec21-4e73-ba4b-8017a39fb181"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("5b4cfeab-b89f-458c-a00b-da5f8e10161b"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("a62ff65d-0199-4877-8850-e5fc49b7e81f"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("e5baf98f-924b-44dc-871b-9968d1c529af"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("751a999a-7882-4fef-a16e-aa4be9d02344"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("ae9c1fac-52e0-4f51-8f65-fd7ff062def3"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("e2ed7c6a-ee45-46bb-991e-eff9b226a3e1"));

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("4620ba0f-597d-4e51-8787-685bf46ab31b"), new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2471), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2471) },
                    { new Guid("9f37dfbb-60fc-4aaf-a666-0833b83c4abc"), new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2485), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2485) },
                    { new Guid("cbfcf3a4-172d-4c16-bd6f-a23d9ddde5c6"), new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2488), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2488) },
                    { new Guid("d0483703-c630-4369-9432-e12aa7f12e60"), new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2467), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2468) },
                    { new Guid("dcfad677-1e68-4908-8e39-4726970ebc86"), new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2474), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2474) },
                    { new Guid("f07327ee-3396-438f-9f15-5a8c9147f30c"), new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2494), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2494) },
                    { new Guid("f998e9db-3f1a-424a-86ab-fa82eaeae5f7"), new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2011), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2242) },
                    { new Guid("fbccea55-edbf-4ce3-a412-2cc4c0829698"), new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2491), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 29, 21, 50, 20, 945, DateTimeKind.Utc).AddTicks(2491) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("00e15e64-5a4b-4c3c-95dc-ceeea809ec4e"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 29, 21, 50, 20, 944, DateTimeKind.Utc).AddTicks(3944), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 21, 50, 20, 944, DateTimeKind.Utc).AddTicks(3945) },
                    { new Guid("cd6096ae-c09e-477c-a3b7-545dab9e60ff"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 29, 21, 50, 20, 944, DateTimeKind.Utc).AddTicks(3948), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 21, 50, 20, 944, DateTimeKind.Utc).AddTicks(3948) },
                    { new Guid("ee20f2a5-3aa1-414b-baa7-d7bdd796c90a"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 29, 21, 50, 20, 944, DateTimeKind.Utc).AddTicks(3483), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 29, 21, 50, 20, 944, DateTimeKind.Utc).AddTicks(3720) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("4620ba0f-597d-4e51-8787-685bf46ab31b"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("9f37dfbb-60fc-4aaf-a666-0833b83c4abc"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("cbfcf3a4-172d-4c16-bd6f-a23d9ddde5c6"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("d0483703-c630-4369-9432-e12aa7f12e60"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("dcfad677-1e68-4908-8e39-4726970ebc86"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("f07327ee-3396-438f-9f15-5a8c9147f30c"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("f998e9db-3f1a-424a-86ab-fa82eaeae5f7"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("fbccea55-edbf-4ce3-a412-2cc4c0829698"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("00e15e64-5a4b-4c3c-95dc-ceeea809ec4e"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("cd6096ae-c09e-477c-a3b7-545dab9e60ff"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("ee20f2a5-3aa1-414b-baa7-d7bdd796c90a"));

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("0fe8df77-3ec2-4511-a9c1-2a8e850ac061"), new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8571), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8572) },
                    { new Guid("1e15ad9d-a1e9-47c8-963c-542e4a10fb06"), new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8577), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8578) },
                    { new Guid("217b867a-6300-4a48-9203-c3402d111430"), new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8549), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8549) },
                    { new Guid("3fe25ac6-7d19-4b2c-aa38-1c53044afe51"), new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8568), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8569) },
                    { new Guid("4af1fca1-ec21-4e73-ba4b-8017a39fb181"), new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8574), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8575) },
                    { new Guid("5b4cfeab-b89f-458c-a00b-da5f8e10161b"), new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8545), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8546) },
                    { new Guid("a62ff65d-0199-4877-8850-e5fc49b7e81f"), new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8064), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8310) },
                    { new Guid("e5baf98f-924b-44dc-871b-9968d1c529af"), new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8565), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 29, 21, 2, 14, 549, DateTimeKind.Utc).AddTicks(8566) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("751a999a-7882-4fef-a16e-aa4be9d02344"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 29, 21, 2, 14, 548, DateTimeKind.Utc).AddTicks(9250), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 21, 2, 14, 548, DateTimeKind.Utc).AddTicks(9250) },
                    { new Guid("ae9c1fac-52e0-4f51-8f65-fd7ff062def3"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 29, 21, 2, 14, 548, DateTimeKind.Utc).AddTicks(8596), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 29, 21, 2, 14, 548, DateTimeKind.Utc).AddTicks(9009) },
                    { new Guid("e2ed7c6a-ee45-46bb-991e-eff9b226a3e1"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 29, 21, 2, 14, 548, DateTimeKind.Utc).AddTicks(9246), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 29, 21, 2, 14, 548, DateTimeKind.Utc).AddTicks(9246) }
                });
        }
    }
}
