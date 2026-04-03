const express = require('express');
const router = express.Router();

const {
  // Admin functions
  createCourse,
  getAllCoursesForAdmin,
  getCourseByIdForAdmin,
  updateCourse,
  deleteCourse,
  addModuleToCourse,
  updateModule,
  deleteModule,
  addLessonToModule,
  updateLesson,
  deleteLesson,

  // Public functions
  getAllPublishedCourses,
  getPublicCourseDetails,

  // User Enrollment functions
  enrollInFreeCourse,
  markLessonAsComplete,
  getEnrolledCourse,
  getMyEnrollments,
  enrollInPaidCourse

} = require('../controllers/courseController');

const { protect, authorize } = require('../middleware/auth');


// --- (1) PUBLIC ROUTES ---
// These routes are accessible to anyone and are defined first.
router.get('/public', getAllPublishedCourses);
router.get('/public/:id', getPublicCourseDetails);


// --- (2) USER-SPECIFIC PROTECTED ROUTES ---
// These routes require a user to be logged in, but not necessarily an admin.
// The 'protect' middleware is applied individually to each route.
router.post('/:courseId/enroll', protect, enrollInFreeCourse);
router.post('/lessons/:lessonId/complete', protect, markLessonAsComplete);
router.get('/:courseId/enrolled', protect, getEnrolledCourse);
router.get('/my-enrollments', protect, getMyEnrollments);
router.post('/:courseId/enroll-paid', protect, enrollInPaidCourse);

// --- (3) ADMIN-ONLY ROUTES ---
// The middleware below applies to all routes defined AFTER this point.
// Any request to a route below this line must be from a logged-in admin.
router.use(protect, authorize('admin'));

// Course Management Routes
router.route('/')
  .post(createCourse)
  .get(getAllCoursesForAdmin);

router.route('/:id')
  .get(getCourseByIdForAdmin)
  .put(updateCourse)
  .delete(deleteCourse);

// Module Management Routes
router.route('/:courseId/modules')
  .post(addModuleToCourse);

router.route('/modules/:moduleId')
  .put(updateModule)
  .delete(deleteModule);

// Lesson Management Routes
router.route('/modules/:moduleId/lessons')
  .post(addLessonToModule);
  
router.route('/lessons/:lessonId')
  .put(updateLesson)
  .delete(deleteLesson);


module.exports = router;