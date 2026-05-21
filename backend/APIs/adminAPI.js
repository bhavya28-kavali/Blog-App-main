import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js'
import { UserTypeModel } from '../models/userModel.js';
import { ArticleModel } from '../models/articleModel.js';
import {checkAdmin} from '../middleware/checkAdmin.js'
export const adminRoute = express.Router();

//Read all articles
adminRoute.get('/articles', verifyToken, async(req, res)=>{
    //find all articles from database
    let articles = await ArticleModel.find();

    //send response
    res.status(200).json({ message: "All articles", payload: articles });
})


//Block User
adminRoute.put('/block-user', verifyToken, checkAdmin, async(req, res)=>{
    //get details of the user form req
    let{ userId } = req.body;

    //update the user 
    let updatedUser = await UserTypeModel.findByIdAndUpdate(userId, { $set: { isActive: false } }, { new: true });
    const out = updatedUser ? updatedUser.toObject() : null
    if (out) delete out.password

    //send response
    res.status(200).json({ message: "User blocked successfully", payload: out });
})


//Unblock user
adminRoute.put('/unblock-user', verifyToken, checkAdmin, async(req, res)=>{
    //get details of the user form req
    let{ userId } = req.body;

    //update the user 
    let updatedUser = await UserTypeModel.findByIdAndUpdate(userId, { $set: { isActive: true } }, { new: true });
    const out = updatedUser ? updatedUser.toObject() : null
    if (out) delete out.password

    //send response
    res.status(200).json({ message: "User unblocked successfully", payload: out });
})