import express from 'express';

import {deleteUser, getAllUsers, getOrders, getUser, updateToCompleted, updateToDelivery, updateUser} from '../controllers/users';

export default (router:express.Router) =>{
    router.get('/users', getAllUsers);
    router.get('/user/:id', getUser);
    router.delete('/users/:id', deleteUser);
    router.patch('/users/:id', updateUser);

    router.get('/users/order', getOrders);
    router.patch('/order/delivery', updateToDelivery);
    router.patch('/order/completed', updateToCompleted);
};


