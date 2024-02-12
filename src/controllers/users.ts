import express from 'express';

import { saveUser, getUserById, getUsers, getUsersHistory } from '../db/users';

export const register = async(req: express.Request, res: express.Response) => {
    try {
        const { id, email, user_type, username} = req.body;

        if (!id || !email || !user_type || !username) {
            return res.sendStatus(400);
        }

        const user = await saveUser(id, username, user_type, email);

        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const { type } = req.params;

        const users = await getUsers(type);

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

export const getUserHistory = async (req: express.Request, res: express.Response) => {
    try {
        const { type, id } = req.params;

        const user = await getUsersHistory(id, type);

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};