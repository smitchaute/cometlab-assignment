const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const request = require('request');
const config = require('./env.json')
const app = express();

// Connect to MongoDB
mongoose.connect(config.Parameters.dataBaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error(error));

// Middleware
app.use(express.json());

// Routes
app.use('/api', routes);

// Start the server
app.listen(3000 || config.Parameters.PORT, () => {
    console.log('Server started on port 3000');
});

request({
    url: 'https://' + config.Parameters.endpoint + '/api/v4/test?access_token=' + config.Parameters.accessToken,
    method: 'GET'
}, function (error, response, body) {

    if (error) {
        console.log('Connection problem');
    }

    // process response
    if (response) {
        if (response.statusCode === 200) {
            console.log(JSON.parse(response.body)); // test message in JSON
        } else {
            if (response.statusCode === 401) {
                console.log('Invalid access token');
            }
        }
    }
});
