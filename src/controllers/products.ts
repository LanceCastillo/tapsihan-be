import express from 'express';
import { ProductsModel } from '../db/products';
import { cloudinary } from '../utils/cloudinary';
import fs from 'fs';

export const getAllProducts = async (req: express.Request, res: express.Response) => {
    try {
        const products = await ProductsModel.find();
        return res.status(200).json(products)
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);


    };
};

export const getProduct = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const product = await ProductsModel.findById(id);
        if (product) {
            return res.status(200).json(product);
        } else {
            return res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching the product' });
    }
};


export const createProduct = async (req: express.Request, res: express.Response) => {
    try {
        const productName = req.body.productName;
        const description = req.body.description;
        const price = req.body.price;
        const stocks = req.body.stocks;
        
        if (!productName || !description || !price || !stocks) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!req.file) {
            return res.status(400).send({ error: "File is required" });
        }

        const filePath = req.file.path;
        const result = await cloudinary.uploader.upload(filePath, { folder: "tapsihan" });
        fs.unlinkSync(filePath);

        const product = new ProductsModel({
            productName,
            description,
            price,
            stocks,
            image: result.secure_url,
            imagePublicId: result.public_id
        });
        await product.save();
        return res.status(201).json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while creating the product'
        });
    }
};


export const updateProduct = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const productName = req.body.productName;
        const description = req.body.description;
        const price = req.body.price;
        const stocks = req.body.stocks;
        
        // Validate required fields
        if (!productName || !description || !price || !stocks) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Find the product by ID
        const product = await ProductsModel.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update product details
        product.productName = productName;
        product.description = description;
        product.price = price;
        product.stocks = stocks;

        // Handle image upload
        if (req.file) {
            // Check if there's an existing image to delete
            if (product.imagePublicId) {
                await cloudinary.uploader.destroy(product.imagePublicId);
            }

            // Upload new image to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {folder: "tapsihan"});
            fs.unlinkSync(req.file.path);
            
            product.image = uploadResult.secure_url;
            product.imagePublicId = uploadResult.public_id;
        }

        // Save updated product details
        await product.save();
        return res.status(200).json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while updating the product'
        });
    }
};

export const deleteProduct = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const product = await ProductsModel.findByIdAndDelete({ _id: id });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete image from Cloudinary
        if (product.image && product.imagePublicId) {
            await cloudinary.uploader.destroy(product.imagePublicId);
        }

        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};






