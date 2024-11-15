import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const WEB_COLLECTION_NAME = 'webs'

const WEB_COLLECTION_SCHEMA = Joi.object({

	title: Joi.string().required().min(3).max(50).trim().strict(),
	description: Joi.string().max(256).trim().strict(),

	slug: Joi.string().required().min(3).trim().strict(),

	// columnOrderIds: Joi.array().items(
	// 	Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_MESSAGE)
	// ).default([]),

	// createdAt: Joi.date().timestamp('javascript').default(Date.now),
	// updatedAt: Joi.date().timestamp('javascript').default(null),
	// _destroy: Joi.boolean().default(false)

})
const INVALID_UPDATE_FIELDS = ['_id']

const validate = async (data) => {

	return await WEB_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {

	try {
		const validData = await validate(data)

		return await GET_DB().collection(WEB_COLLECTION_NAME).insertOne(validData)

	} catch (error) {
		throw new Error(error)
	}

}
const findOneById = async (id) => {
	try {

		return await GET_DB().collection(WEB_COLLECTION_NAME).findOne({
			_id: new ObjectId(id)
		})

	} catch (error) {
		throw new Error(error)
	}
}

// const pushColumnId = async (column) => {
// 	const result = await GET_DB().collection(WEB_COLLECTION_NAME).findOneAndUpdate(
// 		{ _id: new ObjectId(column.webId) },
// 		{ $push: { columnOrderIds: new ObjectId(column._id) } },
// 		{ returnDocument: 'after' }
// 	)
// 	return result
// }

const getDetail = async (webSlug) => {
	try {
		const result = await GET_DB().collection(WEB_COLLECTION_NAME).aggregate([
			{
				$match: {
					// _id: new ObjectId(webSlug),
					// _destroy: false
					slug: webSlug
				}
			},
			// {
			// 	$lookup:
			// 	{
			// 		from: 'homepages',
			// 		localField: '_id',
			// 		foreignField: 'webId',
			// 		as: 'homepages'
			// 	}
			// },

			// {
			// 	$unwind: '$homepages',
			// },
			// {
			// 	$lookup:
			// 	{
			// 		from: 'products',
			// 		localField: '_id',
			// 		foreignField: 'webId',
			// 		as: 'products'
			// 	}
			// },
			// {
			// 	$unwind: {
			// 		path: '$homepages',
			// 		includeArrayIndex: 'homepages_index',
			// 	}
			// },
		]).toArray()
		return result[0] || null

	} catch (error) {
		throw new Error(error)
	}
}

// const update = async (webId, data) => {
// 	Object.keys(data).forEach(field => {
// 		if (INVALID_UPDATE_FIELDS.includes(field)) {
// 			delete data[field]
// 		}
// 	})

// 	if (data.columnOrderIds) data.columnOrderIds = data.columnOrderIds.map(item => new ObjectId(item))
// 	const result = await GET_DB().collection(WEB_COLLECTION_NAME).findOneAndUpdate(
// 		{ _id: new ObjectId(webId) },
// 		{ $set: data },
// 		{ returnDocument: 'after' }
// 	)
// 	return result
// }

// const pullColumnOderIds = async (column) => {
// 	const result = await GET_DB().collection(WEB_COLLECTION_NAME).findOneAndUpdate(
// 		{ _id: new ObjectId(column.webId) },
// 		{ $pull: { columnOrderIds: new ObjectId(column._id) } },
// 		{ returnDocument: 'after' }
// 	)
// 	return result
// }

export const webModel = {
	WEB_COLLECTION_NAME,
	WEB_COLLECTION_SCHEMA,
	createNew,
	findOneById,
	getDetail,
	// pushColumnId,
	// update,
	// pullColumnOderIds
}
