import { StatusCodes } from 'http-status-codes'
import { webService } from '~/services/WebService'
import { productService } from '~/services/ProductService'
import { webModel } from '~/models/WebModel'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
	try {
		const web = await webModel.getDetail(req.params.slug)
		const data = {
			...req.body,
			thumb: req.file.path,
			webId: web._id.toString()
		}
		const productCreated = await productService.createNew(data)

		res.status(StatusCodes.CREATED).json(productCreated)
	}
	catch (err) {
		next(err)
	}
}
const updateDetail = async (req, res, next) => {
	try {
		const data = {
			...req.body,
			thumb: req.file ? req.file.path : '',
		}
		const productDetailUpdated = await productService.updateDetail(data)
		if (!productDetailUpdated) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found!')

		res.status(StatusCodes.CREATED).json(productDetailUpdated)
	}
	catch (err) {
		next(err)
	}
}

const getProductByPage = async (req, res, next) => {
	try {
		const { type, price, color, size, fabric, searchtext, isGetSoldOut } = req.query
		const filterObj = {
			type, price, color, size, fabric, searchtext, isGetSoldOut
		}
		const page = req.query.page * 1
		const limit = req.query.limit * 1
		const web = await webModel.getDetail(req.params.slug)

		if (!web) throw new ApiError(StatusCodes.NOT_FOUND, 'Web not found!')

		const resuil = await productService.getProductByPage(web._id.toString(), page, limit, filterObj)
		res.status(StatusCodes.OK).json(resuil)

	}
	catch (err) {
		next(err)
	}
}
const findOneById = async (req, res, next) => {
	try {
		const id = req.query.id
		const web = await webModel.getDetail(req.params.slug)
		const resuil = await productService.findOneById(web._id.toString(), id)
		res.status(StatusCodes.OK).json(resuil)
	}
	catch (err) {
		next(err)
	}
}

const getBestSeller = async (req, res, next) => {
	try {
		const { type, number } = req.query
		const web = await webModel.getDetail(req.params.slug)
		const resuil = await productService.getBestSeller(web._id.toString(), type, number)
		res.status(StatusCodes.OK).json(resuil)
	}
	catch (err) {
		next(err)
	}
}
const deleteProduct = async (req, res, next) => {
	try {
		const { id } = req.query
		const web = await webModel.getDetail(req.params.slug)
		const result = await productService.deleteProduct(web._id.toString(), id)

		res.status(StatusCodes.CREATED).json(result)
	}
	catch (err) {
		next(err)
	}
}
export const productController = {
	createNew,
	getProductByPage,
	findOneById,
	updateDetail,
	getBestSeller,
	deleteProduct
}
