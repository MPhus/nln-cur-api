import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { env } from '~/config/environment'
cloudinary.config({
	cloud_name: env.CLOUD_NAME,
	api_key: env.API_KEY_CLOUDINARY,
	api_secret: env.API_SECRET_CLOUDINARY
})
// cloudinary.uploader.destroy('TiemCur/lipmpkpzz1ogcl01y3bw', function (error, result) {
// 	console.log(result, error)
// })
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'TiemCur',
	}
})

export const upload = multer({
	storage: storage
})
export const deleteOnCoudinary = (linkImg) => {
	const startIndex = linkImg.search('TiemCur')
	const endIndex = linkImg.lastIndexOf('.')
	const resuil = linkImg.slice(startIndex, endIndex)
	cloudinary.uploader.destroy(resuil, function (error, result) {
		console.log('result: ', result)
		console.log('error: ', error)
	})
}

