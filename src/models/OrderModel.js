import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { PRODUCT_TYPE } from '~/utils/constants'
import CustomDate from '~/utils/customDate'
const ORDERS_COLLECTION_NAME = 'orders'
const CUSTOMERS_COLLECTION_NAME = 'customers'



const INVALID_UPDATE_FIELDS = ['_id']

const createNew = async (data, customerInfor) => {
	const { email, fullname, phone, address, city, district, ward } = customerInfor

	const newCustomerInfor = { email, fullname, phone, address, city, district, ward }

	try {
		const resuil = await GET_DB().collection(ORDERS_COLLECTION_NAME).insertOne({ ...data, webId: new ObjectId(data.webId) })
		const newCustomer = await GET_DB().collection(CUSTOMERS_COLLECTION_NAME).updateOne(
			{
				email: newCustomerInfor.email,
				webId: new ObjectId(data.webId)
			},
			{
				$set: { ...newCustomerInfor, webId: new ObjectId(data.webId) }
			},
			{ upsert: true }
		)

		const newId = resuil.insertedId

		return newId.toString()
	} catch (error) {
		throw new Error(error)
	}

}
const findOneById = async (webId, orderId) => {
	try {
		return await GET_DB().collection(ORDERS_COLLECTION_NAME).findOne({
			_id: new ObjectId(orderId),
			webId: new ObjectId(webId),
		}) || null

	} catch (error) {
		throw new Error(error)

	}
}


const getOrderByPage = async (webId, startIndex, limit, filterObj) => {
	const query = {
		webId: new ObjectId(webId),
		...filterObj.type !== '' ? { type: filterObj.type } : {},
		...filterObj.color !== '' ? { color: filterObj.color } : {},
		...filterObj.size !== '' ? { size: filterObj.size } : {},
		...filterObj.fabric !== '' ? { material: filterObj.fabric } : {},
		...(filterObj.searchtext ? {
			$or: [
				{ name: { $regex: filterObj.searchtext, $options: 'i' } },
				{ material: { $regex: filterObj.searchtext, $options: 'i' } },
				{ type: { $regex: filterObj.searchtext, $options: 'i' } },
				{ color: { $regex: filterObj.searchtext, $options: 'i' } },
				{ barcode: { $regex: filterObj.searchtext, $options: 'i' } },
				// Thêm các trường khác mà bạn muốn tìm kiếm
			]
		} : {})
	}
	let sortOption = {}
	if (filterObj.price === 'increase') {
		sortOption = { price: 1 }
	} else if (filterObj.price === 'decrease') {
		sortOption = { price: -1 }
	} else if (filterObj.price === 'latest') {
		sortOption = { createdAt: -1 }
	}
	try {
		const result = await GET_DB().collection(ORDERS_COLLECTION_NAME).find(query).sort(sortOption).limit(limit).skip(startIndex).toArray()

		const totalOrderForType = await filterOrder(webId, filterObj)
		const totalOrder = totalOrderForType.length
		const totalPage = Math.ceil(totalOrder / limit)

		return { totalOrder, totalPage, data: result || null }

	} catch (error) {
		throw new Error(error)
	}
}
const filterOrder = async (webId, filterObj) => {
	try {
		return await GET_DB().collection(ORDERS_COLLECTION_NAME).find({
			webId: new ObjectId(webId),
			...filterObj.type !== '' ? { type: filterObj.type } : {},
			...filterObj.color !== '' ? { color: filterObj.color } : {},
			...filterObj.size !== '' ? { size: filterObj.size } : {},
			...filterObj.fabric !== '' ? { material: filterObj.fabric } : {},
			...(filterObj.searchtext !== '' ? {
				$or: [
					{ name: { $regex: filterObj.searchtext, $options: 'i' } },
					{ material: { $regex: filterObj.searchtext, $options: 'i' } },
					{ type: { $regex: filterObj.searchtext, $options: 'i' } },
					{ color: { $regex: filterObj.searchtext, $options: 'i' } },
					{ barcode: { $regex: filterObj.searchtext, $options: 'i' } },
				]
			} : {})
		}).toArray()

	} catch (error) {
		throw new Error(error)
	}
}
const getBestSeller = async (webId, type, number) => {
	const query = {
		type: type,
		webId: new ObjectId(webId),
	}
	const result = await GET_DB().collection(ORDERS_COLLECTION_NAME).find(query).sort({ sold: -1 }).limit(number).toArray()
	return result
}
const getOrderByCustomer = async (webId, customerEmail) => {

	const result = await GET_DB().collection(ORDERS_COLLECTION_NAME).aggregate([
		{
			$match: {
				customerEmail: customerEmail,
				webId: new ObjectId(webId)  // Đảm bảo webId là ObjectId
			}
		},
		{
			$unwind: '$productList'  // Tách từng phần tử trong productList thành các tài liệu riêng
		},
		{
			$lookup: {
				from: 'products', // Tên collection chứa thông tin chi tiết sản phẩm
				let: { productID: { $toObjectId: '$productList.productID' } },  // Chuyển productID thành ObjectId
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$_id', '$$productID'] }  // So sánh _id của products với productID đã chuyển đổi
						}
					}
				],
				as: 'productDetails'
			}
		},
		{
			$unwind: '$productDetails'  // Tách các kết quả productDetails
		},
		{
			$group: {  // Gom nhóm lại để trả về theo format ban đầu với danh sách product details
				_id: '$_id',
				customerEmail: { $first: '$customerEmail' },
				customerFullname: { $first: '$customerFullname' },
				customerPhone: { $first: '$customerPhone' },
				payMethod: { $first: '$payMethod' },
				note: { $first: '$note' },
				type: { $first: '$type' },
				productList: {
					$push: {
						productID: '$productList.productID',
						quantity: '$productList.quantity',
						productDetails: '$productDetails'
					}
				},
				totalPrice: { $first: '$totalPrice' },
				tranportFee: { $first: '$tranportFee' },
				iat: { $first: '$iat' },
				exp: { $first: '$exp' },
				createAt: { $first: '$createAt' }
			}
		},
		{
			$sort: { createAt: -1 }  // Sắp xếp theo createAt giảm dần (mới nhất trước)
		}
	]).toArray();

	// console.log('result: ', result.map(r => r.productList));
	return result
}



//--------------- done of getmonth----------------------------
const getMonthList = async (webId) => {
	try {
		const orders = await GET_DB().collection(ORDERS_COLLECTION_NAME).find({ webId: new ObjectId(webId), }, { projection: { createAt: 1 } }).toArray()
		const months = orders.map(order => {
			const date = new CustomDate(order.createAt);
			return date.getMonth() + 1;  // getMonth() trả về giá trị từ 0 (tháng 1) đến 11 (tháng 12), nên cộng thêm 1 để chuyển sang tháng thực tế.
		});

		// Loại bỏ các giá trị trùng lặp bằng cách sử dụng Set
		const uniqueMonths = [...new Set(months)];


		// Sắp xếp danh sách tháng theo thứ tự tăng dần
		uniqueMonths.sort((a, b) => a - b);

		return uniqueMonths;  // Trả về danh sách các tháng duy nhất
	} catch (error) {
		console.log(error)
	}
}


const getAllOrder = async (webId, month) => {
	const today = new CustomDate();
	const year = today.getFullYear();
	const startOfMonth = new CustomDate(year, month - 1, 1);
	let endOfMonth;
	if (month - 1 === today.getMonth()) {
		// Nếu là tháng hiện tại, thì lấy tới thời điểm hiện tại
		endOfMonth = today;
	} else {
		// Lấy ngày đầu của tháng tiếp theo để giới hạn khoảng thời gian
		endOfMonth = new CustomDate(year, month, 1);
	}
	try {
		const orders = await GET_DB().collection(ORDERS_COLLECTION_NAME).aggregate([
			{
				$match: {
					webId: new ObjectId(webId),
					createAt: {
						$gte: startOfMonth,  // Lọc theo ngày bắt đầu
						$lt: endOfMonth  // Lọc theo ngày kết thúc
					},

				}
			},
			{
				$unwind: '$productList'  // Tách từng phần tử trong productList thành các tài liệu riêng
			},
			{
				$lookup: {
					from: 'products', // Tên collection chứa thông tin chi tiết sản phẩm
					let: { productID: { $toObjectId: '$productList.productID' } },  // Chuyển productID thành ObjectId
					pipeline: [
						{
							$match: {
								$expr: { $eq: ['$_id', '$$productID'] }  // So sánh _id của products với productID đã chuyển đổi
							}
						}
					],
					as: 'productDetails'
				}
			},
			{
				$unwind: '$productDetails'  // Tách các kết quả productDetails
			},
			{
				$group: {  // Gom nhóm lại để trả về theo format ban đầu với danh sách product details
					_id: '$_id',
					customerEmail: { $first: '$customerEmail' },
					customerFullname: { $first: '$customerFullname' },
					customerPhone: { $first: '$customerPhone' },
					payMethod: { $first: '$payMethod' },
					note: { $first: '$note' },
					productList: {
						$push: {
							productID: '$productList.productID',
							quantity: '$productList.quantity',
							productDetails: '$productDetails'
						}
					},
					totalPrice: { $first: '$totalPrice' },
					tranportFee: { $first: '$tranportFee' },
					iat: { $first: '$iat' },
					exp: { $first: '$exp' },
					createAt: { $first: '$createAt' }
				}
			},
			{
				$sort: { createAt: -1 }  // Sắp xếp theo createAt giảm dần (mới nhất trước)
			}
		]).toArray();
		return orders
	} catch (error) {
		console.log(error)
	}
}

export const orderModel = {
	createNew,
	getOrderByPage,
	findOneById,
	filterOrder,
	getBestSeller,
	getOrderByCustomer,
	getAllOrder,
	getMonthList
}
