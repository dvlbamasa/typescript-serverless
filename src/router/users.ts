import express from 'express';

import {register, getAllUsers, getUser, getUserHistory, getUserData, getUserCorporateStatus} from '../controllers/users';

export default (router: express.Router) => {
    router.post('/api/v1/user', register);
    router.get('/api/v1/:type/users', getAllUsers);
    router.get('/api/v1/:type/user/:id/latest', getUser);
    router.get('/api/v1/:type/user/:id/data', getUserData);
    router.get('/api/v1/:type/user/:id/status', getUserCorporateStatus);
    router.get('/api/v1/:type/user/:id/history', getUserHistory)
};
