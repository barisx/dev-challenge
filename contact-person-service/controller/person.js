const express = require('express');
const router = express.Router();
const {sendMessage} = require('./send-message');
// Array to store the contact persons
let contactPersons = [];

router.get('/', (req, res) => {
  res.json(contactPersons)
})

router.get('/:id', (req, res) => {
  const contactPerson = contactPersons.find((person) => person.id === req.params.id);
  if (contactPerson) {
    res.json(contactPerson);
  } else {
    res.sendStatus(404);
  }
})

// POST /api/v1/person
router.post('/', (req, res) => {
  // Add the new contact person to the list
  const contactPerson = req.body;
  contactPersons.push(contactPerson);

  // Publish a message to the "personevents-created" topic
  const message = {
    topic: 'personevents-created',
    messages: [{ value: contactPerson.id }],
  };
  //! I may error handling here
  sendMessage(message);

  res.status(201).json(contactPerson);
});

// DELETE /api/v1/person
router.delete('/', (req, res) => {
  const deletedIds = contactPersons.map((person) => person.id)
  // Clear the list of contact persons
  contactPersons = [];

  // Publish a message to the "personevents-deleted" topic
  const message = {
    topic: 'personevents-deleted',
    messages: [{ value: deletedIds }],
  };
  sendMessage(message);

  res.sendStatus(204);
});

// DELETE /api/v1/person
router.delete('/:id', (req, res) => {
  // Get index of person to delete
  const index = contactPersons.findIndex((person) => person.id === req.params.id);
  if (index === -1) {
    res.sendStatus(404);
  } else {
    // Clear the list of contact persons
    deletePerson(contactPersons, index)
    // Publish a message to the "personevents-deleted" topic
    const message = {
      topic: 'personevents-deleted',
      messages: [{ value: index }],
    };
    sendMessage(message);

    res.sendStatus(204);
  }
});

// PUT /api/v1/person/:id
router.put('/:id', (req, res) => {
  // Find the contact person with the specified ID and update its fields
  const index = contactPersons.findIndex((person) => person.id === req.params.id);
  if (index === -1) {
    res.sendStatus(404);
  } else {
    contactPersons[index] = req.body;

    // Publish a message to the "personevents-changed" topic
    const message = {
      topic: 'personevents-changed',
      messages: [{ value: contactPersons[index] }],
    };
    sendMessage(message);

    res.status(200).json(contactPersons[index]);
  }
});

// PATCH /api/v1/person/:id
router.patch('/:id', (req, res) => {
  const updates = req.body;
  // Find the contact person with the specified ID and update its fields
  const index = contactPersons.findIndex((person) => person.id === req.params.id);
  // Validate request parameters
  if (!updates) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  } else {
    // Publish a message to the "personevents-changed" topic
    const message = {
      topic: 'personevents-changed',
      messages: [{ value: contactPersons[index] }],
    };
    sendMessage(message);
    // Perform updates in the in memory database
    const result = updatePerson(contactPersons, updates.id, updates);

    return res.status(200).json(result);
  }
});

// POST /api/v1/person/search
router.post('/search', (req, res) => {
  const { query } = req.body;

  // Validate request parameters
  if (!query) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  // Perform search in the database
  const result = searchPerson(contactPersons, query);

  return res.status(200).json(result);
});


function updatePerson(persons, id, updates) {
  return persons.map(person => {
    if (person.id !== id) {
      return person;
    }
    return { ...person, ...updates };
  });
}

function searchPerson(persons, query) {
  return persons.filter(person => {
    for (const key in query) {
      if (query[key] !== person[key]) {
        return false;
      }
    }
    return true;
  });
}

function deletePerson(persons, id) {
  return persons.filter(person => person.id !== id);
}

module.exports = router;