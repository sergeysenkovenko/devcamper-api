const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/data/bootcamps.json`, 'utf-8'),
)

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/data/courses.json`, 'utf-8'),
)

const importData = async () => {
  try {
    await Bootcamp.create(bootcamps)
    // await Course.create(courses)
    console.log(colors.green.inverse('Data successfully imported'))
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

const deleteData = async () => {
  try {
    await Bootcamp.deleteMany()
    await Course.deleteMany()
    console.log(colors.red.inverse('Data successfully removed'))
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

if (process.argv[2] === '-i') {
  importData()
} else if (process.argv[2] === '-d') {
  deleteData()
}
