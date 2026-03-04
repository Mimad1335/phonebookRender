const mongoose = require('mongoose')
const dns = require('dns') 
dns.setServers(['1.1.1.1', '8.8.8.8'])

const args = process.argv

if (args.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = args[2].trim()

const url = `mongodb+srv://mikemaduwa_db_user:${password}@cluster0.gij8hkl.mongodb.net/persons?appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const CloseConnection = () => {mongoose.connection.close()}

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if(args.length === 5){
  const person = new Person({
    name: args[3],
    number: args[4],
  })

  person.save().then(result => {
    console.log(`added ${args[3]} number ${args[4]} to phonebook`)
    CloseConnection()
  })

}else if(args.length === 3){
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    CloseConnection()
  })

}else{
  console.log('missing name or number')
  CloseConnection()
}


