import express from 'express';

import { saveUser, getUserById, getUsers, getUsersHistory, getUserDataById, getUserCorporateAndStatusById } from '../db/users';

export const register = async(req: express.Request, res: express.Response) => {
    try {
        const { id, email, user_type, username} = req.body;

        if (!id || !email || !user_type || !username) {
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
        const { type } = req.params;

        const users = await getUsers(type, req.body);

        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const getUser = async (req: express.Request, res: express.Response) => {
    try {
        const { type, id } = req.params;

        const user = await getUserById(id, type);

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

export const getUserCorporateStatus = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        const user = await getUserCorporateAndStatusById(id);

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