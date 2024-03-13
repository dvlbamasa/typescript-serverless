import express from 'express';

import { saveSeafarer, getSeafarerById, getSeafarers, getSeafarerDataById, filterSeafarer } from '../db/seafarer';

export const register = async(req: express.Request, res: express.Response) => {
    try {
        const { email, username} = req.body;

        if  (!email || !username) {
            return res.sendStatus(400);
        }

        const user = await saveSeafarer(req.body);

        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const getAllSeafarers = async (req: express.Request, res: express.Response) => {
    try {
        const {corporateAccount, status } = req.query;
        let users;
        if (corporateAccount || status) {
            users = await filterSeafarer(req.query);
        } else {
            users = await getSeafarers(req.query);
        }
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const getSeafarer = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        const user = await getSeafarerById(id);

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const getSeafarerData = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        const user = await getSeafarerDataById(id);

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};