import { UserTypeModel } from "../models/userModel.js";

export const checkAdmin = async (req, res, next) => {
  // prefer token-derived user id
  const adminId = req.user?.userId

  if (!adminId) return res.status(401).json({ message: 'Unauthorized' })

  const admin = await UserTypeModel.findById(adminId)
  if (!admin) return res.status(404).json({ message: 'User not found' })

  if (admin.role !== 'ADMIN') return res.status(403).json({ message: 'Unauthorized access' })

  next()
}