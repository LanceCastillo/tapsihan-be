import express from 'express';
import {
    addItemToCart,
    updateProductStatusInCart,
    getActiveCart,
    removeItemFromCart,
    updateProductQuantityInCart
} from '../controllers/carts';

export default (router: express.Router) => {
    router.post('/cart/add', addItemToCart);
    router.patch('/cart/status', updateProductStatusInCart);
    router.patch('/cart/item/quantity', updateProductQuantityInCart);
    router.get('/cart/:userId', getActiveCart);
    router.delete('/cart/removeItem', removeItemFromCart);
};
