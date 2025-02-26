const express = require('express');
const { check } = require('express-validator');

const appController = require('../controllers/app-controllers');
const checkAuth = require('../middleware/check-auth');

const imageUpload = require('../middleware/image-upload')

const router = express.Router();

router.post('/createquiz', imageUpload.single('file'), checkAuth, appController.createQuiz);

router.get('/latestquizes', appController.getLatestQuizes);

router.get('/getmostplayed', appController.getMostPlayedQuizzes);

router.get('/getquiz/:id', appController.getQuiz);

router.post('/quizaction', checkAuth, appController.quizAction);

router.post('/sendinvites', checkAuth, appController.sendInvites);

router.post('/removeinvite', checkAuth, appController.removeInvite);

router.post('/startquiz', checkAuth, appController.startQuiz);

router.get('/getplayview/:id', checkAuth, appController.getPlayView);

router.get('/getquestion/:id', checkAuth, appController.getQuestion);

router.post('/submitanswer', checkAuth, appController.submitAnswer);

router.get('/gettime/:id', appController.getTime);

router.post('/updatetime/:id', appController.updateTime);

router.post('/finishplay', checkAuth, appController.finishPlay);

router.get('/getquizes', appController.getQuizes);

module.exports = router;
