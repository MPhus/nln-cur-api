import 'dotenv/config'

export const env = {
	MONGODB_URI: process.env.MONGODB_URI,
	DB_NAME: process.env.DB_NAME,
	LOCAL_DEV_HOST: process.env.LOCAL_DEV_HOST,
	LOCAL_DEV_PORT: process.env.LOCAL_DEV_PORT,
	LOCAL_DEV_FORNTEND_PORT: process.env.LOCAL_DEV_FORNTEND_PORT,

	CLOUD_NAME: process.env.CLOUD_NAME,
	API_KEY_CLOUDINARY: process.env.API_KEY_CLOUDINARY,
	API_SECRET_CLOUDINARY: process.env.API_SECRET_CLOUDINARY,

	BUILD_MODE: process.env.BUILD_MODE,

	AUTHOR: process.env.AUTHOR,
	APP_PASSWORK: process.env.APP_PASSWORK,
	EMAIL: process.env.EMAIL,


	ACCESS_TOKEN_SECRET_SIGNATURE: process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
	REFRESH_TOKEN_SECRET_SIGNATURE: process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
	ORDER_TOKEN_SECRET_SIGNATURE: process.env.ORDER_TOKEN_SECRET_SIGNATURE,
	EMAIL_TOKEN_SECRET_SIGNATURE: process.env.EMAIL_TOKEN_SECRET_SIGNATURE,


	HOST_FRONTEND: process.env.HOST_FRONTEND,

	ZALOPAY_APP_ID: process.env.ZALOPAY_APP_ID,
	ZALOPAY_KEY1: process.env.ZALOPAY_KEY1,
	ZALOPAY_KEY2: process.env.ZALOPAY_KEY2,
	ZALOPAY_PAYMENT_PAGE_ENDPOINT: process.env.ZALOPAY_PAYMENT_PAGE_ENDPOINT,
	ZALOPAY_ORDER_STATUS_ENDPOINT: process.env.ZALOPAY_ORDER_STATUS_ENDPOINT,
	PUBLIC_HOST: process.env.PUBLIC_HOST,
}
