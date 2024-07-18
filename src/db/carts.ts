import mongoose, { Schema, Types } from 'mongoose';

const itemSchema = new Schema({
    product: { type: Types.ObjectId, ref: 'Products', required: true },
    quantity: { type: Number, required: true, default: 1 },
    status: { type: String, required: true },
    paymentRef: { type: String },
    mop: { type: String }
}, { timestamps: true });

const CartsSchema = new Schema({
    user: { type: Types.ObjectId, ref: 'Users', required: true },
    items: [itemSchema]
});

export const CartsModel = mongoose.model('Carts', CartsSchema, 'carts');
