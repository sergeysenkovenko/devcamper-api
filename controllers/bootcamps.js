const Bootcamp = require('../models/Bootcamp')
const geocoder = require('../utils/geocoder')
const asyncHandler = require('../middlewares/async-handler')
const ErrorResponse = require('../utils/error-response')

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
const getBootcamps = asyncHandler(async (req, res, next) => {
  let query

  const reqQuery = { ...req.query }
  const excludeFields = ['select', 'sort', 'page', 'limit']

  excludeFields.forEach((param) => delete reqQuery[param])

  const queryString = JSON.stringify(reqQuery).replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`,
  )

  query = Bootcamp.find(JSON.parse(queryString))
    .populate({
      path: 'courses',
      select: 'title description',
    })
    .collation({
      locale: 'en',
      strength: 2,
    })

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }

  const page = +req.query.page || 1
  const limit = +req.query.limit || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Bootcamp.countDocuments()

  query = query.skip(startIndex).limit(limit)

  const bootcamps = await query

  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  res.status(200).json({
    success: true,
    pagination,
    count: bootcamps.length,
    data: bootcamps,
  })
})

// @desc Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
const getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id).populate({
    path: 'courses',
    select: 'title description',
  })

  if (!bootcamp) {
    return next(new ErrorResponse('Resource not found', 404))
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  })
})

// @desc Create new bootcamp
// @route POST /api/v1/bootcamps
// @access Private
const createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body)

  res.status(201).json({
    success: true,
    data: bootcamp,
  })
})

// @desc Update existing bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
const updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!bootcamp) {
    return next(new ErrorResponse('Resource not found', 404))
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  })
})

// @desc Delete existing bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
const deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(new ErrorResponse('Resource not found', 404))
  }

  bootcamp.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc Get bootcamps in radius
// @route GET /api/v1/bootcamps/radius/:zip/:distance
// @access Private
const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { city, distance } = req.params
  const [loc] = await geocoder.geocode(city)
  // Divide distance by Earth radius in km
  const radius = distance / 6378

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[loc.latitude, loc.longitude], radius] },
    },
  })

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  })
})

module.exports = {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
}
