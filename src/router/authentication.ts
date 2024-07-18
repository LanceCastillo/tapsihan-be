import express from 'express';

import {login, register} from '../controllers/authentication';
import {userLogin, userRegister} from '../controllers/userauthentication';

export default (router: express.Router) => {
    router.post('/auth/register', register);
    router.post('/auth/login', login);
    router.post('/user/register', userRegister);
    router.post('/user/login', userLogin);
}

