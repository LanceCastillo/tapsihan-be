import { Request, Response } from 'express';
import Stripe from 'stripe';
import { ProductsModel } from '../db/products';
import { CartsModel } from '../db/carts';

export const makePayment = async (req: Request, res: Response) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-06-20',
    });

    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'php',
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        return res.status(200).json({paymentIntent: paymentIntent.client_secret, paymentRef: paymentIntent.id});
    } catch (error) {
        return res.status(400).json({error: error});
    }
}

export const buySingleProduct = async (req: Request, res: Response) => {
    const { userId, productId, quantity, paymentRef } = req.body;
    
    if (!userId || !productId || !quantity || !paymentRef) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const product = await ProductsModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the product has enough stocks
        if (product.stocks < quantity) {
            return res.status(400).json({ message: 'Insufficient product stocks' });
        }

        // Deduct the product stocks
        product.stocks -= quantity;
        await product.save();

        // Create or update the user's cart with the new purchase
        let cart = await CartsModel.findOne({ user: userId });

        if (!cart) {
            cart = new CartsModel({
                user: userId,
                items: []
            });
        }

        // Add new item to the cart with status 'toship'
        cart.items.push({
            product: productId,
            quantity,
            status: 'toship',
            paymentRef
        });

        await cart.save();

        // Populate the product details in the cart items
        await cart.populate('items.product');

        return res.status(200).json({ message: 'Product purchased successfully', cart });
    } catch (error) {
        console.error('Failed to purchase product:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
