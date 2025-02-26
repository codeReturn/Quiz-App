import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUserStore } from '../stores/userStore';

import Navigation from '../components/helpers/Navigation';

import { Col, Container, Row, Form, Image, Button, InputGroup, Table, Accordion, OverlayTrigger, Tooltip, Badge, Card } from 'react-bootstrap';

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

import { nanoid } from 'nanoid'
import { toast } from 'react-toastify';

import axios from 'axios';

import LoadingSpinner from '../components/helpers/LoadingSpinner';

import { motion } from 'framer-motion';

const CreateQuiz = () => {
    const { token } = useUserStore();
    const navigation = useNavigate()

    const [isLoading, setIsLoading] = useState(false)

    const [showImageInput, setShowImageInput] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [duration, setDuration] = useState(5)
    const [endDate, setEndDate] = useState(null)
    const [bonusPoints, setBonusPoints] = useState(false)
    const [showBonusForm, setShowBonusForm] = useState(false)

    const [bonusPointsValue, setBonusPointsValue] = useState()
    const [bonusTimeValue, setBonusTimeValue] = useState()
    const [bonusesList, setBonusesList] = useState([])

    const [addQuestionForm, setAddQuestionForm] = useState(false)
    const [addQuestionType, setAddQuestionType] = useState('')

    const [questions, setQuestions] = useState([])
    const [currentQuestion, setCurrentQuestion] = useState(null)
    const [maxPoints, setMaxPoints] = useState("");

    const [showOptionsImages, setShowOptionsImages] = useState([])

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const [quizPrivate, setQuizPrivate] = useState(false)

    const handleImageChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      }
    };
  
    const resetImage = () => {
        setFile(null)
        setPreview(null)
    }

    const handleCreateQuiz = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("duration", duration);
        formData.append("endDate", endDate);
        formData.append("bonusesList", JSON.stringify(bonusesList));
        formData.append("file", file);
        formData.append("questions", JSON.stringify(questions));
        formData.append("private", quizPrivate);

    
        try {
          setIsLoading(true)

          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/app/createquiz`, formData, {
            headers: { 
                "Content-Type": "multipart/form-data",
                Authorization: 'Bearer ' + token
            },
          });
          
          if(response.data.message === 'success' && response.data.quiz) {
            navigation(`/quiz/${response.data.quiz.id}`)
            toast.success('Quiz created!')
          }

          setIsLoading(false)
        } catch (err) {
          setIsLoading(false)
          toast.error(err.response?.data?.message)
        }
    }

    const handleQuizEndDate = (e) => {
        if(e.target.checked) {
            setEndDate(new Date())
        } else {
            setEndDate(null)
        }
    }

    const handleQuizBonusPoints = (e) => {
        setBonusPoints(e.target.checked)
    }

    const addBonusPoints = () => {
        const time = Number(bonusTimeValue);
        const points = Number(bonusPointsValue);
    
        if (!time || !points) {
            toast.error("Invalid data");
            return;
        }
    
        if (time >= duration) {
            toast.error("Bonus time must be less than the specified duration.");
            return;
        }

        const check = bonusesList.find((bl) => bl.time === time)
        if(check) {
            toast.error("Invalid time data");
            return;
        }
    
        const obj = {
            id: nanoid(),
            time,
            points
        };
    
        setBonusesList((prev) => [...prev, obj]);
    };
    
    const deleteBonus = (id) => {
        if(!id) {
            toast.error("Invalid data");
            return;
        }

        const filter = bonusesList.filter((bl) => bl.id !== id)
        setBonusesList(filter)
    }

    const handleAddQuestion = () => {
        setAddQuestionForm(!addQuestionForm)
        setShowImageInput(false)

        if(addQuestionForm) {
            setAddQuestionType('')
            setCurrentQuestion(null)
        }
    }

    const handleQuestionType = (type) => {
        setAddQuestionType(type)
        setCurrentQuestion({
            id: nanoid(),
            name: "",
            tooltip: "",
            type: type,
            fields: type === "text"
                ? [{ id: nanoid(), name: "Correct Answer", type: "text", value: "", image: "" }]
                : [
                    { id: nanoid(), name: "Option 1", type, value: "", image: "", isCorrect: false },
                    { id: nanoid(), name: "Option 2", type, value: "", image: "", isCorrect: false }
                ]
        });
    };

    const handleQuestionNameChange = (e) => {
        setCurrentQuestion(prev => ({ ...prev, name: e.target.value }));
    };

    const handleQuestionImageChange = (e) => {
        setCurrentQuestion(prev => ({ ...prev, image: e.target.value }));
    };


    const handleQuestionTooltipChange = (e) => {
        setCurrentQuestion(prev => ({ ...prev, tooltip: e.target.value }));
    };

    const handleFieldChange = (fieldId, newValue) => {
        setCurrentQuestion(prev => ({
            ...prev,
            fields: prev.fields.map(field =>
                field.id === fieldId ? { ...field, value: newValue } : field
            )
        }));
    };

    const handleFieldImageChange = (fieldId, newValue) => {
        setCurrentQuestion(prev => ({
            ...prev,
            fields: prev.fields.map(field =>
                field.id === fieldId ? { ...field, image: newValue } : field
            )
        }));
    };

    const toggleCorrectAnswer = (fieldId) => {
        setCurrentQuestion(prev => ({
            ...prev,
            fields: prev.fields.map(field =>
                field.id === fieldId ? { ...field, isCorrect: !field.isCorrect } : field
            )
        }));
    };

    const removeQuestionOption = (fieldId) => {
        setCurrentQuestion(prev => ({
            ...prev,
            fields: prev.fields.filter(field => field.id !== fieldId) 
        }));
    };

    const addQuestionToState = () => {
        if (!currentQuestion.name.trim()) {
            toast.error("Please enter a question title.");
            return;
        }

        if (currentQuestion.type !== "text" && !currentQuestion.fields.some(field => field.isCorrect)) {
            toast.error("Please mark at least one correct answer.");
            return;
        }

        if (!maxPoints) {
            toast.error("Please specify max points.");
            return;
        }

        setQuestions(prev => [...prev, { ...currentQuestion, maxPoints }]);
        setCurrentQuestion(null);
        setAddQuestionForm(false)
        setAddQuestionType('')
        setMaxPoints("");
    };

    const addQuestionOption = () => {
        setCurrentQuestion(prev => ({
            ...prev,
            fields: [...prev.fields, { id: nanoid(), name: `Option ${(prev.fields.length + 1)}`, type: addQuestionType, value: "", image: "", isCorrect: false }]
        }));
    }

    const deleteQuestion = (id) => {
        setQuestions((prev) => {
            return prev.filter((q) => q.id !== id)
        })
    }

    const handleDisplayImageInput = () => {
        setShowImageInput(!showImageInput)
    }

    const handleDisplayImageOption = (id) => {
        setShowOptionsImages((prev) => [...prev, id])
    }

    return (
        <>
        <Navigation />

        {isLoading && <LoadingSpinner asOverlay={true} />}

        <Container fluid>
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
            <div className="page-form">
                <h1>Create Quiz</h1>
                <hr />

                <Form onSubmit={handleCreateQuiz}>
                    <Row>
                        <Col lg={4} xs={12}>

                            <h2 className='page-form-custom-h2'>Informations <span className="required">*</span></h2>
                            
                            <Form.Label className="quiz-image-picker">
                                <Form.Control type="file" className="d-none" onChange={handleImageChange} accept="image/*" />
                                {preview ? (
                                    <>
                                    <Image src={preview} alt="Preview" className="img-fluid" />
                                    
                                    <Button variant='danger' onClick={resetImage}><i className="fa-solid fa-circle-minus"></i></Button>
                                    </>
                                ) : (
                                    <p><i className="fa-solid fa-file-image"></i></p>
                                )}
                            </Form.Label>

                            <Form.Group className="mb-3" controlId="quizForm.Title">
                                <Form.Label>Quiz Title</Form.Label>
                                <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="quizForm.Description">
                                <Form.Label>Quiz Description</Form.Label>
                                <Form.Control as="textarea" value={description} rows={5} onChange={(e) => setDescription(e.target.value)} />
                            </Form.Group>

                        </Col>
                        <Col lg={5} xs={12}>
                            
                            <Button variant={addQuestionForm ? 'danger' : 'success'} className='float-end' onClick={() => handleAddQuestion()}>{addQuestionForm ? 'Close' : 'Add Question'}</Button>
                            <h2 className='page-form-custom-h2'>Structure <span className="required">*</span></h2>

                            {addQuestionForm && !addQuestionType && (
                                <>
                                <Row>
                                <Col xl={4} xs={12}>
                                    <div className='question-type' onClick={() => handleQuestionType('text')}>
                                        <h1><i className="fa-solid fa-font"></i></h1>
                                        <p>Text Input</p>
                                        <small>Single-line response</small>
                                    </div>
                                </Col>
                                <Col xl={4} xs={12}>
                                    <div className='question-type' onClick={() => handleQuestionType('radio')}>
                                        <h1><i className="fa-regular fa-circle-dot"></i></h1>
                                        <p>Radio Button</p>
                                        <small>Select one option</small>
                                    </div>
                                </Col>
                                <Col xl={4} xs={12}>
                                    <div className='question-type' onClick={() => handleQuestionType('checkbox')}>
                                        <h1><i className="fa-solid fa-square-check"></i></h1>
                                        <p>Checkbox</p>
                                        <small>Select multiple options</small>
                                    </div>
                                </Col>
                                </Row>
                                </>
                            )}

                            {addQuestionType && (
                                <>
                                {currentQuestion && (
                                    <div className="question-container">
                                        <Form.Group className="mb-3" controlId="quizForm.Tooltip">
                                            <Form.Label>Question Tooltip</Form.Label>
                                            <Form.Control type="text" onChange={(e) => handleQuestionTooltipChange(e)} />
                                        </Form.Group>

                                        <InputGroup className="mb-3">
                                        <Form.Control type="text" value={currentQuestion.name} onChange={handleQuestionNameChange} placeholder="Enter question title" className="question-title-form" />

                                        {!showImageInput ? (
                                            <>
                                            <Button variant='success' size='sm' onClick={() => handleDisplayImageInput()}><i className="fa-solid fa-image"></i></Button>
                                            </>
                                        ) : (
                                            <>
                                            <Form.Control type="text" value={currentQuestion.image} onChange={handleQuestionImageChange} placeholder="Enter question image url" className="question-title-form" />
                                            </>
                                        )}

                                        </InputGroup>

                                        {addQuestionType !== 'text' && (
                                            <>
                                            <Button onClick={() => addQuestionOption()} variant='success' size='sm' className='mb-3'>
                                                Add Option
                                            </Button>
                                            </>
                                        )}

                                        {currentQuestion.fields.map(field => (
                                            <div key={field.id} className="field-container">
                                                {currentQuestion.type === "text" ? (
                                                    <input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                        placeholder="Enter correct answer"
                                                        className="form-control"
                                                    />
                                                ) : (
                                                    <div className="option-container">
                                                        <InputGroup className="mb-3">
                                                        <input
                                                            type="text"
                                                            value={field.value}
                                                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                            placeholder="Enter option"
                                                            className="form-control"
                                                        />

                                                        {!showOptionsImages.includes(field.id) ? (
                                                            <>
                                                            <Button variant='success' size='sm' onClick={() => handleDisplayImageOption(field.id)}><i className="fa-solid fa-image"></i></Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                            <Form.Control type="text" value={field.image} onChange={(e) => handleFieldImageChange(field.id, e.target.value)} placeholder="Enter option image url" />
                                                            </>
                                                        )}

                                                        {field.type === 'radio' && (
                                                            (!currentQuestion.fields.some(f => f.isCorrect) || field.isCorrect) && (
                                                                <Button 
                                                                    onClick={() => toggleCorrectAnswer(field.id, 'radio')} 
                                                                    variant={field.isCorrect ? "success" : "dark"}
                                                                >
                                                                    {field.isCorrect ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-check"></i>}
                                                                </Button>
                                                            )
                                                        )}

                                                        {field.type === 'checkbox' && (
                                                            <Button 
                                                                onClick={() => toggleCorrectAnswer(field.id, 'checkbox')} 
                                                                variant={field.isCorrect ? "success" : "dark"}
                                                            >
                                                                {field.isCorrect ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-check"></i>}
                                                            </Button>
                                                        )}


                                                        <Button onClick={() => removeQuestionOption(field.id)} variant='danger'>
                                                            <i className="fa-solid fa-trash"></i>
                                                        </Button>
                                                        </InputGroup>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <hr />

                                        <h5>Points</h5>

                                        <input
                                            type="number"
                                            value={maxPoints}
                                            onChange={(e) => setMaxPoints(e.target.value)}
                                            placeholder="Max Points"
                                            className="form-control"
                                        />

                                        <hr />

                                        <Button onClick={addQuestionToState} className="w-100" variant='success'>Add Question</Button>
                                    </div>
                                )}
                                </>
                            )}

                            {questions && questions.length > 0 ? (
                                <>
                                <Accordion defaultActiveKey="0" className='mt-3'>
                                    {questions.map((q, index) => {
                                        return (
                                            <React.Fragment key={`q-${index}`}>
                                                <Accordion.Item eventKey={index}>
                                                <Accordion.Header>{q.name}</Accordion.Header>
                                                <Accordion.Body>
                                                    <div className='question-accordion'>

                                                    <Badge bg="success" className='float-end'>{q.maxPoints}</Badge>

                                                    {q.tooltip && (
                                                        <>
                                                        <OverlayTrigger overlay={<Tooltip id={`q-tooltip-${index}`}>{q.tooltip}</Tooltip>}>
                                                            <i className="fa-solid fa-clipboard-question"></i>
                                                        </OverlayTrigger>

                                                        &nbsp;
                                                        </>
                                                    )}

                                                    {q.name} 

                                                    {q.fields && q.fields.length > 0 && q.fields.map((q, index) => {
                                                        return (
                                                            <Card className="bg-dark text-white my-2 p-2 position-relative" id={`q-${index}`}>
                                                                {q.isCorrect && q.isCorrect === true && (
                                                                    <>
                                                                    <i className="fa-solid fa-circle-check custom-circle-display"></i>
                                                                    </>
                                                                )}
                                                                {q.value}
                                                            </Card>
                                                        )
                                                    })}

                                                    <hr />

                                                    <Button variant='danger' className='w-100' onClick={() => deleteQuestion(q.id)}> DELETE </Button>
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                            </React.Fragment>
                                        )
                                    })}
                                </Accordion>
                                </>
                            ) : (
                                <>
                                <div className='quiz-questions-noresults'>
                                    <h1><i className="fa-solid fa-list"></i></h1>
                                </div>
                                </>
                            )}

                        </Col>
                        <Col lg={3} xs={12}>
                                
                            <h2 className='page-form-custom-h2'>Settings</h2>

                            <Form.Group className="mb-3" controlId="quizForm.Duration">
                                <Form.Label>Quiz Duration <span className="required">*</span></Form.Label>
                                <Form.Control type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                                <Form.Text id="quizDurationHelpBlock" muted>
                                    Quiz duration in minutes.
                                </Form.Text>
                            </Form.Group>
                            
                            <hr />

                            <Form.Group className="mb-3" controlId="quizForm.endDate">
                                <Form.Check 
                                    type='checkbox'
                                    label={`Quiz end date`}
                                    onChange={(e) => handleQuizEndDate(e)}
                                />

                                {endDate && (
                                    <>
                                    <DatePicker selected={endDate} className="form-control my-1" minDate={new Date()} onChange={(date) => setEndDate(date)} />
                                    </>
                                )}
                            </Form.Group>

                            <hr />

                            <Form.Group className="mb-3" controlId="quizForm.bonuses">
                                <Form.Check 
                                    type='checkbox'
                                    label={`Bonus Points`}
                                    onChange={(e) => handleQuizBonusPoints(e)}
                                />

                                {bonusPoints && (
                                    <>
                                    <Button variant={showBonusForm ? 'danger' : 'primary'} size='sm' className='my-2' onClick={() => setShowBonusForm(!showBonusForm)}>{showBonusForm ? 'Close' : 'Add Bonus Points'}</Button>
                                    
                                    {showBonusForm && (
                                        <>
                                        <InputGroup className="mb-3">
                                            <Form.Control type="number" value={bonusTimeValue} onChange={(e) => setBonusTimeValue(e.target.value)} placeholder="Before time" />
                                            <Form.Control type="number" value={bonusPointsValue} onChange={(e) => setBonusPointsValue(e.target.value)} placeholder="Points" />
                                            <Button variant='success' onClick={() => addBonusPoints()}>Save</Button>

                                            <Form.Text id="quizDurationHelpBlock" muted>
                                            Award bonus points if the user completes the quiz before the specified time.
                                            </Form.Text>
                                        </InputGroup>
                                        </>
                                    )}

                                    {bonusesList && bonusesList.length > 0 && (
                                        <>
                                        <Table variant="dark" responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Time</th>
                                                <th>Points</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bonusesList.map((bl, index) => {
                                                return (
                                                    <React.Fragment key={`bl-${index}`}>
                                                    <tr>
                                                        <td>{index + 1}.</td>
                                                        <td>{bl.time}</td>
                                                        <td>{bl.points}</td>
                                                        <td className='table-btn-options'><Button variant='danger' size='sm' onClick={() => deleteBonus(bl.id)}><i className="fa-solid fa-minus"></i></Button></td>
                                                    </tr>
                                                    </React.Fragment>
                                                )
                                            })}
                                        </tbody>
                                        </Table>
                                        </>
                                    )}
                                    </>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="quizForm.private">
                                <Form.Check 
                                    type='checkbox'
                                    label={`Private Quiz`}
                                    onChange={(e) => setQuizPrivate(e.target.checked)}
                                />

                            </Form.Group>
                        </Col>
                    </Row>

                    <Button variant='success' size='lg' className='w-100 my-4' type='submit'> Create Quiz </Button>
                </Form>
            </div>
            </motion.div>
        </Container>
        </>
    )
}

export default CreateQuiz;