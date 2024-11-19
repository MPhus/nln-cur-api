/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { productModel } from '~/models/ProductModel'
import { maxForQuantityAndType } from '~/utils/sorts'
import { userModel } from '~/models/UserModel'
import bcrypt from 'bcrypt'


const checkValidEmail = async (webId, email) => {
	try {

		const user = await userModel.checkValidEmail(webId, email)

		return user

	} catch (error) {
		throw error
	}
}

const getAllUser = async (webId, page, limit, filterObj) => {
	try {
		const startIndex = (page - 1) * limit

		const data = await userModel.getAllUser(webId, startIndex, limit, filterObj)

		if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Products not found!')
		const product = { maxProductOfPage: limit, page, ...data }


		return product

	} catch (error) {
		throw error
	}
}

const createNew = async (data) => {
	try {
		const user = await userModel.createNew(data)

		return user
	} catch (error) {
		throw error
	}
}
const getUserById = async (webId, id) => {
	try {
		const user = await userModel.getUserById(webId, id)

		return user
	} catch (error) {
		throw error
	}
}
const deleteUser = async (webId, id) => {
	try {
		const user = await userModel.getUserById(webId, id)
		await userModel.deleteUser(id)

		return { Deletemessage: 'Delete successfuly' }

	} catch (error) {
		throw error
	}
}
const updateDetail = async (data) => {
	try {
		const hashedPassword = await bcrypt.hash(data.password, 10)
		let userDetail = {
			...data,
			isAdmin: JSON.parse(data.isAdmin),
			password: hashedPassword
		}
		if (!data.password) {
			const user = await userModel.getUserById(data.webId, data._id)
			userDetail = {
				...data,
				isAdmin: JSON.parse(data.isAdmin),
				password: user.password
			}
		}
		const resuil = await userModel.updateDetail(userDetail)

		return resuil

	} catch (error) {
		throw error
	}
}
const updateDetailPasswork = async (data, passOnDB) => {
	try {
		let hashedPassword
		if (passOnDB === data.password) {
			hashedPassword = passOnDB
		} else {
			hashedPassword = await bcrypt.hash(data.password, 10)
		}
		let userDetail = {
			...data,
			isAdmin: JSON.parse(data.isAdmin),
			password: hashedPassword
		}
		if (!data.password) {
			const user = await userModel.getUserById(data.webId, data._id)
			userDetail = {
				...data,
				isAdmin: JSON.parse(data.isAdmin),
				password: user.password
			}
		}
		const resuil = await userModel.updateDetail(userDetail)

		return resuil

	} catch (error) {
		throw error
	}
}
export const userService = {
	checkValidEmail,
	getAllUser,
	createNew,
	getUserById,
	deleteUser,
	updateDetail,
	updateDetailPasswork
}
