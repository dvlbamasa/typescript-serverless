import express from 'express';

import {register, getAllSeafarers, getSeafarer, getSeafarerData} from '../controllers/users';

export default (router: express.Router) => {
    router.post('/api/v1/seafarers', register);
    router.get('/api/v1/seafarers', getAllSeafarers);
    router.get('/api/v1/seafarers/:id/latest', getSeafarer);
    router.get('/api/v1/seafarers/:id', getSeafarerData);
};
