import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    authentication: {
        password: {type: String, required:true, select:false},
        salt: {type: String, select:false},
        sessionToken: {type: String, select:false },
    },
},
{
    timestamps:true,
    });

export const AdminModel = mongoose.model('Admin', AdminSchema, 'admin' );

export const getAdmins = () => AdminModel.find();
export const getAdminByEmail = (email: string) => AdminModel.findOne({email});
export const getAdminBySessionToken = (sessionToken: string) => AdminModel.findOne({'authentication.sessionToken': sessionToken});
export const getAdminById = (id: string) => AdminModel.findById(id);
export const createAdmin = (values: Record<string, any>) => new AdminModel(values).save().then((admin)=> admin.toObject()); 
export const deleteAdminById = (id: string) => AdminModel.findOneAndDelete({_id: id});
export const updateAdminById = (id: string, values: Record<string, any>) => AdminModel.findByIdAndUpdate(id, values);

