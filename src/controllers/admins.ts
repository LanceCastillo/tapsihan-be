import express from 'express';
import {deleteAdminById, getAdminById, getAdmins} from "../db/admins";

export const getAllAdmins = async(req: express.Request, res:express.Response) => {
    try{    
        const admins = await getAdmins();

        return res.status(200).json(admins);

    } catch(error){
        console.log(error);
        return res.sendStatus(400);


    }
};

export const deleteAdmin = async (req: express.Request, res: express.Response) => {

    try{
        const {id} = req.params;

        const deletedAdmin = await deleteAdminById(id);

        return res.json(deletedAdmin);



    }
    catch(error){
        console.log(error);
        return res.sendStatus(400);

    }
}

export const updateAdmin = async (req: express.Request, res:express.Response) => {
    try{
        const {id} = req.params;
        const {username} = req.body;

        if(!username) {
            return res.status(400).send('Username is required'); 
        }
        
        const admin = await getAdminById(id);
        if(admin){
        admin.username = username;
        await admin.save();
        return res.status(200).json(admin).end();
        }
    }
    catch(error){
        console.log(error);
        return res.sendStatus(400);
    }

}