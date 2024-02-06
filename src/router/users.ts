import express from 'express';

import {getAllUsers, getUser, getUserHistory} from '../controllers/users';

export default (router: express.Router) => {
    router.get('/users', getAllUsers);
    router.get('/user/:id', getUser);
    router.get('/user/:id/history', getUserHistory)
};
