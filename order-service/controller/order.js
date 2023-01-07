const express = require('express');
const router = express.Router();
const axios = require("axios");
const {sendMessage} = require('../utils/send-message');
const personService = process.env.PERSON_SERVICE || 'http://localhost:8080/api/v1/person/'
// Array to store the orders
let orders = [];

// GET /api/v1/order
router.get('/', (req, res) => {
  // Return the list of orders
  res.json(orders);
});

// GET /api/v1/order/:orderID
router.get('/:orderID', (req, res) => {
  // Find the order with the specified ID
  const order = orders.find((order) => [
        order.soldToID.id,
        order.billToID.id,
        order.shipToID.id
  ].includes(req.params.orderID));
  if (order) {
    res.json(order);
  } else {
    res.sendStatus(404);
  }
})

// POST /api/v1/order
router.post('/', async(req, res) => {
  // Add the new order to the list
  const order = req.body;
  await axios.get(personService + order.soldToID)
      .then(async (response) => {
        if (response.status !== 200) {
          res.sendStatus(400);
        } else {

          const person = response.data
          order.soldToID = person
          await axios.get(personService + order.soldToID.id)
              .then((response) => {
                if (response.status === 200) {
                  order.billToID = response.data
                  order.shipToID = response.data
                } else {
                  res.sendStatus(400);
                }
              })
          orders.push(order);
          // Publish a message to the "orderevents-created" topic
          const message = {
            topic: 'orderevents-created',
            messages: [{value: order.id}],
          };
          sendMessage(message);
          res.status(200).json(order);
        }
      }).catch(error => {
        console.error(error)
        res.status(400).json({Error: error});
      });
});

// DELETE /api/v1/order
router.delete('/', (req, res) => {
  const orderIds = orders.map(order => order.id)
  // Clear the list of orders
  orders = [];

  // Publish a message to the "orderevents-deleted" topic
  const message = {
    topic: 'orderevents-deleted',
    messages: [{value: orderIds}],
  };
  sendMessage(message);

  res.sendStatus(200);
});

// GET /api/v1/order/:orderID
router.get('/:orderID', (req, res) => {
  // Find the order with the specified ID
  const order = orders.find((order) => order.id === req.params.orderID);
  if (!order) {
    res.sendStatus(404);
  } else {
    res.json(order);
  }
});

// PUT /api/v1/order/:orderID
router.put('/:orderID', (req, res) => {
  // Find the order with the specified ID and update its fields
  const index = orders.findIndex((order) => [
    order.soldToID.id,
    order.billToID.id,
    order.shipToID.id
  ].includes(req.params.orderID));
  if (index === -1) {
    res.sendStatus(404);
  } else {
    orders[index] = req.body;
    // Publish a message to the "orderevents-changed" topic
    const message = {
      topic: 'orderevents-changed',
      messages: [{ value: index }],
    };
    sendMessage(message);

    res.status(200).json(orders[index]);
  }
});

// DELETE /api/v1/order/:orderID
router.delete('/:orderID', (req, res) => {
  // Find the order with the specified ID and remove it from the list
  const index = orders.findIndex((order) => [
    order.soldToID.id,
    order.billToID.id,
    order.shipToID.id
  ].includes(req.params.orderID));
  if (index === -1) {
    res.sendStatus(404);
  } else {
    orders.splice(index, 1);
    // Publish a message to the "orderevents-deleted" topic
    const message = {
      topic: 'orderevents-deleted',
      messages: [{ value: index }],
    };
    sendMessage(message);

    res.sendStatus(200);
  }
});

// PATCH /api/v1/order/:orderID
router.patch('/:orderID', (req, res) => {
  // Find the order with the specified ID and update its fields
  const index = orders.findIndex((order) => [
    order.soldToID.id,
    order.billToID.id,
    order.shipToID.id
  ].includes(req.params.orderID));
  if (index === -1) {
    res.sendStatus(404);
  } else {
    Object.assign(orders[index], req.body);
    // Publish a message to the "orderevents-changed" topic
    const message = {
      topic: 'orderevents-changed',
      messages: [{ value: orders[index] }],
    };
    sendMessage(message);

    res.status(200).json(orders[index]);
  }
});

module.exports = router