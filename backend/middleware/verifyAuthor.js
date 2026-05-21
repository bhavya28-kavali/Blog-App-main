import { UserTypeModel } from "../models/userModel.js";

export const verifyAuthor = async (req, res, next) => {
  // prefer token-derived user id, fallback to params/body
  const authorId = req.user?.userId || req.body?.author || req.params?.authorId

  if (!authorId) return res.status(401).json({ message: 'Unauthorized' })

  const author = await UserTypeModel.findById(authorId)
  if (!author) return res.status(404).json({ message: 'Invalid Author' })

  if (author.role !== 'AUTHOR') return res.status(403).json({ message: 'User is not an Author' })

  if (!author.isActive) return res.status(403).json({ message: 'Author account is not active' })

  next()
}