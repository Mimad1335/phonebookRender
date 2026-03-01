const mongoose = require('mongoose')
const dns = require("dns"); 
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const CloseConnection = () => {mongoose.connection.close()}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    required: true
  },
  number: {
    type: String,
    minLength: 2,
    required: true
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
