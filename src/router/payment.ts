import express from 'express';

import { buySingleProduct} from '../controllers/payment';

export default (router:express.Router) =>{
    router.post('/buy-now', buySingleProduct);

};


