const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

const axios = require('axios');

const { v4: uuidv4 } = require('uuid');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { quizSelect } = require('../helpers/prismaObj');

const paginate = require('jw-paginate');

const createQuiz = async (req, res, next) => {
  const { title, description, duration, endDate, bonusesList, questions, private } = req.body;
  const author = req.userData?.userId;

  if (!title || !description || !duration || !questions) {
    return next(new HttpError('Missing required fields.', 400));
  }

  const parsedDuration = parseInt((duration * 60));
  if (isNaN(parsedDuration) || parsedDuration <= 0) {
    return next(new HttpError('Invalid duration. Must be a positive number.', 400));
  }

  let formattedEndDate = null;
  if (endDate && endDate !== 'null') {
    formattedEndDate = new Date(endDate);
    if (isNaN(formattedEndDate.getTime())) {
      return next(new HttpError('Invalid end date.', 400));
    }
  }

  let parsedBonusesList = [];
  let parsedQuestions = [];
  try {
    parsedBonusesList = bonusesList ? JSON.parse(bonusesList) : [];
    parsedQuestions = questions ? JSON.parse(questions) : [];

    if (!Array.isArray(parsedBonusesList) || !Array.isArray(parsedQuestions)) {
      throw new Error();
    }
  } catch {
    return next(new HttpError('Invalid JSON format for bonusesList or questions.', 400));
  }

  const formatPrivate = private === 'true' ? true : false

  const quizData = {
    title,
    description,
    duration: parsedDuration,
    endDate: formattedEndDate || null, 
    bonusesList: parsedBonusesList,
    image: req.file?.path || null, 
    authorId: author,
    private: formatPrivate,
    questions: {
      create: parsedQuestions.map(question => ({
        id: question.id,  
        name: question.name,
        image: question.image,
        type: question.type,
        tooltip: question.tooltip,
        maxPoints: question.maxPoints,
        fields: {
          create: question.fields.map(field => ({
            id: field.id,  
            name: field.name,
            image: field.image,
            type: field.type,
            value: field.value,
            isCorrect: field.isCorrect,  
          }))
        }
      }))
    }
  };

  try {
    const createdQuiz = await prisma.quiz.create({
      data: quizData,
    });

    res.status(201).json({ message: 'success', quiz: createdQuiz });
  } catch (err) {
    return next(new HttpError('Error while saving quiz data.', 500));
  }
};

const getLatestQuizes = async (req, res, next) => {
  let quizes;
  try {
    quizes = await prisma.quiz.findMany({
      select: quizSelect,  
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  } catch (err) {
    return next(new HttpError('Error while fetching quizes', 500));
  }

  res.status(201).json({ quizes })
}

const getMostPlayedQuizzes = async (req, res, next) => {
  let quizes;
  try {
    quizes = await prisma.quiz.findMany({
      select: {
        ...quizSelect, 
        _count: {
          select: { play: true } 
        }
      },
      orderBy: {
        play: { _count: 'desc' } 
      },
      take: 10
    });
  } catch (err) {
    return next(new HttpError('Error while fetching most played quizzes', 500));
  }

  res.status(200).json({ quizes });
};


const getQuiz = async (req, res, next) => {
  const id = req.params.id;

  let quiz;
  try {
    quiz = await prisma.quiz.findUnique({
      where: {
        id: id
      },
      select: quizSelect
    })
  } catch (err) {
    console.log(err)
    return next(new HttpError('Error while fetching quiz', 500));
  }

  let leaderboard;
  try {
    leaderboard = await prisma.leaderboard.findMany({
      where: { quizId: id },
      include: {
        author: {
          omit: {
            password: true
          }
        }
      },
      orderBy: {
        points: 'desc'
      },
      take: 50
    })
  } catch (err) {
    return next(new HttpError('Error while fetching leaderboard', 500));
  }

  res.status(201).json({ quiz, leaderboard, message: 'success' })
}

const quizAction = async (req, res, next) => {
  const { id, action } = req.body;
  const userId = req.userData.userId;

  let quiz;
  try {
    quiz = await prisma.quiz.findUnique({
      where: { id: id },
      select: quizSelect
    });
  } catch (err) {
    return next(new HttpError('Error while fetching quiz', 400));
  }

  if (!quiz) {
    return next(new HttpError('Quiz does not exist', 400));
  }

  if (quiz.authorId !== userId) {
    return next(new HttpError('You do not have access', 403));
  }

  try {
    switch (action) {
      case 'delete':
        if (quiz.questions.length > 0) {
          await Promise.all(
            quiz.questions.map(async (question) => {
              await prisma.field.deleteMany({ where: { questionId: question.id } });
            })
          );

          await prisma.question.deleteMany({ where: { quizId: id } });
        }

        await prisma.quiz.delete({ where: { id } });
        return res.status(200).json({ message: 'success' });
      case 'close':
        await prisma.quiz.update({
          where: {
            id: id,
          },
          data: {
            active: false,
          },
        })
        return res.status(200).json({ message: 'success' });
      case 'resetleaderboard':
        await prisma.leaderboard.deleteMany({
          where: {
            quizId: id
          }
        })

        await prisma.play.deleteMany({
          where: {
            quizId: id
          }
        })
        return res.status(200).json({ message: 'success' });

      default:
        return next(new HttpError('Invalid action', 400));
    }

  } catch (err) {
    console.log(err)
    return next(new HttpError('Error while processing action', 500));
  }
};

const sendInvites = async (req, res, next) => {
  const { id, invites } = req.body;
  const author = req.userData.userId;

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
      return next(new HttpError("Quiz doesn't exist!", 400));
    }

    if (quiz.authorId !== author) {
      return next(new HttpError("You do not have access", 403));
    }

    if (!quiz.private) {
      return next(new HttpError("Quiz is not private!", 400));
    }

    const formatInvites = invites.map((i) => i.label); 
    const formatFinishInvites = quiz.allowed.concat(formatInvites)

    await prisma.quiz.update({
      where: { id }, 
      data: { allowed: formatFinishInvites },
    });

    res.status(201).json({ message: "success" });
  } catch (err) {
    return next(new HttpError("Error while processing request", 500));
  }
};

const removeInvite = async (req, res, next) => {
  const { id, user } = req.body;
  const author = req.userData.userId;

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
      return next(new HttpError("Quiz doesn't exist!", 400));
    }

    if (quiz.authorId !== author) {
      return next(new HttpError("You do not have access", 403));
    }

    const updatedInvites = quiz.allowed.filter((invite) => invite !== user);

    await prisma.quiz.update({
      where: { id },
      data: { allowed: updatedInvites }, 
    });

    res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(err);
    return next(new HttpError("Error while processing request", 500));
  }
};

const startQuiz = async (req, res, next) => {
  const { id, username } = req.body;
  const author = req.userData.userId;

  let quiz;
  try {
    quiz = await prisma.quiz.findUnique({
      where: { id: id },
      select: quizSelect
    })
  } catch (err) {
    return next(new HttpError("Error while fetching quiz!", 400));
  }

  if(!quiz) {
    return next(new HttpError("Quiz doesn't exist!", 400));
  }

  if(quiz.private === true && !quiz.allowed.includes(username)) {
    return next(new HttpError("You are not allowed!", 400));
  }

  let play;
  let formatProcess = quiz.questions.length > 0 && quiz.questions[0]
  try {
    play = await prisma.play.create({
      data: {
        quizId: id,
        authorId: author,
        process: [formatProcess],
        time: quiz.duration
      }
    })
  } catch (err) {
    console.log(err)
    return next(new HttpError("Error while starting quiz", 500));
  }

  res.status(201).json({ message: 'success', id: play.id })
}

const getPlayView = async (req, res, next) => {
  const id = req.params.id;
  const author = req.userData.userId;

  let play;
  try {
    play = await prisma.play.findUnique({
       where: { id: id },
    })
  } catch (err) {
    console.log(err)
    return next(new HttpError("Error while fetching play!", 400));
  }

  if(!play) {
    return next(new HttpError("Play dont exist!", 400));
  }

  let quiz;
  try {
    quiz = await prisma.quiz.findUnique({
      where: { id: play.quizId },
      select: quizSelect
    })
  } catch (err) {
    return next(new HttpError("Error while fetching quiz!", 400));
  }

  if(!quiz) {
    return next(new HttpError("Quiz dont exist!", 400));
  }

  if(play.authorId !== author) {
    return next(new HttpError("You dont have access!", 403));
  }


  res.status(201).json({ message: 'success', quiz, play })
}

const getQuestion = async (req, res, next) => {
  const id = req.params.id;

  let question;
  let fields;
  try {
    question = await prisma.question.findUnique({ 
      where: { id: id }
    })

    fields = await prisma.field.findMany({
      where: { questionId: id },
      omit: {
        isCorrect: true
      }
    })
  } catch (err) {
    return next(new HttpError("Error while fetching!", 403));
  }

  res.status(201).json({ message: 'success', question, fields })
}

const submitAnswer = async (req, res, next) => {
  const { id, answer } = req.body; 
  const author = req.userData.userId;

  let play;
  try {
    play = await prisma.play.findUnique({
      where: { id },
    });
    if (!play) return next(new HttpError("Play does not exist!", 400));
    if (play.authorId !== author) return next(new HttpError("You do not have access!", 403));
  } catch (err) {
    return next(new HttpError("Error while fetching play!", 400));
  }

  let quiz;
  try {
    quiz = await prisma.quiz.findUnique({
      where: { id: play.quizId },
      include: { questions: { include: { fields: true } } },
    });
    if (!quiz) return next(new HttpError("Quiz does not exist!", 400));
  } catch (err) {
    return next(new HttpError("Error while fetching quiz!", 400));
  }

  let nextQuestion;
  if(quiz.questions.length > play.process.length) {
    nextQuestion = quiz.questions[play.process.length]
  }  else {
    nextQuestion = 'end'
  }

  for (let ans of answer) {
    let fetchQuestion;
    try {
      fetchQuestion = await prisma.question.findUnique({
        where: { id: ans.questionId },
        include: { fields: true },
      });
      if (!fetchQuestion) return next(new HttpError("Question does not exist!", 400));
    } catch (err) {
      return next(new HttpError("Error while fetching question!", 400));
    }

    const currentField = fetchQuestion.fields.find((f) => f.id === ans.fieldId);
    if (!currentField) return next(new HttpError("Field does not exist!", 400));

    let earnedPoints = 0;
    const maxPoints = parseInt(fetchQuestion.maxPoints, 10) || 0;

    if (fetchQuestion.type === "text") {
      if (ans.value === currentField.value) {
        earnedPoints = maxPoints;
      }
    } else if (fetchQuestion.type === "radio") {
      if (currentField.isCorrect && ans.value === currentField.value) {
        earnedPoints = maxPoints;
      }
    } else if (fetchQuestion.type === "checkbox") {
      const correctFields = fetchQuestion.fields.filter((f) => f.isCorrect);
      const correctCount = correctFields.length;

      if (correctCount > 0) {
        const selectedCorrect = ans.value.filter((v) =>
          correctFields.some((f) => f.value === v)
        ).length;

        earnedPoints = (selectedCorrect / correctCount) * maxPoints;
      }
    }

    try {
        const existingPlay = await prisma.play.findUnique({
            where: { id: play.id },
            select: { process: true },
        });
    
        if (!existingPlay) {
            return next(new HttpError("Play not found!", 404));
        }
    
        const updatedProcess = existingPlay.process.map((processItem) => {
          if (processItem.id === ans.questionId) {
              return {
                  ...processItem,
                  earnedPoints: processItem.earnedPoints 
                      ? processItem.earnedPoints + earnedPoints 
                      : earnedPoints,  
      
                  answeredValue: Array.isArray(processItem.answeredValue)  
                      ? [...processItem.answeredValue, ans.value[0]] 
                      : ans.value,
              };
          }
          return processItem;
      });
      
      await prisma.play.update({
          where: { id: play.id },
          data: {
              process: {
                  set: updatedProcess,  
              },
              points: { increment: earnedPoints },
          },
      });
    } catch (err) {
        return next(new HttpError("Error while updating play progress and points!", 500));
    }
  
  }


  let formatNewQuestion;

  if (nextQuestion && nextQuestion.fields && nextQuestion.fields.length > 0) {
    const { fields, ...newQuestion } = nextQuestion;
    formatNewQuestion = newQuestion; 
  } else {
    formatNewQuestion = nextQuestion; 
  }
    
  try {
    play = await prisma.play.update({
      where: { id: id },
      data: {
        process: {
          push: formatNewQuestion
        }, 
      }
    });
  
    res.status(200).json({ message: "success", next: nextQuestion });
  } catch (err) {
    console.log(err);
    return next(new HttpError("Error while starting quiz", 500));
  }
};

const getTime = async (req, res, next) => {
  const { id } = req.params;
  const play = await prisma.play.findUnique({ where: { id } });

  if (!play) return res.status(404).json({ message: "Play not found" });

  res.json({ time: play.time });
};


const updateTime = async (req, res, next) => {
  const { id } = req.params;
  const { timeLeft } = req.body;

  try {
      await prisma.play.update({
          where: { id },
          data: { time: timeLeft },
      });
  } catch (err) {
      return next(new HttpError("Error while updating time", 500));
  }

  res.status(201).json({ success: true });
};

const finishPlay = async (req, res, next) => {
  const { id } = req.body;
  const author = req.userData.userId;

  let play;
  try {
    play = await prisma.play.findUnique({ where: { id } });
    if (!play) {
      return next(new HttpError("Play does not exist!", 400));
    }
    if (play.authorId !== author) {
      return next(new HttpError("You do not have access!", 403));
    }
  } catch (err) {
    return next(new HttpError("Error while fetching play!", 400));
  }

  let quiz;
  try {
    quiz = await prisma.quiz.findUnique({
      where: { id: play.quizId },
      select: {
        bonusesList: true, 
      },
    });

    if (!quiz) {
      return next(new HttpError("Quiz not found!", 400));
    }
  } catch (err) {
    return next(new HttpError("Error while fetching quiz!", 400));
  }

  let bonusPoints = 0;

  if (Array.isArray(quiz.bonusesList) && play.time !== null && play.time !== undefined) {
    const playTimeInMinutes = play.time / 60;
  
    const sortedBonuses = quiz.bonusesList.sort((a, b) => a.time - b.time);
  
    for (const bonus of sortedBonuses) {
      if (playTimeInMinutes >= bonus.time) { 
        bonusPoints = bonus.points;
        break; 
      }
    }
  }

  let fetchLeaderboard;
  try {
    fetchLeaderboard = await prisma.leaderboard.findFirst({
      where: { quizId: play.quizId, authorId: author },
    });
  } catch (err) {
    return next(new HttpError("Error while fetching leaderboard!", 400));
  }

  try {
    const totalPoints = play.points + bonusPoints;

    if (!fetchLeaderboard) {
      await prisma.leaderboard.create({
        data: {
          quizId: play.quizId,
          authorId: author,
          points: totalPoints, 
          bonus: bonusPoints,
          attempts: 1,
        },
      });
    } else {
      const count = await prisma.play.count({
        where: { quizId: play.quizId, authorId: author },
      });

      if (totalPoints > fetchLeaderboard.points) {
        await prisma.leaderboard.update({
          where: { id: fetchLeaderboard.id },
          data: {
            points: totalPoints, 
            bonus: bonusPoints,
            attempts: count,
          },
        });
      }
    }

    await prisma.play.update({
      where: { id },
      data: { finished: true },
    });

  } catch (err) {
    console.log(err);
    return next(new HttpError("Error while updating leaderboard!", 400));
  }

  res.status(200).json({ message: "success", quiz: play.quizId });
};

const getQuizes = async (req, res, next) => {
  const search = decodeURI(req.query.search);
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  
  try {
    let quizzes;
    if (search) {
      quizzes = await prisma.quiz.findMany({
        where: {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          questions: true
        }
      });
    } else {
      quizzes = await prisma.quiz.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          questions: true
        }
      });
    }

    const allQuizzes = quizzes.map(quiz => ({
      ...quiz,
      id: quiz.id.toString()
    }));
    
    const pager = paginate(allQuizzes.length, page, pageSize);
    const pageOfItems = allQuizzes.slice(pager.startIndex, pager.endIndex + 1);
  
    return res.json({ pager, pageOfItems });
    
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Error while fetching quizzes!',
      500
    );
    return next(error);
  }
};

exports.createQuiz = createQuiz;
exports.getLatestQuizes = getLatestQuizes;
exports.getQuiz = getQuiz;
exports.quizAction = quizAction;
exports.sendInvites = sendInvites;
exports.removeInvite = removeInvite;
exports.startQuiz = startQuiz;
exports.getPlayView = getPlayView;
exports.getQuestion = getQuestion;
exports.submitAnswer = submitAnswer;
exports.getTime = getTime;
exports.updateTime = updateTime;
exports.finishPlay = finishPlay;
exports.getMostPlayedQuizzes = getMostPlayedQuizzes;
exports.getQuizes = getQuizes;