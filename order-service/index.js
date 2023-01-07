const index = require('express');
const bodyParser = require('body-parser');
const { orderListener } = require('./controller/order-listener');

const app = index();
const port = 8081


app.use(index.json())

// Parsers for POST data
// SRC: https://stackoverflow.com/questions/47288188/expressjs-post-route-is-not-working-and-returning-an-error
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add the order routes
const orderRoutes = require('./controller/order');

app.use('/api/v1/order', orderRoutes);

app.listen(port, async() => {
    console.log(
        `Order service listening on port ${port}`,
        `\nKafka URL: ${process.env.KAFKA_MESSAGE_URL}`
    );
    orderListener() // once it will executed under idempotent function
});