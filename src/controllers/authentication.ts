import express from 'express';
import { saveUser  } from '../db/users';

export const register = async(req: express.Request, res: express.Response) => {
    try {
        const { email, password, username} = req.body;

        if (!email || !password || !username) {
            return res.sendStatus(400);
        }

        const user = saveUser(username, email, password);

        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}