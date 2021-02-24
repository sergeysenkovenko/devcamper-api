const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto,
} = require('../controllers/bootcamps')

const advancedResults = require('../middlewares/advanced-results')
const fileUpload = require('../middlewares/file-upload')
const Bootcamp = require('../models/Bootcamp')
const courseRouter = require('./courses')

const router = express.Router()

router.use('/:bootcampId/courses', courseRouter)

router
  .route('/')
  .get(
    advancedResults(Bootcamp, { path: 'courses', select: 'title description' }),
    getBootcamps,
  )
  .post(createBootcamp)

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

router.route('/radius/:city/:distance').get(getBootcampsInRadius)

router.route('/:id/photo').put(fileUpload(Bootcamp), uploadBootcampPhoto)

module.exports = router
