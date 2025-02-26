import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useUserStore } from '../stores/userStore';

import Navigation from '../components/helpers/Navigation';

import { Container, Row, Col, Button, Card, InputGroup, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';

import axios from 'axios';
import { toast } from 'react-toastify';

import ImagePreview from '../components/helpers/ImagePreview';
import SkeletonLoader from '../components/helpers/SkeletonLoader';
import { motion } from "framer-motion";

// countdown

const finishPlay = async (playId) => {
    const storedData = JSON.parse(localStorage.getItem('userData') || '{}');

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/app/finishplay`,
            {
                id: playId
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedData?.token}`
                }
            }
        );

        if(response.data.message === 'success') {
            window.location.href = `/quiz/${response.data.quiz}`
        }
    } catch (err) {
        console.log(err)
        toast.error(err.response?.data?.message)
    }
}

const CountDown = ({ minutes, playId }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    const fetchTimeLeft = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/app/gettime/${playId}`);
            const data = await res.json();

            if (data.time === null || data.time === undefined) {
                setTimeLeft(minutes * 60);
                await updatePlayTime(minutes * 60);
                return;
            }

            setTimeLeft(data.time);
        } catch {
            setTimeLeft(minutes * 60);
            await updatePlayTime(minutes * 60);
        }
    };

    useEffect(() => {
        fetchTimeLeft();
    }, [playId, minutes]);

    const updatePlayTime = async (time) => {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/app/updatetime/${playId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timeLeft: time }),
        });
    };

    useEffect(() => {
        if (timeLeft === null) return;
    
        const handleTimer = async () => {
            if (timeLeft <= 0) {
                await finishPlay(playId);
                return;
            }
        };
    
        handleTimer(); 
    
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = Math.max(prev - 1, 0);
                if (newTime % 5 === 0) updatePlayTime(newTime);
                return newTime;
            });
        }, 1000);
    
        return () => clearInterval(interval);
    }, [timeLeft]);
    

    return timeLeft !== null ? <span>{new Date(timeLeft * 1000).toISOString().substr(14, 5)}</span> : <span><i className="fa-solid fa-spinner fa-spin"></i></span>;
};

    
const Play = () => {
    const { id } = useParams();
    const { token, user } = useUserStore();

    const navigation = useNavigate();

    const [questionLoading, setQuestionLoading] = useState(false);

    const [quiz, setQuiz] = useState(null)
    const [play, setPlay] = useState(null)
    const [question, setQuestion] = useState(null)
    const [currentAnswers, setCurrentAnswers] = useState([]);

    const [quizDuration, setQuizDuration] = useState()

    const fetchQuestion = async (id) => {
        try {
            setQuestionLoading(true)

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/app/getquestion/${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
            );

            if(response.data.message === 'success') {
                const formatQuestion = {}
                formatQuestion.question = response.data.question
                formatQuestion.fields = response.data.fields
                
                setQuestion(formatQuestion)
            }

            setTimeout(() => {
                setQuestionLoading(false)
            }, 2500);
        } catch (err) {
            setQuestionLoading(false)
            toast.error(err.response?.data?.message)
        }
    }

    const fetchPlayView = async () => {
        try {            
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/app/getplayview/${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
            );

            if(response.data.message === 'success') {
                if(response.data.quiz && response.data.play) {
                    if(response.data.play.finished === true) {
                        navigation('/')
                    } else {
                        setQuiz(response.data.quiz)
                        setPlay(response.data.play)
    
                        setQuizDuration(response.data.play.time)
    
                        const currentQuestion = response.data.play.process.pop()
    
                        await fetchQuestion(currentQuestion.id)
                    }
                } else {
                    navigation('/')
                }
            }
        } catch (err) {
            navigation('/')
            toast.error(err.response?.data?.message)
        }
    }

    useEffect(() => {
        fetchPlayView()
    }, [id]);

    const totalPoints = quiz && quiz.questions && quiz.questions.reduce((sum, question) => sum + Number(question.maxPoints), 0);

    const handleAnswerChange = (questionId, fieldId, value, type) => {
        setCurrentAnswers((prev) => {
            let updatedAnswers = [...prev];

            if (type === "checkbox") {
                const existingEntry = updatedAnswers.find(
                    (ans) => ans.questionId === questionId && ans.fieldId === fieldId
                );

                if (existingEntry) {
                    const updatedValues = existingEntry.value.includes(value)
                        ? existingEntry.value.filter((v) => v !== value) 
                        : [...existingEntry.value, value]; 

                    updatedAnswers = updatedAnswers.map((ans) =>
                        ans.questionId === questionId && ans.fieldId === fieldId
                            ? { ...ans, value: updatedValues }
                            : ans
                    );
                } else {
                    updatedAnswers.push({ questionId, fieldId, value: [value] });
                }
            } else if(type === "radio") {
                const existingEntry = updatedAnswers.find(
                    (ans) => ans.questionId === questionId
                );

                if (existingEntry) {
                    updatedAnswers = updatedAnswers.map((ans) =>
                        ans.questionId === questionId
                            ? { ...ans, value: value }
                            : ans
                    );
                } else {
                    updatedAnswers.push({ questionId, fieldId, value: value });
                }
            } else {
                updatedAnswers = updatedAnswers.filter(
                    (ans) => !(ans.questionId === questionId && ans.fieldId === fieldId)
                );
                updatedAnswers.push({ questionId, fieldId, value });
            }

            return updatedAnswers;
        });
    };
    
    const [submitAnswerLoading, setSubmitAnswerLoading] = useState(false)

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();

        try {
            setSubmitAnswerLoading(true)

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/app/submitanswer`,
                {
                    id: id,
                    answer: currentAnswers
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if(response.data.message === 'success') {
                if(response.data.next === 'end') {
                    await finishPlay(id)
                } else {
                    setCurrentAnswers([])
                    await fetchQuestion(response.data.next.id)    
                }
            }

            setSubmitAnswerLoading(false)
        } catch (err) {
            setSubmitAnswerLoading(false)
            toast.error(err.response?.data?.message)
        }
    };

    return (
        <>
        <Navigation />

        {quiz && play && (
            <>
            <Container>
                <div className="play-quiz-view">
                    <div className="play-quiz-view-header">
                        <Row>
                            <Col xl={2} xs={12}>
                                <div className='play-quiz-view-header-image'>
                                    <img src={`${import.meta.env.VITE_BACKEND_URL}/${quiz.image}`} className='img-fluid' loading='lazy' alt={`${quiz.name} Photo`} />
                                </div>
                            </Col>
                            <Col xl={7} xs={12}>
                                <div className='play-quiz-view-header-info'>
                                    <h4>{quiz.title}</h4>
                                    <p><label>Total Points:</label> {totalPoints}</p>
                                    <p><label>Total Quiz Played:</label> {quiz.play.length} </p>
                                    <p><label>Created:</label> {new Date(quiz.createdAt).toLocaleDateString()}</p>
                                </div>
                            </Col>
                            <Col xl={3} xs={12}>
                                <div className='play-quiz-clock'>
                                    {quizDuration && <CountDown minutes={quizDuration} playId={id} />}
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <hr className='m-0' />

                    <div className="play-question-view">
                    {questionLoading && <SkeletonLoader type='question' />}

                    {!questionLoading && question && (
                        <>
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="play-question-view-q">
                                {question.question && question.question.image && <ImagePreview imageUrl={question.question.image} />}

                                <h3>
                                {question.question && question.question.tooltip && (
                                    <>

                                    <OverlayTrigger
                                    key={'tooltip-bottom'}
                                    placement={'bottom'}
                                    overlay={
                                        <Tooltip id={`tooltip-bottom`}>
                                        {question.question.tooltip}
                                        </Tooltip>
                                    }
                                    >
                                        <i className="fa-solid fa-clipboard-question"></i>
                                    </OverlayTrigger>
                                    </>
                                )}
                                
                                &nbsp;

                                {question.question.name}
                                </h3>
                            </div>

                            <Form onSubmit={handleSubmitAnswer}>
                                {question.fields && question.fields.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        className="play-question-options"
                                    >
                                        <div className="play-question-options">
                                            <Row>
                                                {question.fields.map((field, index) => (
                                                    <React.Fragment key={index}>
                                                        {field.type === "text" && (
                                                            <Col xl={12}>
                                                                <div className="option-image-preview">
                                                                    {field.image && (
                                                                        <>
                                                                            <ImagePreview imageUrl={field.image} />
                                                                            <hr />
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter your answer"
                                                                    value={
                                                                        currentAnswers.find(
                                                                            (ans) =>
                                                                                ans.questionId === question.question.id &&
                                                                                ans.fieldId === field.id
                                                                        )?.value || ""
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleAnswerChange(
                                                                            question.question.id,
                                                                            field.id,
                                                                            e.target.value,
                                                                            "text"
                                                                        )
                                                                    }
                                                                    className="form-control"
                                                                />
                                                            </Col>
                                                        )}

                                                        {field.type === "radio" && (
                                                            <Col xl={6} xs={12}>
                                                                <Card
                                                                    className="bg-dark text-white p-3 my-2 position-relative answer-input"
                                                                    onClick={() =>
                                                                        handleAnswerChange(question.question.id, field.id, field.value, "radio")
                                                                    }
                                                                    style={{ cursor: "pointer" }}
                                                                >
                                                                    <div className="option-image-preview">
                                                                        {field.image && (
                                                                            <>
                                                                                <ImagePreview imageUrl={field.image} />
                                                                                <hr />
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <InputGroup>
                                                                        <InputGroup.Radio
                                                                            name={`question-${question.question.id}`}  
                                                                            value={field.value}
                                                                            onChange={() =>
                                                                                handleAnswerChange(question.question.id, field.id, field.value, "radio")
                                                                            }
                                                                            checked={
                                                                                currentAnswers.find(
                                                                                    (ans) => ans.questionId === question.question.id
                                                                                )?.value === field.value
                                                                            }  
                                                                        />
                                                                        <b>{field.value}</b>
                                                                    </InputGroup>
                                                                </Card>
                                                            </Col>
                                                        )}

                                                        {field.type === "checkbox" && (
                                                            <Col xl={6} xs={12}>
                                                                <Card
                                                                    className="bg-dark text-white p-3 my-2 position-relative answer-input"
                                                                    onClick={() =>
                                                                        handleAnswerChange(
                                                                            question.question.id,
                                                                            field.id,
                                                                            field.value,
                                                                            "checkbox"
                                                                        )
                                                                    }
                                                                    style={{ cursor: "pointer" }}
                                                                >
                                                                    <div className="option-image-preview">
                                                                        {field.image && (
                                                                            <>
                                                                                <ImagePreview imageUrl={field.image} />
                                                                                <hr />
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <InputGroup>
                                                                        <InputGroup.Checkbox
                                                                            value={field.value}
                                                                            onChange={() =>
                                                                                handleAnswerChange(
                                                                                    question.question.id,
                                                                                    field.id,
                                                                                    field.value,
                                                                                    "checkbox"
                                                                                )
                                                                            }
                                                                            checked={
                                                                                currentAnswers.find(
                                                                                    (ans) =>
                                                                                        ans.questionId === question.question.id &&
                                                                                        ans.fieldId === field.id
                                                                                )?.value.includes(field.value) || false
                                                                            }
                                                                        />
                                                                        <b>{field.value}</b>
                                                                    </InputGroup>
                                                                </Card>
                                                            </Col>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </Row>
                                        </div>
                                    </motion.div>
                                )}

                                <center>
                                    <Button
                                        className="my-4 w-50"
                                        disabled={submitAnswerLoading}
                                        variant="success"
                                        size="lg"
                                        type="submit"
                                    >
                                        {submitAnswerLoading ? (
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fa-solid fa-arrow-right-long"></i>
                                        )}
                                    </Button>
                                </center>
                            </Form>

                        </motion.div>
                        </>
                    )}
                    </div>


                </div>
            </Container>
            </>
        )}
        </>
    )
}

export default Play;