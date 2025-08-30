using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ErsaTraining.API.Migrations
{
    /// <inheritdoc />
    public partial class updateCourseColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Courses",
                type: "INTEGER",
                nullable: false,
                defaultValue: 2,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "Level",
                table: "Courses",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "InstructorName",
                table: "Courses",
                type: "TEXT",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Courses",
                type: "TEXT",
                maxLength: 1000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Category",
                table: "Courses",
                type: "INTEGER",
                nullable: false,
                defaultValue: 2,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.InsertData(
                table: "ContentPages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "PageKey", "PageName", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("01506179-ea6c-4dce-8ab1-58a5e857800a"), new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2841), "Artificial Intelligence services", true, "ai-solutions", "AI Solutions", new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2841) },
                    { new Guid("07a7a667-0f39-4447-8f5a-bceaedd29c90"), new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2833), "Our services overview", true, "services", "Services", new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2833) },
                    { new Guid("0f9b56de-77f2-4142-9f85-1d239780a24c"), new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2879), "Administrative consulting services", true, "admin-consulting", "Administrative Consulting", new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2879) },
                    { new Guid("1bd09288-2fbc-462f-b17c-aa7115b87333"), new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2838), "Available training courses", true, "courses", "Courses", new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2838) },
                    { new Guid("3a4feb4a-c720-4928-b010-7df4bc141d92"), new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2812), "Company information and mission", true, "about", "About Us", new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2812) },
                    { new Guid("3dafea9c-991d-4450-9983-bd1152574b90"), new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2816), "Contact information and form", true, "contact", "Contact Us", new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2817) },
                    { new Guid("7048c3fe-a0d3-4428-8870-76c172ba82eb"), new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2821), "Frequently asked questions", true, "faq", "FAQ", new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2821) },
                    { new Guid("e48b6230-3b72-4cc8-b56a-4389847de6a8"), new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(1988), "Main landing page of the website", true, "home", "Home Page", new DateTime(2025, 8, 30, 3, 41, 53, 596, DateTimeKind.Utc).AddTicks(2397) }
                });

            migrationBuilder.InsertData(
                table: "EmailTemplates",
                columns: new[] { "Id", "BodyHtmlAr", "BodyHtmlEn", "CreatedAt", "Key", "SubjectAr", "SubjectEn", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("0c79d088-1792-4cb9-9217-32b94e80d2ca"), "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}", "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}", new DateTime(2025, 8, 30, 3, 41, 53, 594, DateTimeKind.Utc).AddTicks(8019), "MaterialsDelivery", "مواد الدورة - {{CourseTitleAr}}", "Course Materials - {{CourseTitleEn}}", new DateTime(2025, 8, 30, 3, 41, 53, 594, DateTimeKind.Utc).AddTicks(8019) },
                    { new Guid("4f80b621-5df1-4764-bf48-e787be3a12cc"), "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>", "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>", new DateTime(2025, 8, 30, 3, 41, 53, 594, DateTimeKind.Utc).AddTicks(8014), "LiveDetails", "تفاصيل الدورة المباشرة - {{CourseTitleAr}}", "Live Course Details - {{CourseTitleEn}}", new DateTime(2025, 8, 30, 3, 41, 53, 594, DateTimeKind.Utc).AddTicks(8015) },
                    { new Guid("fd0830b9-35a2-496d-b024-b896031c5db1"), "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>", "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>", new DateTime(2025, 8, 30, 3, 41, 53, 594, DateTimeKind.Utc).AddTicks(7342), "Welcome", "مرحباً بك في إرساء للتدريب", "Welcome to Ersa Training", new DateTime(2025, 8, 30, 3, 41, 53, 594, DateTimeKind.Utc).AddTicks(7669) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("01506179-ea6c-4dce-8ab1-58a5e857800a"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("07a7a667-0f39-4447-8f5a-bceaedd29c90"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("0f9b56de-77f2-4142-9f85-1d239780a24c"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("1bd09288-2fbc-462f-b17c-aa7115b87333"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("3a4feb4a-c720-4928-b010-7df4bc141d92"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("3dafea9c-991d-4450-9983-bd1152574b90"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("7048c3fe-a0d3-4428-8870-76c172ba82eb"));

            migrationBuilder.DeleteData(
                table: "ContentPages",
                keyColumn: "Id",
                keyValue: new Guid("e48b6230-3b72-4cc8-b56a-4389847de6a8"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("0c79d088-1792-4cb9-9217-32b94e80d2ca"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("4f80b621-5df1-4764-bf48-e787be3a12cc"));

            migrationBuilder.DeleteData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: new Guid("fd0830b9-35a2-496d-b024-b896031c5db1"));

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Courses",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 2);

            migrationBuilder.AlterColumn<int>(
                name: "Level",
                table: "Courses",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 1);

            migrationBuilder.AlterColumn<string>(
                name: "InstructorName",
                table: "Courses",
                type: "TEXT",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Courses",
                type: "TEXT",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 1000,
                oldDefaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "Category",
                table: "Courses",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 2);

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
    }
}
