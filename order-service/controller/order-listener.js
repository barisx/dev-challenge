const { consumer } = require('../utils/consumer');
// const axios = require("axios")

function orderListener() {
    // Listen person events change topics and update current orders
    consumer(/deleted.*created|created.*deleted/, async ({ message }) => {
        const { data } = await  message.value.toString();
        // Request to person service and get latest person data
        // Request to order service patch request and update orders persons
    });
}

module.exports = { orderListener };