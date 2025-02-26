import { useState, useContext } from 'react';
import { useUserStore } from '../stores/userStore';

import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';

import { toast } from 'react-toastify';

import LoadingSpinner from '../components/helpers/LoadingSpinner';

const Register = () => {
    const { login } = useUserStore()
    
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if(!username || !email || !name || !password) {
            toast.error('All fields are required!')
            return;
        }
    
        try {
            setIsLoading(true)

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/signup`,
                {
                    username: username,
                    email: email,
                    name: name,
                    password: password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
    
            if(response.data.message === 'success') {
                navigate('/');
            }

            setIsLoading(false)
        } catch (err) {
            setIsLoading(false)
            toast.error(err.response?.data?.message)
        }
    };
    

    return (
        <>
        <Container>
            <div className='auth-block'>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    <div className='main-block'>
                        <h1>Create Account</h1>

                        <div className='custom-space-auth-line'></div>

                        <Form onSubmit={handleRegister}>
                            <Form.Group className="mb-3" controlId="loginForm.ControlInputUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="loginForm.ControlInputEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="loginForm.ControlInputName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="loginForm.ControlInputPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </Form.Group>

                            <center>
                            <Button variant='primary' type='submit'className='w-100 mb-3'> {isLoading ? <LoadingSpinner asOverlay={false} /> : 'Sign Up'} </Button>

                            <Link to='/login'>
                                <Button variant='dark' className='w-100'>Login</Button>
                            </Link>

                            </center>
                        </Form>
                    </div>
                </Col>
            </Row>
            </div>
        </Container>
        </>
    )
}

export default Register;