import express from 'express';
import { saveUser  } from '../db/users';


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