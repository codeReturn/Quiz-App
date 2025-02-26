import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useUserStore } from '../stores/userStore';

import Navigation from '../components/helpers/Navigation';

import { Container, Row, Col, Button, Tabs, Tab, Card, Badge, Modal, Form, Table } from 'react-bootstrap';

import axios from 'axios';
import SkeletonLoader from '../components/helpers/SkeletonLoader';
import LoadingSpinner from '../components/helpers/LoadingSpinner';

import { toast } from 'react-toastify';

import Select from 'react-select'
import { customStyles } from '../components/helpers/SelectStyle';

import { motion } from 'framer-motion';

const Quiz = () => {
    const { userId, token, user } = useUserStore();

    const id = useParams().id;
    const navigation = useNavigate();
    
    const [quizLoading, setQuizLoading] = useState(false)
    const [quiz, setQuiz] = useState(null)

    const [invites, setInvites] = useState(null)
    const [options, setOptions] = useState([])

    const [leaderboard, setLeaderboard] = useState([])
 
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/getusers`);
            const formatOptions = response.data.users
                .filter((u) => !invites?.includes(u.username)) 
                .map((u) => ({
                    label: u.username,
                    value: u.username,
                }));
    
            setOptions(formatOptions);
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const fetchQuiz = async () => {
        try {
            setQuizLoading(true)

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/app/getquiz/${id}`)

            if(!response.data.quiz) {
                navigation('/')
            } else {
                setQuiz(response.data.quiz)
                setLeaderboard(response.data.leaderboard)
                if(response.data.quiz.private === true) {
                    setInvites(response.data.quiz.allowed)                    
                }
            }

            setQuizLoading(false)
        } catch (err) {
            toast.error(err.response?.data?.message)
            setQuizLoading(false)
        }
    }

    useEffect(() => {
        fetchQuiz()
    }, [id]);

    const totalPoints = quiz && quiz.questions && quiz.questions.reduce((sum, question) => sum + Number(question.maxPoints), 0);
    const totalBonusPoints = quiz && quiz.bonusesList && quiz.bonusesList.reduce((sum, bonus) => sum + Number(bonus.points), 0);

    const handleQuizAction = async (id, action) => {
        try {
            setQuizLoading(true)

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/app/quizaction`, {
                id,
                action
            }, {
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: 'Bearer ' + token
                }
            });
              
            if(response.data.message === 'success') {
                await fetchQuiz()
            }
 
            setQuizLoading(false)
        } catch (err) {
            toast.error(err.response?.data?.message)
            setQuizLoading(false)
        }
    }

    const [show, setShow] = useState(false);

    const [showInviteForm, setShowInviteForm] = useState(false)
    const handleShowInviteForm = async () => {
        setShowInviteForm(!showInviteForm)
        if(!showInviteForm) await fetchUsers()
    }

    const handleClose = () => setShow(false);
    const handleShow = async () => {
        setShow(true);
    }

    const [invitesValue, setInvitesValue] = useState([])
    const [menuOpen, setMenuOpen] = useState(false); 
    const [invitesLoading, setInvitesLoading] = useState(false) 
    
    const handleInviteChange = (value) => {
        setInvitesValue(value)
    }

    const handleInvites = async (e) => {
        e.preventDefault();

        if(invitesValue.length === 0) {
            toast.error('Invites are empty!')
            return;
        }

        try {
            setInvitesLoading(true)

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/app/sendinvites`, {
                id: quiz.id,
                invites: invitesValue
            }, {
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: 'Bearer ' + token
                }
            });

            if(response.data.message === 'success') {
                const formatValues = invitesValue.map((i) => i.value)
                const formatInvites = invites.concat(formatValues)
                setInvites(formatInvites);
                setInvitesValue([])

                setShowInviteForm(false)
            }

            setInvitesLoading(false)
        } catch (err) {
            setInvitesLoading(false)
            toast.error(err.response?.data?.message)
        }
    }

    const removeInvite = async (user) => {
        if(!user) {
            toast.error('Invalid data!')
            return;
        }

        try {
            setInvitesLoading(true)

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/app/removeinvite`, {
                id: quiz.id,
                user: user
            }, {
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: 'Bearer ' + token
                }
            });

            if(response.data.message === 'success') {
                setInvites((prev) => {
                    return prev.filter((u) => u !== user)
                })
            }

            setInvitesLoading(false)
        } catch (err) {
            setInvitesLoading(false)
            toast.error(err.response?.data?.message)
        }

    }

    const [startLoading, setStartLoading] = useState(false)

    const handleStartQuiz = async () => {
        try {
            setStartLoading(true)

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/app/startquiz`, {
                id: quiz.id,
                username: user.username
            }, {
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: 'Bearer ' + token
                }
            });

            if(response.data.message === 'success') {
                navigation(`/play/${response.data.id}`)
            }
           
            setStartLoading(false)
        } catch (err) {
            setStartLoading(false)
            toast.error(err.response?.data?.message)
        }

    }

    return (
        <>
        <Navigation />

        {startLoading && <LoadingSpinner asOverlay={true} />}

        <Container>
            <div className='quiz-info'>
            {quizLoading && <SkeletonLoader type='quiz-info' />}

            {!quizLoading && quiz && (
                <>
                {quiz.private && (
                    <>
                    <Modal show={show} onHide={handleClose} data-bs-theme='dark'>
                        <Modal.Header closeButton>
                        <Modal.Title>Invites</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='position-relative'>

                        {invitesLoading && <LoadingSpinner asOverlay={true} />}
                        
                        <Button variant={showInviteForm ? 'danger' : 'success'} onClick={handleShowInviteForm} size='sm' className='my-2'>{showInviteForm ? 'Close' : 'Send Invites'}</Button>

                        {showInviteForm && (
                            <>
                            <Form onSubmit={handleInvites}>
                                <Select
                                options={options}
                                onInputChange={(value) => {
                                    setMenuOpen(value.length > 1); 
                                }}
                                onChange={handleInviteChange}
                                value={invitesValue}
                                styles={customStyles}
                                menuIsOpen={menuOpen}
                                isClearable
                                placeholder="Enter member username to invite"
                                isMulti
                                />

                                <Button variant='success' size='sm' type='submit' className='my-2'> Invite </Button>
                            </Form>
                            </>
                        )}

                        {invites && invites.length > 0 && (
                            <>
                            <hr />
                            <h4>List</h4>
                            <Table responsive striped className='invites-table'>
                            <thead>
                                <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invites.map((i, index) => {
                                    return (
                                        <React.Fragment key={`i-${index}`}>
                                        <tr>
                                        <td>{index + 1}.</td>
                                        <td>{i}</td>
                                        <td>
                                            <Button variant='danger' className='m-1' size='sm' onClick={() => removeInvite(i)}><i className="fa-solid fa-trash"></i></Button>
                                        </td>
                                        </tr>
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                            </Table>
                            </>
                        )}
    
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        </Modal.Footer>
                    </Modal>
                    </>
                )}

                {userId === quiz.authorId && (
                    <>
                    <div className="bg-dark text-white p-3 my-2 position-relative">
                        {quiz.private === true && (
                            <>
                            <Button variant='info' className='m-1' onClick={handleShow}><i className="fa-solid fa-users"></i> Invites</Button>
                            </>
                        )}

                        <Button variant='danger' className='m-1' onClick={() => handleQuizAction(quiz.id, 'resetleaderboard')}><i className="fa-solid fa-power-off"></i> Reset Leaderboard</Button>

                        {quiz.active === true && (
                            <>
                            <Button variant='danger' className='m-1' onClick={() => handleQuizAction(quiz.id, 'close')}><i className="fa-solid fa-xmark"></i> Close</Button>
                            </>
                        )}
                        <Button variant='danger' className='m-1' onClick={() => handleQuizAction(quiz.id, 'delete')}><i className="fa-solid fa-trash"></i> Delete</Button>
                    </div>
                    </>
                )} 

                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6, delay: 0.2 }} 
                >
                <div className='quiz-info-page'>
                    <div className='quiz-info-header'>
                        <Row>
                            <Col xl={3} xs={4}>
                                <div className='slider-quiz-block-addons-block'>
                                    <h3><i className="fa-solid fa-clock"></i></h3>
                                    <p>{Number(quiz.duration / 60)} <small>m</small></p>
                                    <small>Duration</small>
                                </div>
                            </Col>
                            <Col xl={3} xs={4}>
                                <div className='slider-quiz-block-addons-block'>
                                    <h3><i className="fa-solid fa-list"></i></h3>
                                    <p>{quiz.questions.length}</p>
                                    <small>Total questions</small>
                                </div>
                            </Col>
                            <Col xl={3} xs={4}>
                                <div className='slider-quiz-block-addons-block'>
                                    <h3><i className="fa-solid fa-star"></i></h3>
                                    <p>{quiz.bonusesList.length}</p>
                                    <small>Total bonuses</small>
                                </div>
                            </Col>
                            <Col xl={3} xs={12}>
                                <div className='slider-quiz-block-addons-block'>
                                    <Button variant='success' onClick={handleStartQuiz} disabled={quiz.active === false || (quiz.private === true && !quiz.allowed?.includes(user.username))} className='w-100' size='lg'>
                                        <h3><i className="fa-solid fa-play"></i></h3>
                                        <p>Start Quiz</p>
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <Row>
                        <Col xl={3} xs={12}>
                        <div className='quiz-info-image position-relative'>
                            <Badge bg="dark">{quiz.private === true ? <i className="fa-solid fa-lock"></i> : <i className="fa-solid fa-globe"></i> }</Badge>
                            <img src={`${import.meta.env.VITE_BACKEND_URL}/${quiz.image}`} className='img-fluid' loading='lazy' alt={`${quiz.name} Photo`} />
                        </div>
                        </Col>
                        <Col xl={9} xs={12}>
                        <div className='quiz-info-general'>
                            <h3>{quiz.title}</h3>
                            <hr />
                            <p>{quiz.description}</p>
                            <hr />
                            <label>Total Quiz Points:</label> <b>{totalPoints}</b> <br />
                            <label>Total Bonuses:</label> <b>{quiz.bonusesList ? quiz.bonusesList.length : 0} <small style={{ color: 'green' }}>({totalBonusPoints})</small></b> <br />
                            <label>Total Members:</label> <b>{leaderboard && leaderboard.length}</b>
                        </div>
                        </Col>
                    </Row>

                    <hr />

                    <div className='quiz-tabs'>
                        <Tabs
                        defaultActiveKey="questions"
                        id="uncontrolled-tab-questions"
                        className="my-3"
                        >
                            <Tab eventKey="questions" title="Questions">
                                {quiz.questions && quiz.questions.length > 0 ? (
                                    <>
                                    {quiz.questions.map((q, index) => {
                                        return (
                                            <React.Fragment key={`q-${index}`}>
                                                <Card className="bg-dark text-white p-3 my-2 position-relative">
                                                    <div className='point-card-absolute'><Badge bg='success'>{q.maxPoints}</Badge></div>
                                                    {q.name}
                                                </Card>
                                            </React.Fragment>
                                        )
                                    })}
                                    </>
                                ) : <p>No results!</p>}
                            </Tab>
                            <Tab eventKey="leaderboard" title="Leaderboard">
                                {leaderboard && leaderboard.length > 0 ? (
                                    <>
                                    <Table striped hover variant="dark" responsive>
                                    <thead>
                                        <tr>
                                        <th>Rank</th>
                                        <th>Username</th>
                                        <th>Points <small>(bonus)</small></th>
                                        <th>Attempts</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((l, index) => {
                                            return (
                                                <React.Fragment key={`l-b-${index}`}>
                                                    <tr>
                                                    <td>{index + 1}.</td>
                                                    <td>{l.author.username}</td>
                                                    <td>{l.points} <small style={{ color: 'green'}}>({l.bonus})</small></td>
                                                    <td>{l.attempts}</td>
                                                    </tr>
                                                </React.Fragment>
                                            )
                                        })}
                                    </tbody>
                                    </Table>

                                    </>
                                ) : <p>No results!</p>}
                            </Tab>
                        </Tabs>
                    </div>
                </div>
                </motion.div>
                </>
            )}
            </div>
        </Container>
        </>
    )
}

export default Quiz;