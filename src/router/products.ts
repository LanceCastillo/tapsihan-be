import express from 'express';
import { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct} from '../controllers/products';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export default (router:express.Router) =>{
    router.get('/products', getAllProducts);
    router.get('/products/:id', getProduct);
    router.post('/products', upload.single('image'), createProduct);
    router.patch('/products/:id', upload.single('image'), updateProduct);
    router.delete('/products/:id', deleteProduct);
};


