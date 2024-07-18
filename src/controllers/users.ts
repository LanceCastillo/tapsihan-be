import express from "express";
import { deleteUserById, getUserById, getUsers } from "../db/users";
import { CartsModel } from "../db/carts";

interface Cart {
  user: User;
  items: CartItem[];
}

interface User {
  username: string;
  email: string;
  address: string;
  contact: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  status: string;
  paymentRef: string;
}

interface Product {
  productName: string;
  description: string;
  price: number;
  stocks: number;
  image: string;
}

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers();

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};


export const getUser = async(req: express.Request, res:express.Response) => {
    try{
        const { id } = req.params;

        const user = await getUserById(id);

        return res.status(200).json(user);

    } catch(error){
        console.log(error);
        return res.sendStatus(400);


    }
};

export const deleteUser = async (req: express.Request, res: express.Response) => {

    try{
        const {id} = req.params;


    const deletedUser = await deleteUserById(id);

    if (deletedUser === null) {
      return res.status(404).json("User not found");
    }

    return res.json(deletedUser);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const updateUser = async (req: express.Request, res:express.Response) => {
    try{
        const {id} = req.params;
        const {address, contact} = req.body;
        console.log(id, address, contact);
        if(!address || !contact) {
            return res.sendStatus(400); 
        }
        
        const user = await getUserById(id);
        if(user){
        user.address = address;
        user.contact = contact;
        await user.save();
        return res.status(200).json(user).end();
        }
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const getOrders = async (
  req: express.Request,
  res: express.Response
) => {
  const carts = await CartsModel.find()
    .populate("items.product")
    .populate("user");

  if (!carts) {
    return res.sendStatus(404);
  }

  return res.status(200).json(carts);
};

export const updateToDelivery = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, items } = req.body;
  try {
    const cart = await CartsModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    for (const itemUpdate of items) {
      const item = cart.items.find(
        (cartItem: any) =>
          cartItem._id.toString() === itemUpdate &&
          cartItem.status === "toship"
      );
      if (item) {
        // Update status to delivery
        item.status = "delivery";
      }
    }

    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    return res.sendStatus(200);
  }
};

export const updateToCompleted = async (
  req: express.Request,
  res: express.Response
) => {const { userId, items } = req.body;
try {
  const cart = await CartsModel.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  
  for (const itemUpdate of items) {
    const item = cart.items.find(
      (cartItem: any) =>
        cartItem._id.toString() === itemUpdate &&
        cartItem.status === "delivery"
    );
    if (item) {
      // Update status to completed
      item.status = "completed";
    }
  }
  await cart.save();
  return res.status(200).json(cart);
} catch (error) {
  return res.sendStatus(200);
}
};