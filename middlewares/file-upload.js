const path = require('path')
const ErrorResponse = require('../utils/error-response')

const fileUpload = (model) => async (req, res, next) => {
  const result = await model.findById(req.params.id)

  if (!result) {
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

  file.name = `photo_${result._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err)
      return next(new ErrorResponse('Some problems with uploading', 500))
    }

    await model.findByIdAndUpdate(req.params.id, { photo: file.name })

    res.fileUpload = {
      success: true,
      data: file.name,
    }

    next()
  })
}

module.exports = fileUpload
