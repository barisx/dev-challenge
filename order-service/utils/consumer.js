const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'node-app',
    brokers: [process.env.KAFKA_BROKER0, process.env.KAFKA_BROKER1],
    requestTimeout: 3000,
    connectionTimeout: 6000,
    ssl: false
})

exports.consumer = async (eventNames, callback) => {
    const consumer = kafka.consumer({
        groupId: 'test-group',
        maxBytes: 1048576000, // 1GB
        maxBytesPerPartition: 1048576000, // 1GB
        sessionTimeout: 60000,
        heartbeatInterval: 6000,
        rebalanceTimeout: 30000
    })

    // event kafka consumer notification
    await consumer.on('consumer.connect', () => console.info('consumer kafka connected'))
    await consumer.on('consumer.disconnect', () => console.error('consumer kafka disconnect'))
    await consumer.on('consumer.crash', () => console.error('consumer kafka crash'))
    await consumer.on('consumer.stop', () => console.error('consumer kafka stop'))
    await consumer.on('consumer.network.request_timeout', () => console.error('consumer kafka network timeout'))

    await consumer.connect()
    eventNames.forEach(async(e) => await consumer.subscribe({ topic: e, fromBeginning: true }))

    await consumer.run({ autoCommit: true, eachMessage: callback })
}
// https://github.com/restuwahyu13/node-kafka