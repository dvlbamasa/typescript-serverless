import express from 'express';

import {register, getAllUsers, getUser, getUserHistory} from '../controllers/users';

export default (router: express.Router) => {
    router.post('/api/v1/user', register);
    router.get('/api/v1/users', getAllUsers);
    router.get('/api/v1/user/:id', getUser);
    router.get('/api/v1/user/:id/history', getUserHistory)
};
