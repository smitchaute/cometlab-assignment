const axios = require('axios');
const request = require('request');
const Question = require('../model/question');
const config = require("../env.json")


const addQuestion = async (req, res) => {
    try {
        const { question, correctSolution } = req.body;

        // Create a new question
        const newQuestion = new Question({ question, correctSolution });
        await newQuestion.save();

        res.json({ message: 'Question added successfully', question: newQuestion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const { question } = req.body;

        // Find the question by ID and update it
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            { question },
            { new: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question updated successfully', question: updatedQuestion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;

        // Find the question by ID and delete it
        const deletedQuestion = await Question.findByIdAndDelete(questionId);

        if (!deletedQuestion) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully', question: deletedQuestion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const addTestCase = async (req, res) => {
    try {
        const questionId = req.params.id;
        const { input, output } = req.body;

        // Find the question by ID
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Add the test case to the question
        console.log("que", question)
        question.testCases.push({ input, output });
        await question.save();

        res.json({ message: 'Test case added successfully', question });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};


const checkSolution = async (req, res) => {
    try {
        const questionId = req.params.id;
        const { solution } = req.body;

        // Find the question by ID
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        var submissionData = {
            compilerId: 56, //116 for python
            source: solution
        };
        request({
            url: 'https://' + config.Parameters.endpoint + '/api/v4/submissions?access_token=' + config.Parameters.accessToken,
            method: 'POST',
            form: submissionData
        }, function (error, response, body) {

            if (error) {
                console.log('Connection problem');
            }

            // process response
            if (response) {
                if (response.statusCode === 201) {
                    console.log(JSON.parse(response.body)); // submission data in JSON
                    let submission = JSON.parse(response.body)
                    console.log("sub", submission)
                    request({
                        url: 'https://' + config.Parameters.endpoint + '/api/v4/submissions?ids=' + submission.id + '&access_token=' + config.Parameters.accessToken,
                        method: 'GET'
                    }, function (error, response, body) {

                        if (error) {
                            console.log('Connection problem');
                        }

                        // process response
                        if (response) {
                            if (response.statusCode === 200) {
                                // console.log(JSON.parse(response.body)); // list of submissions in JSON
                                let result = JSON.parse(response.body)
                                res.json({ message: 'Result', result });
                            } else {
                                if (response.statusCode === 401) {
                                    console.log('Invalid access token');
                                } else if (response.statusCode === 400) {
                                    var body = JSON.parse(response.body);
                                    console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                                }
                            }
                        }
                    });
                } else {
                    if (response.statusCode === 401) {
                        console.log('Invalid access token');
                    } else if (response.statusCode === 402) {
                        console.log('Unable to create submission');
                    } else if (response.statusCode === 400) {
                        var body = JSON.parse(response.body);
                        console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { addQuestion, updateQuestion, deleteQuestion, addTestCase, checkSolution };