const axios = require('axios');
const url = process.env.KAFKA_MESSAGE_URL || 'http://localhost:3000/send-message';
async function sendMessage(message) {
    try {
        const response = await axios.post(url, message);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {sendMessage}