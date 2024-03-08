import express from 'express';

import {register, getAllUsers, getUser, getUserHistory, getUserData} from '../controllers/users';

export default (router: express.Router) => {
    router.post('/api/v1/seafarers', register);
    router.get('/api/v1/seafarers', getAllUsers);
    router.get('/api/v1/seafarers/:id/latest', getUser);
    router.get('/api/v1/seafarers/:id', getUserData);
    router.get('/api/v1/seafarers/:id/history', getUserHistory);
};
