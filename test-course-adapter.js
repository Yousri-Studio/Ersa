// Test the course adapter functions with actual API data
console.log('Testing course adapter functions...');

// Simulate the API response data
const testCourse = {
  "id": "7bdfcf94-0817-46ae-827d-383c9c28d092",
  "slug": "web-development-bootcamp",
  "title": {
    "ar": "معسكر تطوير الويب",
    "en": "Web Development Bootcamp"
  },
  "summary": {
    "ar": "",
    "en": ""
  },
  "description": {
    "ar": "دورة تطوير الويب الشاملة تغطي HTML و CSS و JavaScript و React و Node.js وإدارة قواعد البيانات.",
    "en": "Full-stack web development course covering HTML, CSS, JavaScript, React, Node.js, and database management."
  },
  "price": 499.99,
  "currency": "SAR",
  "type": 1,
  "level": 3,
  "category": 3,
  "videoUrl": "https://www.youtube.com/watch?v=vlLVTLXCZRg",
  "duration": null,
  "instructorName": "Aly",
  "photo": null,
  "tags": null,
  "instructorsBio": {
    "ar": "",
    "en": ""
  },
  "isActive": true,
  "isFeatured": true,
  "createdAt": "2025-08-30T04:06:13.3492307",
  "updatedAt": "2025-08-30T04:06:13.3492307"
};

// Test badge generation
function getCourseBadge(course) {
  if (course.type === 1) return 'new';      // Live courses get 'new' badge
  if (course.type === 0) return 'bestseller'; // PDF courses get 'bestseller' badge
  return null;
}

console.log('Course type:', testCourse.type);
console.log('Expected badge: new (for type 1)');
console.log('Generated badge:', getCourseBadge(testCourse));

// Test photo conversion
function convertPhotoToDataUrl(photo) {
  if (!photo || !Array.isArray(photo) || photo.length === 0) {
    return undefined;
  }
  return 'data:image/jpeg;base64,test'; // Simplified for testing
}

console.log('Course photo:', testCourse.photo);
console.log('Expected result: undefined (no photo)');
console.log('Generated result:', convertPhotoToDataUrl(testCourse.photo));

console.log('Test completed!');
