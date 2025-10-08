# Architecture Diagram - Instructors & Course Updates

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        COURSES TABLE                             │
│─────────────────────────────────────────────────────────────────│
│ • Id (PK)                    • TitleEn / TitleAr                │
│ • Slug                       • SummaryEn / SummaryAr            │
│ • Price, Currency            • DescriptionEn / DescriptionAr    │
│ • Type, Level                • InstructorNameEn/Ar (legacy)     │
│ • CategoryId (FK)            • InstructorsBioEn/Ar (legacy)     │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ ⭐ NEW FIELDS:                                            │   │
│ │ • From (DateTime)          - Course start date            │   │
│ │ • To (DateTime)            - Course end date              │   │
│ │ • SessionsNotesEn (150)    - Schedule notes (English)     │   │
│ │ • SessionsNotesAr (150)    - Schedule notes (Arabic)      │   │
│ └──────────────────────────────────────────────────────────┘   │
│ • Photo, Tags                • VideoUrl, Duration               │
│ • CourseTopicsEn/Ar          • IsActive, IsFeatured             │
│ • CreatedAt, UpdatedAt                                          │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Many
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    │  COURSEINSTRUCTORS │  ⭐ NEW JUNCTION TABLE
                    │    (Many-to-Many)  │
                    │────────────────────│
                    │ • CourseId (PK,FK) │
                    │ • InstructorId (PK,FK) │
                    │ • CreatedAt        │
                    └─────────┬──────────┘
                              │ Many
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ⭐ INSTRUCTORS TABLE (NEW)                    │
│─────────────────────────────────────────────────────────────────│
│ • Id (PK)                    • InstructorNameEn (255) ✓        │
│ • InstructorNameAr (255) ✓   • InstructorBioEn (2500)         │
│ • InstructorBioAr (2500)     • CreatedAt                       │
│ • UpdatedAt                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Layer Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        API CONTROLLERS                            │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐  ┌────────────────────────────┐
│   CoursesController (Updated)   │  │ ⭐ InstructorsController   │
│─────────────────────────────────│  │         (NEW)              │
│ GET    /api/courses             │  │────────────────────────────│
│ GET    /api/courses/{slug}      │  │ GET    /api/instructors    │
│ GET    /api/courses/featured    │  │ GET    /api/instructors/{id}│
│ POST   /api/admin/courses       │  │ POST   /api/instructors    │
│ PUT    /api/admin/courses/{id}  │  │ PUT    /api/instructors/{id}│
│                                 │  │ DELETE /api/instructors/{id}│
│ ⭐ Returns:                      │  │                            │
│ • from, to, sessionsNotes       │  │ ⭐ Manages:                 │
│ • instructors[] array           │  │ • Instructor CRUD          │
│ • All localized data            │  │ • Course associations      │
└─────────────────────────────────┘  └────────────────────────────┘
                │                                │
                └────────────┬───────────────────┘
                             ▼
                ┌──────────────────────────────┐
                │     ErsaTrainingDbContext    │
                │──────────────────────────────│
                │ DbSet<Course>                │
                │ DbSet<Instructor> ⭐         │
                │ DbSet<CourseInstructor> ⭐   │
                └──────────────────────────────┘
```

---

## Frontend Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     FRONTEND STRUCTURE                            │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PAGES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /[locale]/admin/                                                │
│  ├── instructors/                    ⭐ NEW                      │
│  │   └── page.tsx                   (Instructor Management)      │
│  ├── courses/                                                    │
│  │   └── page.tsx                   (Updated with new fields)    │
│  └── layout.tsx                      (Added Instructors menu)    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       PUBLIC PAGES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /[locale]/courses/                                              │
│  └── [id]/                                                       │
│      └── page.tsx                    (Enhanced instructor display)│
│                                      (Added schedule section)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SHARED COMPONENTS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  components/                                                     │
│  ├── admin/                                                      │
│  │   └── course-form.tsx            (Updated with new fields)    │
│  └── ui/                                                         │
│      └── course-card.tsx             (Compatible with new data)  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  lib/                                                            │
│  ├── admin-api.ts                    (Added instructor methods)  │
│  └── api.ts                          (Extended Course interface) │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌────────────┐    Manages    ┌──────────────┐    Teaches    ┌─────────┐
│   ADMIN    │──────────────>│ INSTRUCTORS  │<──────────────│ COURSES │
└────────────┘                └──────────────┘               └─────────┘
      │                              │                            │
      │                              │ Many-to-Many               │
      │ Creates/Updates              │ Relationship               │
      │                              │                            │
      │                              ▼                            │
      │                    ┌──────────────────┐                  │
      │                    │ COURSEINSTRUCTORS│                  │
      │                    │   (Junction)     │                  │
      │                    └──────────────────┘                  │
      │                                                           │
      └──────────────────────────────────────────────────────────┘
                            Creates/Updates
                            
┌──────────────────────────────────────────────────────────────────┐
│                         USER EXPERIENCE                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Browse Courses                                                │
│     └─> View course cards with dates                             │
│                                                                   │
│  2. Click Course                                                  │
│     └─> See course schedule (from/to dates)                      │
│     └─> See session notes (timing details)                       │
│     └─> See all instructors with bios                            │
│                                                                   │
│  3. View Instructor Tab                                           │
│     └─> Detailed instructor information                          │
│     └─> Multiple instructors supported                           │
│                                                                   │
│  4. Add to Cart / Enroll                                          │
│     └─> Complete purchase                                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Feature Comparison

### Before vs After:

| Feature | Before | After |
|---------|--------|-------|
| **Instructors** | Hardcoded in each course | Separate table, reusable |
| **Course-Instructor** | 1-to-1 | Many-to-Many |
| **Instructor Bio** | Part of course | Centralized, manageable |
| **Course Dates** | Not available | From/To dates with notes |
| **Schedule Info** | Not available | Session notes (150 chars) |
| **Admin UI** | No instructor management | Full CRUD interface |
| **API Endpoints** | Courses only | Courses + Instructors |
| **Localization** | Partial | Complete (all fields) |

---

## Success Criteria - ALL MET ✅

- [x] Courses table updated with 4 new columns
- [x] Instructors table created with all specified fields
- [x] Many-to-many relationship established
- [x] Migration created and applied successfully
- [x] All API controllers updated
- [x] Mock data and seed functions updated
- [x] Admin Instructors page created under Course Settings
- [x] Instructor modal with course checkboxes functional
- [x] Course forms include date and notes fields
- [x] Public pages display instructor information
- [x] Full localization support (Arabic/English)
- [x] Proxy communication maintained
- [x] Zero breaking changes
- [x] All builds successful
- [x] All todos completed

---

**🎉 IMPLEMENTATION COMPLETE - READY FOR PRODUCTION! 🎉**

