import express from 'express';
import {UsersModel, createUser, getUserByEmail} from '../db/users';
import {random, authentication} from '../helpers';
import { CartsModel } from '../db/carts';


export const userLogin = async (req: express.Request, res: express.Response) =>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.sendStatus(400);
        }

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password')
            .populate({
                path: 'cart',
                populate: {
                    path: 'items.product',
                    model: 'Products'
                }
            });
        
        if(!user) {
            return res.sendStatus(400);
        }

        
        if (user.authentication && user.authentication.salt) {

            const expectedHash = authentication(user.authentication.salt, password);
        
            if(user.authentication.password != expectedHash){
                return res.sendStatus(403);
            }

            const salt = random();
            user.authentication.sessionToken = authentication(salt, user._id.toString());

            await user.save();
            return res.status(200).json(user).end();

        }


    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const userRegister = async (req:express.Request, res:express.Response) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.sendStatus(400).send('Email, password, and username are required.');
        }

        const existingUserByEmail = await getUserByEmail(email);

        if (existingUserByEmail) {
            return res.status(400).send('Email or username already in use.');
        }

        const salt = random();
        const hashedPassword = authentication(salt, password);

        const user = await createUser({
            email,
            username,
            authentication: {
                salt,
                password: hashedPassword,
            },
            cart: null,
            address: null
        });

        const userCart = new CartsModel({
            user: user._id,
            items: [],
        });

        await userCart.save();

        const updatedUser = await UsersModel.findByIdAndUpdate(
            user._id,
            { $set: { cart: userCart._id,}},
            { new: true }
        );

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error.');
    }
}