import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const HOMEPAGE_COLLECTION_NAME = 'homepages'
const OTHER_COLLECTION_NAME = 'otherpages'
const PRODUCTS_COLLECTION_NAME = 'products'
const STORE_COLLECTION_NAME = 'storepages'
const NEWS_COLLECTION_NAME = 'news'
const SLIDE_COLLECTION_NAME = 'slides'

const PAGE_COLLECTION_SCHEMA = Joi.object({

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
const INVALID_UPDATE_FIELDS = ['_id', 'webId', 'pageId']

const validate = async (data) => {

	return await PAGE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {

	try {
		const validData = await validate(data)

		return await GET_DB().collection(HOMEPAGE_COLLECTION_NAME).insertOne(validData)

	} catch (error) {
		throw new Error(error)
	}

}

const createOtherPage = async (data) => {

	try {

		return await GET_DB().collection(OTHER_COLLECTION_NAME).insertOne({
			webId: new ObjectId(data.webId)
		})

	} catch (error) {
		throw new Error(error)
	}
}
const createNewsOnOtherPage = async (data) => {
	try {

		return await GET_DB().collection(NEWS_COLLECTION_NAME).insertOne(
			{
				...data,
				webId: new ObjectId(data.webId),
				pageId: new ObjectId(data.pageId),
			}
		)

	} catch (error) {
		throw new Error(error)
	}

}

const findNewsById = async (id) => {
	try {

		return await GET_DB().collection(NEWS_COLLECTION_NAME).findOne({
			_id: new ObjectId(id)
		})

	} catch (error) {
		throw new Error(error)
	}
}
const findSlideById = async (id) => {
	try {

		return await GET_DB().collection(SLIDE_COLLECTION_NAME).findOne({
			_id: new ObjectId(id)
		})

	} catch (error) {
		throw new Error(error)
	}
}
const pushNewsId = async (news) => {
	const result = await GET_DB().collection(OTHER_COLLECTION_NAME).findOneAndUpdate(
		{ _id: new ObjectId(news.pageId) },
		{ $push: { newListOderIds: new ObjectId(news._id) } },
		{ returnDocument: 'after' }
	)
	return result
}

const getHomePage = async (webId) => {
	try {
		const result = await GET_DB().collection(HOMEPAGE_COLLECTION_NAME).aggregate([
			{
				$match: {
					webId: new ObjectId(webId),
				}
			},
			{
				$lookup:
				{
					from: 'slides',
					let: { webId: '$webId', pageId: '$_id' },
					pipeline: [
						{
							$match:
							{
								$expr: {
									$and: [
										{ $eq: ['$webId', '$$webId'] },
										{ $eq: ['$pageId', '$$pageId'] },
									]
								}
							}
						},
					],
					as: 'slide'
				}
			},
			{
				$unwind: '$slide',
			},
			{
				$lookup:
				{
					from: 'news',
					let: { webId: '$webId', pageId: '$_id' },
					pipeline: [
						{
							$match:
							{
								$expr: {
									$and: [
										{ $eq: ['$webId', '$$webId'] },
										{ $eq: ['$pageId', '$$pageId'] },
										{ $eq: ['$isCenter', true] },
									]
								}
							}
						},
					],
					as: 'intro'
				}
			},
			{
				$unwind: '$intro',
			},
			{
				$lookup:
				{
					from: 'news',
					let: { webId: '$webId', pageId: '$_id' },
					pipeline: [
						{
							$match:
							{
								$expr: {
									$and: [
										{ $eq: ['$webId', '$$webId'] },
										{ $eq: ['$pageId', '$$pageId'] },
										{ $eq: ['$isCenter', false] },
									]
								}
							}
						},
					],
					as: 'about'
				}
			},
			{
				$unwind: '$about',
			}
		]).toArray()

		return result[0] || null

	} catch (error) {
		throw new Error(error)
	}
}
const getOtherPage = async (webId) => {
	try {
		const result = await GET_DB().collection(OTHER_COLLECTION_NAME).aggregate([
			{
				$match: {
					webId: new ObjectId(webId),
				}
			},
			{
				$lookup:
				{
					from: 'slides',
					let: { webId: '$webId', pageId: '$_id' },
					pipeline: [
						{
							$match:
							{
								$expr: {
									$and: [
										{ $eq: ['$webId', '$$webId'] },
										{ $eq: ['$pageId', '$$pageId'] },
									]
								}
							}
						},
					],
					as: 'slide'
				}
			},
			{
				$unwind: '$slide',
			},
			{
				$lookup:
				{
					from: 'news',
					let: { webId: '$webId', pageId: '$_id' },
					pipeline: [
						{
							$match:
							{
								$expr: {
									$and: [
										{ $eq: ['$webId', '$$webId'] },
										{ $eq: ['$pageId', '$$pageId'] },
									]
								}
							}
						},
					],
					as: 'newsList'
				}
			},

		]).toArray()

		return result[0] || null

	} catch (error) {
		throw new Error(error)
	}
}
const getStorePage = async (webId, type) => {
	try {
		const result = await GET_DB().collection(STORE_COLLECTION_NAME).aggregate([
			{
				$match: {
					webId: new ObjectId(webId),
				}
			},
			{
				$lookup:
				{
					from: 'slides',
					let: { webId: '$webId', pageId: '$_id' },
					pipeline: [
						{
							$match:
							{
								$expr: {
									$and: [
										{ $eq: ['$webId', '$$webId'] },
										{ $eq: ['$pageId', '$$pageId'] },
										{ $eq: ['$type', type] },
									]
								}
							}
						},
					],
					as: `${type}Slide`
				}
			},
			{
				$unwind: `$${type}Slide`,
			},

		]).toArray()

		return result[0] || null

	} catch (error) {
		throw new Error(error)
	}
}

const moveNewsOnOtherPage = async (pageId, data) => {

	if (data.newListOderIds) data.newListOderIds = data.newListOderIds.map(item => new ObjectId(item))
	const result = await GET_DB().collection(OTHER_COLLECTION_NAME).findOneAndUpdate(
		{ _id: new ObjectId(pageId) },
		{ $set: data },
		{ returnDocument: 'after' }
	)
	return result
}

const deleteNews = async (id) => {
	try {

		return await GET_DB().collection(NEWS_COLLECTION_NAME).deleteOne({
			_id: new ObjectId(id)
		})

	} catch (error) {
		throw new Error(error)
	}
}
const pullNewsListOderIds = async (news) => {
	const result = await GET_DB().collection(OTHER_COLLECTION_NAME).findOneAndUpdate(
		{ _id: new ObjectId(news.pageId) },
		{ $pull: { newListOderIds: new ObjectId(news._id) } },
		{ returnDocument: 'after' }
	)
	return result
}

const updateNews = async (data) => {
	const { _id, webId, pageId } = data
	Object.keys(data).forEach(field => {
		if (INVALID_UPDATE_FIELDS.includes(field)) {
			delete data[field]
		}
	})

	const result = await GET_DB().collection(NEWS_COLLECTION_NAME).findOneAndUpdate(
		{
			_id: new ObjectId(_id),
			webId: new ObjectId(webId),
			pageId: new ObjectId(pageId),
		},
		{ $set: data },
		{ returnDocument: 'after' }
	)
	return result
}
const updateSlide = async (data) => {
	const { _id, webId, pageId } = data
	Object.keys(data).forEach(field => {
		if (INVALID_UPDATE_FIELDS.includes(field)) {
			delete data[field]
		}
	})

	const result = await GET_DB().collection(SLIDE_COLLECTION_NAME).findOneAndUpdate(
		{
			_id: new ObjectId(_id),
			webId: new ObjectId(webId),
			pageId: new ObjectId(pageId),
		},
		{ $set: data },
		{ returnDocument: 'after' }
	)
	return result
}
const findOnlyHomePageById = async (id) => {
	try {

		return await GET_DB().collection(HOMEPAGE_COLLECTION_NAME).findOne({
			_id: new ObjectId(id)
		})

	} catch (error) {
		throw new Error(error)
	}
}
const updateHomePage = async (data) => {
	const { _id, webId } = data
	Object.keys(data).forEach(field => {
		if (INVALID_UPDATE_FIELDS.includes(field)) {
			delete data[field]
		}
	})

	const result = await GET_DB().collection(HOMEPAGE_COLLECTION_NAME).findOneAndUpdate(
		{
			_id: new ObjectId(_id),
			webId: new ObjectId(webId),
		},
		{ $set: data },
		{ returnDocument: 'after' }
	)
	return result
}

export const pageModel = {
	HOMEPAGE_COLLECTION_NAME,
	PAGE_COLLECTION_SCHEMA,
	createNew,
	createOtherPage,
	createNewsOnOtherPage,
	findNewsById,
	pushNewsId,
	getHomePage,
	getOtherPage,
	getStorePage,
	moveNewsOnOtherPage,
	deleteNews,
	pullNewsListOderIds,
	updateNews,
	findSlideById,
	updateSlide,
	updateHomePage,
	findOnlyHomePageById
}
