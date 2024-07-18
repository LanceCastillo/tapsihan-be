import express from 'express';

import { buySingleProduct, makePayment } from '../controllers/payment';

export default (router:express.Router) =>{
    router.post('/payment', makePayment)
    router.post('/buy-now', buySingleProduct);

};


