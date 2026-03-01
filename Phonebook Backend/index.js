require('dotenv').config()
const cors = require('cors')
const express = require('express')
const Person = require('./models/person')
let morgan = require('morgan')
morgan.token('body', (req, res) => {return JSON.stringify(req.body)})

const app = express()
app.use(express.static('dist'))
app.use(express.json())
//app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

app.get('/', (request, response) => {
  response.send('<h1>Phonebook backend App!</h1>')
})

app.get('/info', (request, response) => {
  const currDate = new Date()
  const dateString = currDate.toString()

  Person.find({}).then(result => {
    response.send(
    `<div>
      <p>Phonebook has info for ${result.length} ${result.length > 1 ? "people" : "person"}.</p>
      <p>${dateString}</p>
    </div>`)

  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id)
  .then(pers => {
    if(pers){
      response.json(pers)
    }else{
        response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndDelete(request.params.id)
  .then( res => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

const getId = () => {
  const id = Math.floor(Math.random() * 10000)
  return String(id) 
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  /*if(!body.name || !body.number){
    return response.status(400).json({error: "name or number is missing"})
  }*/

  Person.find({}).then(result => {
    if(result.map(p => p.name.toLocaleLowerCase()).find(nm => nm === body.name.toLocaleLowerCase())){
      return response.status(404).json({error: "name must be unique"})
    }
  })

  const person = new Person({
      name: body.name,
      number: body.number,
      //id: getId(),
  })

  person.save().then(newPerson => {
    response.json(newPerson)
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
} 

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})