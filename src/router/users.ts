import express from 'express';

import {register, getAllUsers, getUser, getUserHistory, getUserData, getUserCorporateStatus} from '../controllers/users';

export default (router: express.Router) => {
    router.post('/api/v1/seafarer', register);
    router.get('/api/v1/seafarer', getAllUsers);
    router.get('/api/v1/seafarer/:id/latest', getUser);
    router.get('/api/v1/seafarer/:id', getUserData);
    router.get('/api/v1/seafarer/:id/status', getUserCorporateStatus);
    router.get('/api/v1/seafarer/:id/history', getUserHistory)
};
