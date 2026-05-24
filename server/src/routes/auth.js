import { Router } from 'express'
import {
  register, login, me,
  googleLogin, forgotPassword, resetPassword,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/register',        register)
router.post('/login',           login)
router.post('/google',          googleLogin)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password',  resetPassword)
router.get('/me', protect, me)

export default router
