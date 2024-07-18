import mongoose from "mongoose";

const ProductsSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stocks: { type: Number, required: true },
    image: { type: String },
    imagePublicId: { type: String },
});

ProductsSchema.pre('findOneAndDelete', async function (next) {
    const productId = this.getFilter()["_id"];
    await mongoose.model('Carts').updateMany(
        { $pull: { items: { product: productId } } }
    );
    next();
});

export const ProductsModel = mongoose.model('Products', ProductsSchema);