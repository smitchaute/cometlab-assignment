const express = require('express');
const { signup, login } = require('../controller/user');
const { authenticate, isAdmin } = require('../middleware/middleware');
const { addQuestion, updateQuestion, deleteQuestion, addTestCase, checkSolution } = require('../controller/questions');


const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/questions', authenticate, isAdmin, addQuestion);

router.put('/questions/:id', authenticate, isAdmin, updateQuestion);

router.delete('/questions/:id', authenticate, isAdmin, deleteQuestion);

router.post('/questions/:id/test-cases', authenticate, isAdmin, addTestCase);

router.post('/questions/:id/solution', authenticate, checkSolution);

module.exports = router;
