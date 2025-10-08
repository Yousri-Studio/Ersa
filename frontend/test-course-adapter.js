// Test the course adapter functions
const testCourse = {
  id: "test-id",
  slug: "test-slug", 
  title: { en: "Test Course", ar: "دورة تجريبية" },
  summary: { en: "Test Summary", ar: "ملخص تجريبي" },
  description: { en: "Test Description", ar: "وصف تجريبي" },
  price: 100,
  currency: "SAR",
  type: 1, // Live course
  level: 1,
  category: 1,
  videoUrl: "test-video",
  duration: {
    ar: "30 ساعة",
    en: "30 hours"
  },
  instructorName: "Test Instructor",
  photo: [255, 216, 255, 224, 0, 16, 74, 70, 73, 70], // Sample image data
  tags: "",
  instructorsBio: { en: "", ar: "" },
  isActive: true,
  isFeatured: true,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z"
};

console.log("Test course object:");
console.log("Type:", testCourse.type, "- Should be 1 for Live");
console.log("Photo:", testCourse.photo ? "Has photo data" : "No photo");
console.log("Category:", testCourse.category);

// Test badge mapping logic directly
const getCourseBadge = (course) => {
  if (course.type === 1) return 'new';      // Live courses get 'new' badge
  if (course.type === 0) return 'bestseller'; // PDF courses get 'bestseller' badge
  return null;
};

console.log("Expected badge:", getCourseBadge(testCourse), "- Should be 'new' for Live course");

// Test with PDF course
const pdfCourse = { ...testCourse, type: 0 };
console.log("PDF course badge:", getCourseBadge(pdfCourse), "- Should be 'bestseller' for PDF course");
