import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useUserStore } from '../../stores/userStore';

import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';

const Navigation = () => {
    const { logout } = useUserStore()
    const navigation = useNavigate()

    return (
        <>
        <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
            <Nav
                className="me-auto my-2 my-lg-0"
                navbarScroll
            >
                <Link to='/' className="nav-link"> <i className="fa-solid fa-house-fire"></i> Home</Link>
                <Link to='/quizes' className="nav-link"> <i className="fa-solid fa-list"></i> Quizes List </Link>
                <Link to='/create-quiz' className="nav-link"> <i className="fa-solid fa-plus"></i> Create Quiz</Link>
            </Nav>
            <div className="d-flex">
                <Button variant='danger' size='sm' onClick={() => logout()}>LOGOUT</Button>
            </div>
            </Navbar.Collapse>
        </Container>
        </Navbar>
        </>
    )
}

export default Navigation;