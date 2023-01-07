const express = require('express');
const app = express();
const port = 8080;

app.use(express.json())

// Add the contact person routes
const contactPersonRoutes = require('./controller/person');
app.use('/api/v1/person', contactPersonRoutes);

app.listen(port, () => {
    console.log(
        `Contact person service listening on port ${port}`,
        `\nKafka URL: ${process.env.KAFKA_MESSAGE_URL}`
    );
});