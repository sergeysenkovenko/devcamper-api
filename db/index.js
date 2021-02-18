const mongoose = require('mongoose')
const colors = require('colors')

const connectDB = async () => {
  const connect = await mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })

  console.log(colors.cyan(`MongoDB connected: ${connect.connection.host}`))
}

module.exports = connectDB
