import React, { useState, useEffect } from 'react';

import { Col, Container, Row, Badge } from 'react-bootstrap';

import Navigation from '../components/helpers/Navigation';

import axios from 'axios';

import { toast } from 'react-toastify';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

import SkeletonLoader from '../components/helpers/SkeletonLoader';
import { Link } from 'react-router-dom';

import { motion } from "framer-motion";

const Dashboard = () => {
    const [latestLoading, setLatestLoading] = useState(false)
    const [latestQuizes, setLatestQuizes] = useState([])

    const [mostLoading, setMostLoading] = useState(false)
    const [mostQuizes, setMostQuizes] = useState([])

    const fetchLatestQuizes = async () => {
        try {
            setLatestLoading(true)

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/app/latestquizes`)
            setLatestQuizes(response.data.quizes)

            setLatestLoading(false)
        } catch (err) {
            toast.error(err.response?.data?.message)
            setLatestLoading(false)
        }
    }
    
    const fetchMostPlayedQuizes = async () => {
        try {
            setMostLoading(true)

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/app/getmostplayed`)
            setMostQuizes(response.data.quizes)

            setMostLoading(false)
        } catch (err) {
            toast.error(err.response?.data?.message)
            setMostLoading(false)
        }
    }

    useEffect(() => {
        fetchMostPlayedQuizes();
        fetchLatestQuizes();
    }, []);

    var settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        initialSlide: 0,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              infinite: true,
              dots: true
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              initialSlide: 1
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
    };
    
    
    return (
        <>
        <Navigation />

        <Container fluid>
        <div className='dashboard-block'>
            <h1><i className="fa-solid fa-star"></i> Popular Quizes</h1>
            <hr />

            {mostLoading && <SkeletonLoader type='slider' />}

            {!mostLoading && mostQuizes && mostQuizes.length > 0 && (
                <>
                <div className="slider-container">
                <Slider {...settings}>
                    {mostQuizes.map((mq, index) => {
                        const formatDuration = Number(mq.duration / 60)
                        return (
                            <div key={`mq-${index}`} className='slider-quiz-link'>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ duration: 0.6, delay: 0.2 }} 
                            >
                               <Link to={`/quiz/${mq.id}`}>
                               <div className='slider-quiz-block position-relative shadow-sm'>
                                    <div className='slider-quiz-block-image'>
                                        <Badge bg="dark">{mq.private === true ? <i className="fa-solid fa-lock"></i> : <i className="fa-solid fa-globe"></i>}</Badge>
                                        <img src={`${import.meta.env.VITE_BACKEND_URL}/${mq.image}`} className='img-fluid' loading='lazy' alt={`${mq.name} Photo`} />
                                    </div>
                                    <div className='slider-quiz-block-info'>
                                        <h4>{mq.title}</h4>
                                        <div className='slider-quiz-block-info-desc'>
                                        {mq.description.length > 500 ? mq.description.substring(0, 500) + "..." : mq.description}
                                        </div>
                                    </div>
                                    <div className='slider-quiz-block-addons'>
                                        <Row>
                                            <Col xl={4} xs={4}>
                                                <div className='slider-quiz-block-addons-block'>
                                                    <h3><i className="fa-solid fa-clock"></i></h3>
                                                    <p>{formatDuration} <small>m</small></p>
                                                    <small>Duration</small>
                                                </div>
                                            </Col>
                                            <Col xl={4} xs={4}>
                                                <div className='slider-quiz-block-addons-block'>
                                                    <h3><i className="fa-solid fa-list"></i></h3>
                                                    <p>{mq.questions.length}</p>
                                                    <small>Total questions</small>
                                                </div>
                                            </Col>
                                            <Col xl={4} xs={4}>
                                                <div className='slider-quiz-block-addons-block'>
                                                    <h3><i className="fa-solid fa-star"></i></h3>
                                                    <p>{mq.bonusesList.length}</p>
                                                    <small>Total bonuses</small>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                               </div>
                               </Link>
                            </motion.div>
                            </div>
                        )
                    })}
                </Slider>
                </div>
                </>
            )}
        </div>


        <div className='dashboard-block'>
            <h1><i className="fa-solid fa-signal"></i> Latest Quizes</h1>
            <hr />

            {latestLoading && <SkeletonLoader type='slider' />}

            {!latestLoading && latestQuizes && latestQuizes.length > 0 && (
                <>
                <div className="slider-container">
                <Slider {...settings}>
                    {latestQuizes.map((lq, index) => {
                        const formatDuration = Number(lq.duration / 60)
                        return (
                            <div key={`lq-${index}`} className='slider-quiz-link'>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ duration: 0.6, delay: 0.2 }} 
                            >
                               <Link to={`/quiz/${lq.id}`}>
                               <div className='slider-quiz-block position-relative shadow-sm'>
                                    <div className='slider-quiz-block-image'>
                                        <Badge bg="dark">{lq.private === true ? <i className="fa-solid fa-lock"></i> : <i className="fa-solid fa-globe"></i>}</Badge>
                                        <img src={`${import.meta.env.VITE_BACKEND_URL}/${lq.image}`} className='img-fluid' loading='lazy' alt={`${lq.name} Photo`} />
                                    </div>
                                    <div className='slider-quiz-block-info'>
                                        <h4>{lq.title}</h4>
                                        <div className='slider-quiz-block-info-desc'>
                                        {lq.description.length > 500 ? lq.description.substring(0, 500) + "..." : lq.description}
                                        </div>
                                    </div>
                                    <div className='slider-quiz-block-addons'>
                                        <Row>
                                            <Col xl={4} xs={4}>
                                                <div className='slider-quiz-block-addons-block'>
                                                    <h3><i className="fa-solid fa-clock"></i></h3>
                                                    <p>{formatDuration} <small>m</small></p>
                                                    <small>Duration</small>
                                                </div>
                                            </Col>
                                            <Col xl={4} xs={4}>
                                                <div className='slider-quiz-block-addons-block'>
                                                    <h3><i className="fa-solid fa-list"></i></h3>
                                                    <p>{lq.questions.length}</p>
                                                    <small>Total questions</small>
                                                </div>
                                            </Col>
                                            <Col xl={4} xs={4}>
                                                <div className='slider-quiz-block-addons-block'>
                                                    <h3><i className="fa-solid fa-star"></i></h3>
                                                    <p>{lq.bonusesList.length}</p>
                                                    <small>Total bonuses</small>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                               </div>
                               </Link>
                            </motion.div>
                            </div>
                        )
                    })}
                </Slider>
                </div>
                </>
            )}
        </div>
        </Container>
        </>
    )
}

export default Dashboard;