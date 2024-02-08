import express from 'express';

import { saveUser, getUserById, getUsers, getUsersHistory } from '../db/users';

export const register = async(req: express.Request, res: express.Response) => {
    try {
        const { id, email, username} = req.body;

        if (!id || !email || !username) {
            return res.sendStatus(400);
        }

        const user = await saveUser(id, username, email);

        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await getUsers();

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

export const getUserHistory = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        const user = await getUsersHistory(id);

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};