import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

import { useUserStore } from '../stores/userStore';

import { toast } from 'react-toastify';

import LoadingSpinner from '../components/helpers/LoadingSpinner';

import Paginate from '../components/helpers/Paginate'

import axios from 'axios'

import { Container, Table } from 'react-bootstrap';

import Navigation from '../components/helpers/Navigation';

const Quizes = () => {
    const { token } = useUserStore();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false)

    const [loadedQuizes, setLoadedQuizes] = useState();
    const [totalArticles, setTotalArticles] = useState(0);
    const history = useNavigate();
  
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchQuizes = async () => {
        try {
          setIsLoading(true)

          const responseData = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/app/getquizes?search=${encodeURI(searchTerm)}&page=1`,
                {
                    headers: {
                    Authorization: 'Bearer ' + token
                    }
                }
          );
              
  
          setLoadedQuizes(responseData.data.pageOfItems);
          setTotalArticles(responseData.data.pager.totalItems);
          setPage(responseData.data.pager.currentPage);
        
          setIsLoading(false)
        } catch (err) {
          setIsLoading(false)
          toast.error(err.response?.data?.message)
        }
    };
  
  
    useEffect(() => {
        fetchQuizes()
    }, [searchTerm]);

    
    const requestPage = async (page) => {
             history({
                pathname: "/quizes",
                search: `?search=${encodeURI(searchTerm)}&page=${page}`,
              });
  
              try {
                setIsLoading(true)

                const responseData = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/app/getquizes?search=${encodeURI(searchTerm)}&page=${page}`,
                {
                    headers: {
                    Authorization: 'Bearer ' + token
                    }
                }
                );
              
                setLoadedQuizes(responseData.data.pageOfItems);
                setTotalArticles(responseData.data.pager.totalItems);
                setPage(responseData.data.pager.currentPage);
                setIsLoading(false)
            } catch (err) {
                setIsLoading(false)
                toast.error(err.response?.data?.message)
            }
    };

    return (
        <>
        <Navigation />

        <Container>
        <div className="quizes-page">
            <h3>Quizes List</h3>

            {loadedQuizes && (
              <input
                  type="text"
                  placeholder={'Search quizes by name'}
                  id="searchQuery"
                  className="form-control"
                  autoComplete="off"
                  onChange={e => setSearchTerm(e.target.value)}
                  value={searchTerm || ""}
              />
              )}   

            <hr />

            {isLoading && (
            <center>
                <LoadingSpinner asOverlay={true} />
            </center>
            )}

            {!isLoading && loadedQuizes && loadedQuizes.length > 0 && (
                <>
                <Table variant='dark' striped hover responsive>
                <thead>
                <tr>
                    <th>Image</th>
                    <th>Quiz Details</th>
                    <th>Time & Points</th>
                    <th>Questions & Schedule</th>
                </tr>
                </thead>
                <tbody>
                {loadedQuizes.map((lq, index) => {
                    const totalPoints = lq.questions && lq.questions.reduce((sum, question) => sum + Number(question.maxPoints), 0);
                    const totalBonusPoints = lq.bonusesList && lq.bonusesList.reduce((sum, bonus) => sum + Number(bonus.points), 0);

                    return (
                        <tr 
                            key={`lq-table-${index}`}
                            onClick={() => navigate(`/quiz/${lq.id}`)} 
                            style={{ cursor: 'pointer' }}
                        >
                            <td>
                                <div className='quizes-table-image'>
                                    <img src={`${import.meta.env.VITE_BACKEND_URL}/${lq.image}`} className='img-fluid' loading='lazy' />
                                </div>
                            </td>
                            <td>
                                <div className='quizes-table-info'>
                                <p><label>Title</label> <b>{lq.title}</b></p>
                                <p><label>Created</label> <b>{new Date(lq.createdAt).toLocaleDateString()}</b></p>
                                <p><label>Status</label> <b>{lq.active === true ? <span style={{ color: 'green' }}> Active </span> : <span style={{ color: 'red'}}> Closed </span>}</b></p>
                                </div>
                            </td>
                            <td>
                                <div className='quizes-table-info'>
                                <p><label>Duration</label> <b>{(lq.duration / 60)} <small>m</small></b></p>
                                <p><label>Bonuses</label> <b>{lq.bonusesList ? lq.bonusesList.length : 0}</b></p>
                                <p><label>Bonus Points</label> <b>{totalBonusPoints}</b></p>
                                </div>
                            </td>
                            <td>
                                <div className='quizes-table-info'>
                                <p><label>Total Questions</label> <b>{lq.questions ? lq.questions.length : 0} </b></p>
                                <p><label>Total Points</label> <b>{totalPoints}</b></p>
                                <p><label>End date</label> <b>{lq.endDate ? new Date(lq.endDate).toLocaleDateString() : '-'}</b></p>
                                </div>
                            </td>
                        </tr>
                    );
                })}                
                </tbody>
                </Table>
                </>
            )}

            <div className="space20px"></div>

            {!isLoading && (
            <Paginate page={page} setPage={requestPage} totalArticles={totalArticles} maxButtons="2" maxPerPage="20" />
            )}

            <div className="space20px"></div>
        </div>
        </Container>
        </>
    )
}

export default Quizes;