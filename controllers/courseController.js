const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Catalogue = require('../models/Catalogue');
const User = require('../models/User');

// ============================
// CATALOGUE CONTROLLERS
// ============================

/**
 * @desc    Create a new catalogue
 * @route   POST /api/courses/catalogues
 * @access  Private/Admin
 */
exports.createCatalogue = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const catalogue = await Catalogue.create(req.body);
    res.status(201).json({ success: true, data: catalogue });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A catalogue with this name already exists.' });
    }
    res.status(400).json({ success: false, message: 'Error creating catalogue', error: error.message });
  }
};

/**
 * @desc    Get all catalogues
 * @route   GET /api/courses/catalogues
 * @access  Private/Admin
 */
exports.getAllCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find({});
    res.status(200).json({ success: true, data: catalogues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update a catalogue
 * @route   PUT /api/courses/catalogues/:id
 * @access  Private/Admin
 */
exports.updateCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!catalogue) {
      return res.status(404).json({ success: false, message: 'Catalogue not found' });
    }
    res.status(200).json({ success: true, data: catalogue });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating catalogue', error: error.message });
  }
};

/**
 * @desc    Delete a catalogue
 * @route   DELETE /api/courses/catalogues/:id
 * @access  Private/Admin
 */
exports.deleteCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) {
      return res.status(404).json({ success: false, message: 'Catalogue not found' });
    }
    // Business rule: Prevent deleting a catalogue if it still contains courses
    if (catalogue.courses && catalogue.courses.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete a catalogue that contains courses. Please move or delete the courses first.' });
    }
    await catalogue.deleteOne();
    res.status(200).json({ success: true, message: 'Catalogue deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Admin
 */
exports.createCourse = async (req, res) => {
  try {
    // 1. Check if the specified catalogue exists
    const parentCatalogue = await Catalogue.findById(req.body.catalogue);
    if (!parentCatalogue) {
      return res.status(404).json({ success: false, message: 'Parent catalogue not found.' });
    }

    // 2. Create the course
    req.body.createdBy = req.user.id;
    const course = await Course.create(req.body);

    // 3. Add the new course's ID to the parent catalogue's 'courses' array
    parentCatalogue.courses.push(course._id);
    await parentCatalogue.save();

    res.status(201).json({
      success: true,
      message: 'Course created and linked to catalogue successfully.',
      data: course,
    });
  } catch (error) {
    console.error('Create course error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A course with this title already exists.' });
    }
    res.status(400).json({ success: false, message: 'Error creating course', error: error.message });
  }
};

/**
 * @desc    Get all courses for the admin panel
 * @route   GET /api/courses
 * @access  Private/Admin
 */
exports.getAllCoursesForAdmin = async (req, res) => {
  try {
    // Find all courses and sort by most recently created
    const courses = await Course.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Get all courses for admin error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get a single course by ID for the admin panel (with full details)
 * @route   GET /api/courses/:id
 * @access  Private/Admin
 */
exports.getCourseByIdForAdmin = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'modules',
      populate: {
        path: 'lessons',
        model: 'Lesson'
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: `Course not found with id of ${req.params.id}` });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Get course by ID for admin error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update a course
 * @route   PUT /api/courses/:id
 * @access  Private/Admin
 */
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: `Course not found with id of ${req.params.id}` });
    }

    // Use findByIdAndUpdate for a concise update operation.
    // { new: true } ensures the updated document is returned.
    // { runValidators: true } ensures that any updates still adhere to your schema rules.
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      data: course,
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(400).json({ success: false, message: 'Error updating course', error: error.message });
  }
};

// ... other course controllers ...

/**
 * @desc    Delete a course (and its related content and references)
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: `Course not found with id of ${req.params.id}` });
    }

    // --- Cascade Delete & Reference Removal ---
    const courseId = course._id;
    const catalogueId = course.catalogue;

    // 1. Delete all associated content
    await Lesson.deleteMany({ course: courseId });
    await Module.deleteMany({ course: courseId });
    await Enrollment.deleteMany({ course: courseId });

    // 2. Remove the course's reference from its parent catalogue
    if (catalogueId) {
      await Catalogue.findByIdAndUpdate(catalogueId, {
        $pull: { courses: courseId }
      });
    }

    // 3. Finally, delete the course itself
    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course and all related content deleted successfully.',
      data: {},
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Add a new module to a course
 * @route   POST /api/courses/:courseId/modules
 * @access  Private/Admin
 */
exports.addModuleToCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: `Course not found with id of ${req.params.courseId}` });
    }

    if (!req.body.subscriptionTier) {
      req.body.subscriptionTier = course.subscriptionTier;
    }

    // Add the course ID to the request body before creating the module
    req.body.course = req.params.courseId;

    const module = await Module.create(req.body);

    // Add the new module's ID to the course's modules array
    course.modules.push(module._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Module added successfully.',
      data: module,
    });
  } catch (error) {
    console.error('Add module error:', error);
    res.status(400).json({ success: false, message: 'Error adding module', error: error.message });
  }
};

/**
 * @desc    Update a module
 * @route   PUT /api/courses/modules/:moduleId
 * @access  Private/Admin
 */
exports.updateModule = async (req, res) => {
  try {
    let module = await Module.findById(req.params.moduleId);

    if (!module) {
      return res.status(404).json({ success: false, message: `Module not found with id of ${req.params.moduleId}` });
    }

    module = await Module.findByIdAndUpdate(req.params.moduleId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Module updated successfully.',
      data: module,
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(400).json({ success: false, message: 'Error updating module', error: error.message });
  }
};

/**
 * @desc    Delete a module (and its related lessons)
 * @route   DELETE /api/courses/modules/:moduleId
 * @access  Private/Admin
 */
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);

    if (!module) {
      return res.status(404).json({ success: false, message: `Module not found with id of ${req.params.moduleId}` });
    }

    // Before deleting the module, remove its reference from the parent course
    await Course.findByIdAndUpdate(module.course, {
      $pull: { modules: module._id }
    });

    // Also, delete all lessons within this module
    await Lesson.deleteMany({ module: module._id });

    // Finally, delete the module itself
    await module.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Module and its lessons deleted successfully.',
      data: {},
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Add a new lesson to a module
 * @route   POST /api/courses/modules/:moduleId/lessons
 * @access  Private/Admin
 */
exports.addLessonToModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);

    if (!module) {
      return res.status(404).json({ success: false, message: `Module not found with id of ${req.params.moduleId}` });
    }

    // Add the module and course IDs to the request body
    req.body.module = req.params.moduleId;
    req.body.course = module.course; // Get the course ID from the parent module

    const lesson = await Lesson.create(req.body);

    // Add the new lesson's ID to the module's lessons array
    module.lessons.push(lesson._id);
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully.',
      data: lesson,
    });
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(400).json({ success: false, message: 'Error adding lesson', error: error.message });
  }
};

/**
 * @desc    Update a lesson
 * @route   PUT /api/courses/lessons/:lessonId
 * @access  Private/Admin
 */
exports.updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ success: false, message: `Lesson not found with id of ${req.params.lessonId}` });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully.',
      data: lesson,
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(400).json({ success: false, message: 'Error updating lesson', error: error.message });
  }
};

/**
 * @desc    Delete a lesson
 * @route   DELETE /api/courses/lessons/:lessonId
 * @access  Private/Admin
 */
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ success: false, message: `Lesson not found with id of ${req.params.lessonId}` });
    }

    // Before deleting the lesson, remove its reference from the parent module
    await Module.findByIdAndUpdate(lesson.module, {
      $pull: { lessons: lesson._id }
    });

    // Finally, delete the lesson itself
    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully.',
      data: {},
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all PUBLISHED courses, grouped by catalogue
 * @route   GET /api/courses/public
 * @access  Public
 */
exports.getAllPublishedCourses = async (req, res) => {
  try {
    // Fetch all catalogues and populate their 'courses' field with only published courses
    const catalogues = await Catalogue.find({})
      .populate({
        path: 'courses',
        match: { isPublished: true }, // Only include courses that are published
        select: 'title description thumbnail level subscriptionTier',
      });

    res.status(200).json({
      success: true,
      data: catalogues,
    });
  } catch (error) {
    console.error('Get published courses error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get the public curriculum of a single PUBLISHED course
 * @route   GET /api/courses/public/:id
 * @access  Public
 */
exports.getPublicCourseDetails = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, isPublished: true })
      .populate({
        path: 'modules',
        select: 'title description order lessons', // Select fields for modules
        options: { sort: { order: 1 } }, // Sort modules by their order
        populate: {
          path: 'lessons',
          model: 'Lesson',
          select: 'title order type duration', // IMPORTANT: Exclude sensitive URLs like videoUrl
          options: { sort: { order: 1 } }, // Sort lessons within each module
        }
      });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or is not published.' });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Get public course details error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Enroll the current user in a FREE course
 * @route   POST /api/courses/:courseId/enroll
 * @access  Private
 */
exports.enrollInFreeCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    // Business logic: only allow enrollment in Free courses via this endpoint
    if (course.subscriptionTier !== 'Free') {
      return res.status(400).json({ success: false, message: 'This course requires a subscription. Please subscribe to access.' });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ user: req.user.id, course: course._id });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
    }

    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: course._id,
      subscriptionTier: 'Free',
    });

    res.status(201).json({
      success: true,
      message: `Successfully enrolled in ${course.title}.`,
      data: enrollment,
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Mark a lesson as complete for the current user
 * @route   POST /api/courses/lessons/:lessonId/complete
 * @access  Private
 */
exports.markLessonAsComplete = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    // Find the user's enrollment for this lesson's course
    const enrollment = await Enrollment.findOne({ user: req.user.id, course: lesson.course });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this course.' });
    }

    // Check if the lesson is already marked as complete
    const isAlreadyCompleted = enrollment.progress.some(p => p.lesson.equals(lesson._id));

    if (isAlreadyCompleted) {
      return res.status(200).json({ success: true, message: 'Lesson already marked as complete.' });
    }

    // Add the lesson to the progress array
    enrollment.progress.push({ lesson: lesson._id, completedAt: Date.now() });

    // Update the overall status
    if (enrollment.status === 'Not Started') {
      enrollment.status = 'In Progress';
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete.',
      data: enrollment,
    });
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get full course content for an ENROLLED user
 * @route   GET /api/courses/:courseId/enrolled
 * @access  Private
 */
exports.getEnrolledCourse = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const enrollment = await Enrollment.findOne({ user: req.user.id, course: req.params.courseId });

        if (!enrollment) {
            return res.status(403).json({ success: false, message: 'Access denied. You are not enrolled in this course.' });
        }
        
        if (user.subscription.tier === 'plus' && user.subscription.expiresAt && user.subscription.expiresAt < Date.now()) {
            return res.status(403).json({ success: false, message: 'Your subscription for this course has expired.' });
        }

        const course = await Course.findById(req.params.courseId).populate({
            path: 'modules',
            options: { sort: { order: 1 } },
            populate: {
              path: 'lessons',
              model: 'Lesson',
              options: { sort: { order: 1 } },
            }
        });
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        const courseObject = course.toObject();

        courseObject.modules.forEach(module => {
            const hasModuleAccess = 
                module.subscriptionTier === 'Free' ||
                (module.subscriptionTier === 'Plus' && (user.subscription.tier === 'plus' || user.subscription.tier === 'premium')) ||
                (module.subscriptionTier === 'Premium' && user.subscription.tier === 'premium');
            
            module.hasAccess = hasModuleAccess;

            if (!hasModuleAccess) {
                module.lessons.forEach(lesson => {
                    lesson.videoUrl = undefined;
                    lesson.notesUrl = undefined;
                    lesson.textContent = "Please subscribe to view this content.";
                });
            }
        });

        res.status(200).json({
            success: true,
            data: {
                course: courseObject,
                enrollment
            },
        });

    } catch (error) {
        console.error('Get enrolled course error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get all enrollments for the current user
 * @route   GET /api/courses/my-enrollments
 * @access  Private
 */
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'course',
        select: 'title thumbnail modules',
        populate: {
          path: 'modules',
          select: 'lessons'
        }
      });

    // Calculate completion percentage on the server
    const data = enrollments.map(enrollment => {
      let totalLessons = 0;
      if (enrollment.course && enrollment.course.modules) {
        totalLessons = enrollment.course.modules.reduce((acc, module) => acc + (module.lessons ? module.lessons.length : 0), 0);
      }

      const completedLessons = enrollment.progress.length;
      const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      // We need to convert the mongoose document to a plain object to add a new property
      const enrollmentObject = enrollment.toObject();
      enrollmentObject.completionPercentage = completionPercentage;

      return enrollmentObject;
    });

    res.status(200).json({
      success: true,
      data: data,
    });

  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Enroll the current user in a PAID course
 * @route   POST /api/courses/:courseId/enroll-paid
 * @access  Private
 */
exports.enrollInPaidCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const user = await User.findById(req.user.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // --- SUBSCRIPTION CHECK ---
    const hasAccess =
      (course.subscriptionTier === 'Plus' && (user.subscription.tier === 'plus' || user.subscription.tier === 'premium')) ||
      (course.subscriptionTier === 'Premium' && user.subscription.tier === 'premium');

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You do not have the required subscription to access this course.' });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ user: req.user.id, course: course._id });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
    }

    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: course._id,
      subscriptionTier: course.subscriptionTier,
      // For paid courses, the expiry is tied to the user's overall subscription, not the enrollment itself.
    });

    res.status(201).json({
      success: true,
      message: `Successfully enrolled in ${course.title}.`,
      data: enrollment,
    });
  } catch (error) {
    console.error('Paid enrollment error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};