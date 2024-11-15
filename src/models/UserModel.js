import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { PRODUCT_TYPE } from '~/utils/constants'
import { orderModel } from '~/models/OrderModel'
import CustomDate from '~/utils/customDate'
import bcrypt from 'bcrypt'
const USER_COLLECTION_NAME = 'user'
const INVALID_UPDATE_FIELDS = ['_id', 'webId']
const checkValidEmail = async (webId, email) => {
	try {
		const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
			webId: new ObjectId(webId),
			email: email
		}) || null
		return user

	} catch (error) {
		throw new Error(error)
	}
}
const createNew = async (data) => {
	const hashedPassword = await bcrypt.hash(data.password, 10)
	const dataSave = {
		...data,
		webId: new ObjectId(data.webId),
		password: hashedPassword
	}
	try {
		const resuil = await GET_DB().collection(USER_COLLECTION_NAME).insertOne({ ...dataSave })
		const newId = resuil.insertedId
		const newUser = await GET_DB().collection(USER_COLLECTION_NAME).findOne(
			{ _id: newId }
		)
		return newUser
	} catch (error) {
		throw new Error(error)
	}
}
const getAllUser = async (webId, startIndex, limit, filterObj) => {
	const query = {
		webId: new ObjectId(webId),
		...filterObj.name !== '' ? { name: filterObj.name } : {},
		...filterObj.email !== '' ? { email: filterObj.email } : {},
		...filterObj.isAdmin !== '' ? { isAdmin: filterObj.isAdmin } : {},
		...(filterObj.searchtext ? {
			$or: [
				{ name: { $regex: filterObj.searchtext, $options: 'i' } },
				{ email: { $regex: filterObj.searchtext, $options: 'i' } },
			]
		} : {})
	}

	try {
		const result = await GET_DB().collection(USER_COLLECTION_NAME).find(query).sort({ createAt: 1 }).limit(limit).skip(startIndex).toArray()

		const totalUserForType = await filterUser(webId, filterObj)
		const totalUser = totalUserForType.length
		const totalPage = Math.ceil(totalUser / limit)

		return { totalUser, totalPage, data: result || null }

	} catch (error) {
		throw new Error(error)
	}
}
const filterUser = async (webId, filterObj) => {
	try {
		return await GET_DB().collection(USER_COLLECTION_NAME).find({
			webId: new ObjectId(webId),
			...filterObj.name !== '' ? { name: filterObj.name } : {},
			...filterObj.email !== '' ? { email: filterObj.email } : {},
			...filterObj.isAdmin !== '' ? { isAdmin: filterObj.isAdmin } : {},
			...(filterObj.searchtext ? {
				$or: [
					{ name: { $regex: filterObj.searchtext, $options: 'i' } },
					{ email: { $regex: filterObj.searchtext, $options: 'i' } }
				]
			} : {})
		}).toArray()

	} catch (error) {
		throw new Error(error)
	}
}
const getUserById = async (webId, id) => {
	try {
		return await GET_DB().collection(USER_COLLECTION_NAME).findOne({
			_id: new ObjectId(id),
			webId: new ObjectId(webId),
		}) || null

	} catch (error) {
		throw new Error(error)
	}
}
const deleteUser = async (id) => {
	try {
		return await GET_DB().collection(USER_COLLECTION_NAME).deleteOne({
			_id: new ObjectId(id)
		})
	} catch (error) {
		throw new Error(error)
	}
}
const updateDetail = async (data) => {
	const { _id, webId } = data
	Object.keys(data).forEach(field => {
		if (INVALID_UPDATE_FIELDS.includes(field)) {
			delete data[field]
		}
	})

	const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
		{
			_id: new ObjectId(_id),
			webId: new ObjectId(webId),
		},
		{ $set: data },
		{ returnDocument: 'after' }
	)
	return result
}
export const userModel = {
	checkValidEmail,
	getAllUser,
	createNew,
	getUserById,
	deleteUser,
	updateDetail
}
