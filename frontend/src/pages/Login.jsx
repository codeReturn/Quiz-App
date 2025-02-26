import { useState, useContext, useEffect } from 'react';
import { useUserStore } from '../stores/userStore';

import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';

import { toast } from 'react-toastify';

import LoadingSpinner from '../components/helpers/LoadingSpinner';

const Login = () => {
    const { login, logout } = useUserStore();
    
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if(!username || !password) {
            toast.error('All fields are required!')
            return;
        }
    
        try {
            setIsLoading(true)

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
                {
                    username: username,
                    password: password,
                    rememberme: remember
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
    
            if(response.data.message === 'success') {
                login(response.data.userId, response.data.token, response.data.expirationDate);
                navigate('/');
            }

            setIsLoading(false)
        } catch (err) {
            toast.error(err.response?.data?.message)
            setIsLoading(false)
        }
    };

    return (
        <>
        <Container>
            <div className='auth-block'>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    <div className='main-block'>
                        <h1>LOGIN</h1>

                        <div className='custom-space-auth-line'></div>

                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3" controlId="loginForm.ControlInputUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="loginForm.ControlInputPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" onChange={(e) => setPassword(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                            <Form.Check
                                type={'checkbox'}
                                id={`default-checkbox`}
                                label={`Remember me`}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            </Form.Group>
                            
                            <center>
                            <Button variant='primary' disabled={isLoading} type='submit'className='w-100 mb-3'> {isLoading ? <LoadingSpinner asOverlay={false} /> : 'Sign In'} </Button>

                            <Link to='/register'>
                                <Button variant='dark' className='w-100'>Create a account</Button>
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

export default Login;