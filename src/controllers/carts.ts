import { Request, Response } from 'express';
import { CartsModel } from '../db/carts';
import { ProductsModel } from '../db/products';
import { Document, ObjectId } from 'mongoose';

interface Product {
    _id: ObjectId;
    stocks: number;
}
interface CartItem {
    _id: ObjectId;
    product: Product;
    status: string;
    paymentRef: string;
    quantity: number;
}
interface Cart extends Document {
    user: string;
    items: CartItem[];
}

interface ItemUpdate {
    itemId: string;
}

export const addItemToCart = async (req: Request, res: Response) => {
    const { userId, productId, quantity } = req.body;

    try {
        const product = await ProductsModel.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        let cart = await CartsModel.findOne({ user: userId });

        if (!cart) {
            cart = new CartsModel({
                user: userId,
                items: []
            });

            await cart.save();
        }

        // Check if the product already exists in the cart
        const existingItem = cart.items.find(item => item.product.toString() === productId && item.status === 'cart');

        if (existingItem) {
            // Increment quantity if the product already exists in the cart
            existingItem.quantity += quantity;
        } else {
            // Add new item to cart if product does not exist
            cart.items.push({ product: productId, quantity, status: 'cart' });
        }

        await cart.save();

        // Populate the product details in the cart items
        await cart.populate('items.product');

        res.status(200).json(cart);
    } catch (error) {
        return res.status(400).json({ error: error });
    }
};

export const updateProductStatusInCart = async (req: Request, res: Response) => {
    const { userId, items, paymentRef } = req.body;
    
    if (!userId || !items || !Array.isArray(items)) {
        return res.status(400).json({ message: 'Missing required fields or items is not an array' });
    }

    try {
        const cart = await CartsModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Loop through each item update and update its status and paymentRef
        for (const itemUpdate of items) {
            const item = cart.items.find((cartItem: any) => cartItem._id.toString() === itemUpdate.itemId && cartItem.status === 'cart');
            if (item) {
                // Update status and paymentRef
                item.status = "toship";
                item.paymentRef = paymentRef;
                
                // Update product stocks
                const product = await ProductsModel.findById(item.product);
                if (product) {
                    product.stocks -= item.quantity; // Subtract item quantity from product stocks
                    await product.save();
                }
            }
        }

        await cart.save();

        return res.status(200).json(cart);
    } catch (error) {
        console.error('Failed to update product status in cart:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getActiveCart = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const cart = await CartsModel.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            throw new Error('No active cart found');
        }

        res.status(200).json(cart);
    } catch (error) {
        return res.status(400).json({ error: error });
    }
};

export const removeItemFromCart = async (req: Request, res: Response) => {
    const { userId, productId } = req.body;
    try {
        const cart = await CartsModel.findOne({ user: userId });

        if (!cart) {
            throw new Error('No active cart found');
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
        } else {
            throw new Error('Product not found in cart');
        }
        
        res.status(200).json(cart);
    } catch (error) {
        return res.status(400).json({ error: error });
    }
};

export const updateProductQuantityInCart = async (req: Request, res: Response) => {
    const { userId, itemId, quantity } = req.body;

    if (!userId || !itemId || quantity === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const cart = await CartsModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Update the quantity of the item in the cart
        const itemIndex = cart.items.findIndex(item => item._id?.toString() === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update the quantity
        cart.items[itemIndex].quantity = quantity;

        // If quantity is 0, remove the item from the cart
        if (quantity === 0) {
            await cart.updateOne({ $pull: { items: { _id: itemId } } });
        } else {
            await cart.save();
        }

        // Fetch the updated cart with populated items
        const updatedCart = await CartsModel.findOne({ user: userId }).populate('items.product');

        return res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Error updating product quantity in cart:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
