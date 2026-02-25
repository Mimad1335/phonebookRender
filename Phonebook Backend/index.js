require('dotenv').config()
const cors = require('cors')
const express = require('express')
const Person = require('./models/person')
let morgan = require('morgan')
morgan.token('body', (req, res) => {return JSON.stringify(req.body)})

const app = express()
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Phonebook backend App!</h1>')
})

app.get('/info', (request, response) => {
  const currDate = new Date()
  const dateString = currDate.toString()
  response.send(
    `<div>
      <p>Phonebook has info for ${persons.length} ${persons.length > 1 ? "people" : "person"}.</p>
      <p>${dateString}</p>
    </div>`)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if(person){
      response.json(person)
  }else{
      response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const getId = () => {
    const id = Math.floor(Math.random() * 10000)
    return String(id) 
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name || !body.number){
      return response.status(404).json({error: "name or number is missing"})
    }

    if(persons.map(p => p.name.toLocaleLowerCase()).find(nm => nm === body.name.toLocaleLowerCase())){
      return response.status(404).json({error: "name must be unique"})
    }

    const person = {
        name: body.name,
        number: body.number,
        id: getId(),
    }

    response.json(person)

    persons = persons.concat(person)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})