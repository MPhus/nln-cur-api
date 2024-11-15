/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/fortmatters'
import { webModel } from '~/models/WebModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { deleteOnCoudinary } from '~/config/cloudinary'
import { pageModel } from '~/models/PageModel'
import CustomDate from '~/utils/customDate'
const createNew = async (data) => {
	try {

		const newWeb = {
			...data,
			slug: slugify(data.title)
		}

		const createdWeb = await webModel.createNew(newWeb)
		const getNewWeb = await webModel.findOneById(createdWeb.insertedId)

		return getNewWeb

	} catch (error) {
		throw error
	}
}
const createNewsOnOtherPage = async (data) => {
	try {

		const newNews = {
			...data,
			isDark: JSON.parse(data.isDark),
			isCenter: JSON.parse(data.isCenter)
		}

		const newsCreated = await pageModel.createNewsOnOtherPage(newNews)
		const getNewColumn = await pageModel.findNewsById(newsCreated.insertedId)

		if (getNewColumn) {
			await pageModel.pushNewsId(getNewColumn)
		}

		return getNewColumn


	} catch (error) {
		throw error
	}
}
const createOtherPage = async (data) => {
	try {

		const createdOtherPage = await pageModel.createOtherPage(data)
		const getNewWeb = await webModel.findOneById(createdOtherPage.insertedId)

		return getNewWeb

	} catch (error) {
		throw error
	}
}

const getHomePage = async (webSlug) => {
	try {

		const web = await webModel.getDetail(webSlug)
		// console.log('web: ', web._id)

		if (!web) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')
		return await pageModel.getHomePage((web._id).toString()) //done

		// const otherPage = await pageModel.getOtherPage((web._id).toString())// chưa xong newListOrderIDS


	} catch (error) {
		throw error
	}
}

const getOtherPage = async (webSlug) => {
	try {

		const web = await webModel.getDetail(webSlug)
		// console.log('web: ', web._id)

		if (!web) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')

		return await pageModel.getOtherPage((web._id).toString())// chưa xong newListOrderIDS


	} catch (error) {
		throw error
	}
}

const getStorePage = async (webSlug, type) => {
	try {

		const web = await webModel.getDetail(webSlug)

		if (!web) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')

		return await pageModel.getStorePage((web._id).toString(), type)// chưa xong newListOrderIDS

	} catch (error) {
		throw error
	}
}

const updateNews = async (data) => {
	try {
		let updateWeb = {
			...data,
			// updatedAt: CustomDate()
		}
		const news = await pageModel.findNewsById(data._id)
		if (!news) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')

		if (data.thumb === '') {
			updateWeb = {
				...updateWeb,
				thumb: news.thumb
			}
		} else {
			deleteOnCoudinary(news.thumb)
			updateWeb = {
				...updateWeb,
				thumb: data.thumb
			}
		}
		const resuil = await pageModel.updateNews(updateWeb)

		return resuil

	} catch (error) {
		throw error
	}
}
const updateSlide = async (data) => {
	try {
		let updateWeb = {
			...data,
			// updatedAt: CustomDate()
		}
		const slide = await pageModel.findSlideById(data._id)
		if (!slide) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')

		if (data.thumb === '') {
			updateWeb = {
				...updateWeb,
				thumb: slide.thumb
			}
		} else {
			deleteOnCoudinary(slide.thumb)
			updateWeb = {
				...updateWeb,
				thumb: data.thumb
			}
		}
		const resuil = await pageModel.updateSlide(updateWeb)

		return resuil

	} catch (error) {
		throw error
	}
}
const updateHomePage = async (data) => {
	try {

		const homePage = await pageModel.findOnlyHomePageById(data._id)
		if (!homePage) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')

		let updateWeb = {
			...data,
			thumbPant: data.thumbPant === '' ? homePage.thumbPant : data.thumbPant,
			thumbShirt: data.thumbShirt === '' ? homePage.thumbShirt : data.thumbShirt
			// updatedAt: CustomDate()
		}
		if (updateWeb.thumbPant !== homePage.thumbPant) deleteOnCoudinary(homePage.thumbPant)
		if (updateWeb.thumbShirt !== homePage.thumbShirt) deleteOnCoudinary(homePage.thumbShirt)


		const resuil = await pageModel.updateHomePage(updateWeb)

		return resuil

	} catch (error) {
		throw error
	}
}


const moveNewsOnOtherPage = async (webSlug, data) => {
	try {
		const otherPage = await getOtherPage(webSlug)

		if (!otherPage) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')


		const newOtherPage = await pageModel.moveNewsOnOtherPage(otherPage._id.toString(), data)
		if (!newOtherPage) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

		return newOtherPage

	} catch (error) {
		throw error
	}
}
const deleteNews = async (id) => {
	try {
		const news = await pageModel.findNewsById(id)
		deleteOnCoudinary(news.thumb)
		await pageModel.deleteNews(id)
		await pageModel.pullNewsListOderIds(news)

		return { Deletemessage: 'Delete successfuly' }

	} catch (error) {
		throw error
	}
}
export const webService = {
	createNew,
	createOtherPage,
	createNewsOnOtherPage,
	getHomePage,
	moveNewsOnOtherPage,
	getOtherPage,
	getStorePage,
	deleteNews,
	updateNews,
	updateSlide,
	updateHomePage
	// moveCardToOtherColumn
}
