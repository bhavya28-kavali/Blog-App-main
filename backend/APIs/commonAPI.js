import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../services/authService.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { UserTypeModel } from '../models/userModel.js';
import { ArticleModel } from '../models/articleModel.js';

export const commonRouter = express.Router()

// Get single article by ID (any logged-in user)
commonRouter.get('/articles/:articleId', verifyToken("USER","AUTHOR","ADMIN"), async (req, res) => {
    let articleId = req.params.articleId
    let article = await ArticleModel.findById(articleId)
        .populate("author", "firstName lastName email profileImageUrl")
        .populate("comments.user", "firstName profileImageUrl")
    
    if (!article || (!article.isArticleActive && req.user.role === 'USER')) {
        return res.status(404).json({ message: "Article not found" })
    }
    res.status(200).json({ message: "article", payload: article })
})


//login
commonRouter.post('/login',async(req,res)=>{
    //get user cred object
    let userCred=req.body
    //call authenticate service
    let {token,user} = await authenticate(userCred)
    //save httponlt cookie
    res.cookie("token",token,{
        httpOnly:true,
        sameSite:"lax",
        secure:false
    })
    //send res
    res.status(200).json({message:"login success",payload:user})
})



//logout
commonRouter.use('/logout',(req,res)=>{
    res.clearCookie('token',{
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    })
    res.status(200).json({message:"logout success"})
})


//change the password
commonRouter.put('/change-password', verifyToken, async (req, res) => {
    // use user id from verified token
    const userId = req.user?.userId
    const { oldPassword, newPassword } = req.body

    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const user = await UserTypeModel.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const match = await bcrypt.compare(oldPassword, user.password)
    if (!match) {
        return res.status(403).json({ message: 'Invalid password' })
    }

    if (oldPassword === newPassword) {
        return res.status(400).json({ message: 'New password must be different from the old password' })
    }

    user.password = await bcrypt.hash(newPassword, 12)
    await user.save()

    // send response without leaking internal values
    res.status(200).json({ message: 'Password changed successfully' })
})

// verify the session
commonRouter.get('/check-auth', verifyToken("USER","AUTHOR","ADMIN"), async (req, res) => {
    res.status(200).json({message:"authenticated",payload:req.user})
})