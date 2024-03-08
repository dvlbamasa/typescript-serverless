import express from 'express';

import { saveUser, getUserById, getUsers, getUsersHistory, getUserDataById, filterSeafarer } from '../db/seafarer';

export const register = async(req: express.Request, res: express.Response) => {
    try {
        const { email, username} = req.body;

        if  (!email || !username) {
            return res.sendStatus(400);
        }

        const user = await saveUser(req.body);

        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const {corporateAccount, status } = req.query;
        let users;
        if (corporateAccount || status) {
            users = await filterSeafarer(req.query);
        } else {
            users = await getUsers(req.query);
        }
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const getUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        const user = await getUserById(id);

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const getUserData = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        const user = await getUserDataById(id);

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const getUserHistory = async (req: express.Request, res: express.Response) => {
    try {
        const user = await getUsersHistory(req.params, req.query);

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};