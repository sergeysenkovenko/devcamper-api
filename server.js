const express = require('express')
const env = require('dotenv')

env.config({ path: './.env' })

const app = express()
const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running on port ${PORT}`))
