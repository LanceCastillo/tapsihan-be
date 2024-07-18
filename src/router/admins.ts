import express from 'express';

import {deleteAdmin, getAllAdmins, updateAdmin} from '../controllers/admins';

export default (router:express.Router) =>{
    router.get('/admins', getAllAdmins);
    router.delete('/admins/:id', deleteAdmin);
    router.patch('/admins/:id', updateAdmin);
};


