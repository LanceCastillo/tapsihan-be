import express from 'express';

import authentication from './authentication';
import admins from './admins';
import products from './products';
import users from './users';
import carts from './carts'
import payment from './payment';

const router = express.Router();

export default (): express.Router => {

    authentication(router);
    admins(router);
    products(router);
    users(router);
    carts(router);
    payment(router);
    
    return router;
}