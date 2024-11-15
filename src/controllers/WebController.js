import { StatusCodes } from 'http-status-codes'
import { webService } from '~/services/WebService'
const createNew = async (req, res, next) => {
	try {
		// console.log('req.body', req.body)
		const createdWeb = await webService.createNew(req.body)

		res.status(StatusCodes.CREATED).json(createdWeb)
	}
	catch (err) {
		next(err)
	}
}
const createOtherPage = async (req, res, next) => {
	try {
		const otherPageCreated = await webService.createOtherPage(req.body)

		res.status(StatusCodes.CREATED).json(otherPageCreated)
	}
	catch (err) {
		next(err)
	}
}
const createNewsOnOtherPage = async (req, res, next) => {
	try {
		const data = {
			...req.body,
			thumb: req.file.path,
		}
		const createdWeb = await webService.createNewsOnOtherPage(data)

		res.status(StatusCodes.CREATED).json(createdWeb)
	}
	catch (err) {
		next(err)
	}
}

const getHomePage = async (req, res, next) => {
	try {
		const homePage = await webService.getHomePage(req.params.slug)
		res.status(StatusCodes.OK).json(homePage)
	}
	catch (err) {
		next(err)
	}
}
const getOtherPage = async (req, res, next) => {
	try {
		const otherPage = await webService.getOtherPage(req.params.slug)
		res.status(StatusCodes.OK).json(otherPage)
	}
	catch (err) {
		next(err)
	}
}

const getStorePage = async (req, res, next) => {
	try {
		const { type } = req.query
		const storePage = await webService.getStorePage(req.params.slug, type)
		res.status(StatusCodes.OK).json(storePage)
	}
	catch (err) {
		next(err)
	}
}

const updateNews = async (req, res, next) => {
	try {
		const data = {
			...req.body,
			thumb: req.file ? req.file.path : '',
			isDark: JSON.parse(req.body.isDark),
			isCenter: JSON.parse(req.body.isCenter),
		}

		const news = await webService.updateNews(data)
		res.status(StatusCodes.OK).json(news)
	}
	catch (err) {
		next(err)
	}
}
const updateSlide = async (req, res, next) => {
	try {
		const data = {
			...req.body,
			thumb: req.file ? req.file.path : '',
		}

		const slide = await webService.updateSlide(data)
		res.status(StatusCodes.OK).json(slide)
	}
	catch (err) {
		next(err)
	}
}
const updateHomePage = async (req, res, next) => {
	try {
		const { thumbPant, thumbShirt } = req.files

		const data = {
			...req.body,
			thumbShirt: thumbShirt ? thumbShirt[0].path : '',
			thumbPant: thumbPant ? thumbPant[0].path : '',
		}

		const homePage = await webService.updateHomePage(data)
		res.status(StatusCodes.OK).json(homePage)
	}
	catch (err) {
		next(err)
	}
}

const moveNewsOnOtherPage = async (req, res, next) => {
	try {
		const otherPage = await webService.moveNewsOnOtherPage(req.params.slug, req.body)

		res.status(StatusCodes.OK).json(otherPage)
	}
	catch (err) {
		next(err)
	}
}
const deleteNews = async (req, res, next) => {
	try {
		const result = await webService.deleteNews(req.params.id)

		res.status(StatusCodes.CREATED).json(result)
	}
	catch (err) {
		next(err)
	}
}
export const webController = {
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
}
