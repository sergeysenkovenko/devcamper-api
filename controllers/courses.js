const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middlewares/async-handler')
const ErrorResponse = require('../utils/error-response')

// @desc Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/courses/bootcamps/bootcampId
// @access Public
const getCourses = asyncHandler(async (req, res, next) => {
  let query
  if (req.params.bootcampId) {
    query = await Course.find({ bootcamp: req.params.bootcampId })
  } else {
    query = await Course.find().populate({
      path: 'bootcamp',
      select: 'name description',
    })
  }
  const courses = await query

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  })
})

// @desc Get course
// @route GET /api/v1/courses/:id
// @access Public
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  })

  if (!course) {
    return next(new ErrorResponse('No such course', 404))
  }

  res.status(200).json({
    success: true,
    data: course,
  })
})

// @desc Create course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
const createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId

  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  if (!bootcamp) {
    return next(new ErrorResponse('No such bootcamp', 404))
  }

  const course = await Course.create(req.body)

  res.status(201).json({
    success: true,
    data: course,
  })
})

// @desc Update existing course
// @route PUT /api/v1/courses/:id
// @access Private
const updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!course) {
    return next(new ErrorResponse('Resource not found', 404))
  }

  res.status(200).json({
    success: true,
    data: course,
  })
})

// @desc Delete existing course
// @route DELETE /api/v1/courses/:id
// @access Private
const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return next(new ErrorResponse('Resource not found', 404))
  }

  await course.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
}
