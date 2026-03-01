import { useState, useEffect } from 'react'
import networkService from './network/persons'
import Messages from './components/notifications'

const People = ({persons, setPersons, setNewFilteredPeople, setNewError}) => {
  return(
    <div>
      {persons.map( person => 
        <div className="person" key={person.id}>
          {person.name} {person.number} 
          <button onClick={() => {
            if(confirm(`Delete ${person.name}?`)){
              networkService
                .remove(person.id)
                .then( pers => {
                  setPersons(persons.filter( p => p.id !== pers.id))
                  setNewFilteredPeople(persons.filter( p => p.id !== pers.id))
                })
                .catch(error => {
                  setNewError(`Information of ${person.name} has already been removed from the server`)
                  setTimeout(() => {setNewError(null)}, 5000)
                })
            }
          }}>delete</button>
        </div>
      )}
    </div>
  )
}

const Filter = ({filt, onFilterChange}) => {
  return(
    <div>
        filter shown with <input value={filt} onChange={onFilterChange}></input>
    </div>
  )
}

const SubmitionForm = ({newName, onNameChange, newNumber, onNumberChange, handleNewNameSubmition}) => {

  return(
    <div>
      <form onSubmit={handleNewNameSubmition}>
        <div>
          name: <input value={newName} onChange={onNameChange}/>
        </div>
        <div>
          number: <input value={newNumber} onChange={onNumberChange}></input>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </div>
  )
}

const App = () => {

  const [persons, setPersons] = useState([])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filt, setNewFilter] = useState('')
  const [filteredPeople, setNewFilteredPeople] = useState(persons.concat())
  const [newNotification, setNewNotification] = useState(null)
  const [newError, setNewError] = useState(null)

  useEffect( () => {
    networkService
      .getAll()
      .then( initialData => {
        setPersons(initialData)
        setNewFilteredPeople(initialData)
      })
      
  }, [])

  const onNameChange = (event) => {
    setNewName(event.target.value)
  }

  const onNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const onFilterChange = (event) => {
    setNewFilter(event.target.value)
    if(filt.trim() === ""){
      setNewFilteredPeople(persons)
    }else{
      const filteredList = persons.filter(person => person.name.toLowerCase().includes(filt.toLowerCase())) 
      setNewFilteredPeople(filteredList)

    }
  }

  const handleNewNameSubmition = (event) => {
    event.preventDefault()

    const found = persons.find(p => p.name.toLowerCase() === newName.toLowerCase())
    if(found !== undefined){
      console.log(found)
      if(confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)){
        networkService
          .update(found.id, {...found, number: newNumber})
          .then(pers => {
            setPersons(persons.map( p => p.id === pers.id ? pers : p))
            setNewFilteredPeople(persons.map( p => p.id === pers.id ? pers : p))
            setNewName('')
            setNewNumber('')
            setNewNotification(`Added ${pers.name}`)
            setTimeout(() => {setNewNotification(null)}, 5000)
          })
          .catch(error => {
            setNewError(`Information of ${newName} has already been removed from the server`)
            setTimeout(() => {setNewError(null)}, 5000)
          })
      }
    }else{
      const newPerson = {name: newName, number: newNumber, id: (persons.length + 1).toString()}

      console.log(newPerson)

      networkService
        .create(newPerson)
        .then( pers => {
          setPersons(persons.concat(pers))
          setNewFilteredPeople(persons.concat(pers))
          setNewName('')
          setNewNumber('')
          setNewNotification(`Added ${pers.name}`)
          setTimeout(() => {setNewNotification(null)}, 5000)

        })
    }
  }



  return (
    <div>
      <h2>Phonebook</h2>
      <Messages.Notification message={newNotification}/>
      <Messages.Error message={newError}/>
      <Filter filt={filt} onFilterChange={onFilterChange}/>
      <h2>Add a new person</h2>
      <SubmitionForm newName={newName} onNameChange={onNameChange} newNumber={newNumber} onNumberChange={onNumberChange} 
        handleNewNameSubmition={handleNewNameSubmition}/>
      <h2>Numbers</h2>
      <People persons={filteredPeople} setPersons={setPersons} setNewFilteredPeople={setNewFilteredPeople} setNewError={setNewError}/>
      
    </div>
  )
}

export default App