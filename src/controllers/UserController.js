// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import { userService } from '~/services/UserService'
import { webModel } from '~/models/WebModel'
import bcrypt from 'bcrypt'
import ApiError from '~/utils/ApiError'

const login = async (req, res) => {
	try {
		const web = await webModel.getDetail(req.params.slug)
		const user = await userService.checkValidEmail(web._id.toString(), req.body.email)
		const isPasswordValid = await bcrypt.compare(req.body.password, user.password)
		if (!user || !isPasswordValid) {
			res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
			return
		}
		const userInfo = {
			id: user._id.toString(),
			email: user.email,
			isAdmin: user.isAdmin
		}

		const accessToken = await JwtProvider.generateToken(
			userInfo,
			env.ACCESS_TOKEN_SECRET_SIGNATURE,
			// 5
			'1h'
		)
		const refreshToken = await JwtProvider.generateToken(
			userInfo,
			env.REFRESH_TOKEN_SECRET_SIGNATURE,
			// 20
			'14 days'
		)
		// --------Cookie------
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			maxAge: ms('14 days')
		})

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			maxAge: ms('14 days')
		})

		res.status(StatusCodes.OK).json({ ...userInfo, accessToken, refreshToken })

	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
	}
}

const logout = async (req, res) => {
	try {
		// ----cookie----
		res.clearCookie('accessToken')
		res.clearCookie('refreshToken')
		// ----------

		res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
	}
}
const accessToken = async (req, res) => {
	try {
		const userInfo = {
			id: req.jwtDecoded.id,
			email: req.jwtDecoded.email
		}

		res.status(StatusCodes.OK).json(userInfo)
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
	}
}
const refreshToken = async (req, res) => {
	try {
		const cookieRefreshToken = req.cookies?.refreshToken

		const refreshTokenDecoded = await JwtProvider.verifyToken(
			// -----Cookie---------
			cookieRefreshToken,

			env.REFRESH_TOKEN_SECRET_SIGNATURE
		)

		const userInfo = {
			id: refreshTokenDecoded.id,
			email: refreshTokenDecoded.email
		}

		const accessToken = await JwtProvider.generateToken(
			userInfo,
			env.ACCESS_TOKEN_SECRET_SIGNATURE,
			// 5
			'1h'
		)
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			maxAge: ms('14 days')
		})

		res.status(StatusCodes.OK).json({ accessToken })
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ' Refresh Token fail.' })
	}
}

const createNew = async (req, res) => {
	const { email } = req.body
	try {
		const web = await webModel.getDetail(req.params.slug)
		if (!web) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')
		const user = await userService.checkValidEmail(web._id.toString(), email)
		if (user) {
			res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email người dùng đã tồn tại! ' })
			return
		}
		const data = {
			...req.body,
			webId: web._id.toString()
		}
		const resuil = await userService.createNew(data)
		res.status(StatusCodes.OK).json(resuil)
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
	}
	// res.status(StatusCodes.OK).json(resuil)
}
const getAllUser = async (req, res) => {
	try {
		const { email, name, searchtext, isAdmin } = req.query
		const filterObj = { email, name, searchtext, isAdmin: JSON.parse(isAdmin) }
		const page = req.query.page * 1
		const limit = req.query.limit * 1
		const web = await webModel.getDetail(req.params.slug)

		if (!web) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')

		const resuil = await userService.getAllUser(web._id.toString(), page, limit, filterObj)
		res.status(StatusCodes.OK).json(resuil)
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
	}
}
const getUserById = async (req, res) => {
	const { slug, id } = req.params

	try {
		const web = await webModel.getDetail(slug)
		if (!web) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
		const resuil = await userService.getUserById(web._id.toString(), id)
		res.status(StatusCodes.OK).json(resuil)
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)

	}
}
const updateDetail = async (req, res, next) => {
	try {
		const data = {
			...req.body,
		}
		const userDetailUpdated = await userService.updateDetail(data)
		if (!userDetailUpdated) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')

		res.status(StatusCodes.CREATED).json(userDetailUpdated)
	}
	catch (err) {
		next(err)
	}
}
const updateDetailPassword = async (req, res, next) => {
	try {
		const web = await webModel.getDetail(req.params.slug)
		const user = await userService.checkValidEmail(web._id.toString(), req.body.email)
		if (req.body.oldPassword !== 'changeRole') {
			const isPasswordValid = await bcrypt.compare(req.body.oldPassword, user.password)
			if (!user || !isPasswordValid) {
				res.status(StatusCodes.FORBIDDEN).json({ message: 'Mật khẩu không hợp lệ' })
				return
			}
		}
		const data = {
			...req.body,
		}
		delete data.oldPassword
		const userDetailUpdated = await userService.updateDetailPasswork(data, user.password)
		if (!userDetailUpdated) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')

		res.status(StatusCodes.CREATED).json(userDetailUpdated)
	}
	catch (err) {
		next(err)
	}
}
const deleteUser = async (req, res) => {
	try {
		const { id } = req.query
		const web = await webModel.getDetail(req.params.slug)
		if (!web) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')
		const result = await userService.deleteUser(web._id.toString(), id)

		res.status(StatusCodes.CREATED).json(result)
	}
	catch (err) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
	}
}

export const userController = {
	login,
	logout,
	refreshToken,
	accessToken,
	createNew,
	getAllUser,
	updateDetail,
	deleteUser,
	getUserById,
	updateDetailPassword
}
