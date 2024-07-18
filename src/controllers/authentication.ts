import express from 'express';
import {createAdmin, getAdminByEmail} from '../db/admins';
import {random, authentication} from '../helpers';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const login = async (req: express.Request, res: express.Response) =>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.sendStatus(400);
        }

        const admin = await getAdminByEmail(email).select('+authentication.salt +authentication.password');
        
        if(!admin) {
            return res.sendStatus(400);
        }

        
        if (admin.authentication && admin.authentication.salt) {

            const expectedHash = authentication(admin.authentication.salt, password);
        
            if(admin.authentication.password != expectedHash){
                return res.sendStatus(403);
            }

            admin.authentication.sessionToken = jwt.sign({ userId: admin._id }, `secret_key`, { expiresIn: '3h' });

            await admin.save();
            return res.status(200).json(admin).end();

        }


    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const register = async (req:express.Request, res:express.Response) => {
    try{
        const {email, password, username} = req.body;

        if(!email || !password || !username){
            return res.sendStatus(400);
        }

        const existingAdmin = await getAdminByEmail(email);

        if(existingAdmin){
            return res.sendStatus(400);
        }

        const salt = random();
        const admin = await createAdmin({
            email,
            username,
            authentication: {
                salt,
                password: authentication(salt, password)
            },
        })

        admin.authentication!.sessionToken = jwt.sign({ userId: admin._id }, `secret_key`, { expiresIn: '3h' });

        return res.status(200).json(admin).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}