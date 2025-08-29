using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ErsaTraining.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseNewFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "Courses",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Courses",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstructorName",
                table: "Courses",
                type: "TEXT",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "InstructorName",
                table: "Courses");

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
    }
}
