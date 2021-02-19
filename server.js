const express = require('express')
const dotenv = require('dotenv')
const errorHandler = require('./middlewares/error-handler')
const morgan = require('morgan')
const connectDB = require('./db')
const colors = require('colors')

dotenv.config({ path: './.env' })

connectDB()

const bootcamps = require('./routes/bootcamps')

const app = express()

app.use(express.json())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/api/v1/bootcamps', bootcamps)

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
