const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
} = require('../controllers/bootcamps')

const courseRouter = require('./courses')

const router = express.Router()

router.use('/:bootcampId/courses', courseRouter)

router.route('/').get(getBootcamps).post(createBootcamp)

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

router.route('/radius/:city/:distance').get(getBootcampsInRadius)

module.exports = router
