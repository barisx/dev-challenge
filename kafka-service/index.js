const express = require('express');
const { producer } = require('./kafka');
const nanoid = require('nanoid-esm');

const app = express();

app.use(express.json())

app.post('/send-message', (req, res) => {
    // Find the topic from request body
    const { topic, messages } = req.body;
    const kafkaMsg = {value: JSON.stringify({
        specversion : "1.0",
        type : req.headers["user-agent"],
        source : req.url,
        id : nanoid(),
        time : new Date().toISOString(),
        topic,
        datacontenttype : req.headers["content-type"],
        data : messages[0]?.value
    })}
    console.info(req.body)
    producer(topic, [kafkaMsg])
    return res.json({ message: "OK" , data: kafkaMsg})
});

app.listen(3000, () => {
    console.log('Kafka server listening on port 3000');
});