const { Kafka } = require('kafkajs')


const kafka = new Kafka({
    clientId: 'node-app',
    brokers: [process.env.KAFKA_HOST + ":" + process.env.KAFKA_PORT],
    requestTimeout: 3000,
    connectionTimeout: 6000,
    ssl: false
})

exports.producer = async (eventName, data) => {
    const producer = kafka.producer()

    // event kafka producer notification
    await producer.on('producer.connect', () => console.info('producer kafka connected'))
    await producer.on('producer.disconnect', () => console.error('producer kafka disconnect'))
    await producer.on('producer.network.request_timeout', () => console.error('producer kafka network timeout'))

    await producer.connect()
    await producer.send({
        topic: eventName,
        messages: data,
        acks: true,
        compression: 1
    })

    await producer.disconnect()
}

// https://github.com/restuwahyu13/node-kafka