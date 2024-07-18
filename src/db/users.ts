import mongoose from "mongoose";
const UsersSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    authentication: {
        password: { type: String, required: true, select: false },
        salt: { type: String, select: false },
        sessionToken: { type: String, select: false },
    },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Carts' },
    address: { type: String },
    contact: { type: String }
}, {
    timestamps: true,
});

UsersSchema.pre('findOneAndDelete', async function (next) {
    const userId = this.getQuery()["_id"];
    await mongoose.model('Carts').deleteOne({ user: userId });
    next();
});

export const UsersModel = mongoose.model('Users', UsersSchema, 'user');

export const getUsers = () => UsersModel.find();
export const getUserByEmail = (email: string) => UsersModel.findOne({ email });
export const getUserBySessionToken = (sessionToken: string) => UsersModel.findOne({ 'authentication.sessionToken': sessionToken });
export const getUserById = (id: string) => UsersModel.findById(id);
export const createUser = (values: Record<string, any>) => new UsersModel(values).save().then((user) => user.toObject());
export const deleteUserById = (id: string) => UsersModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => UsersModel.findByIdAndUpdate(id, values);


