const path = require('path')
const Bootcamp = require('../models/Bootcamp')
const geocoder = require('../utils/geocoder')
const asyncHandler = require('../middlewares/async-handler')
const ErrorResponse = require('../utils/error-response')

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
const getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
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

// @desc Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
const uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(new ErrorResponse('Resource not found', 404))
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400))
  }

  const { file } = req.files

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image', 400))
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse('Please upload an image not more than 1MB', 400),
    )
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err)
      return next(new ErrorResponse('Some problems with uploading', 500))
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

    res.status(200).json({
      success: true,
      data: file.name,
    })
  })
})

module.exports = {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto,
}
