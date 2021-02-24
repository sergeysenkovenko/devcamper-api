const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const errorHandler = require('./middlewares/error-handler')
const morgan = require('morgan')
const connectDB = require('./db')
const colors = require('colors')

dotenv.config({ path: './.env' })

connectDB()

const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')

const app = express()

app.use(express.json())

app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(fileUpload())

app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)

app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(
  PORT,
  console.log(colors.yellow.bold(`Server running on port: ${PORT}`)),
)

process.on('unhandledRejection', (err) => {
  server.close(() => {
    console.log(colors.red(`Error: ${err.message}`))
    process.exit(1)
  })
})
