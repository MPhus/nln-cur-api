import { env } from '~/config/environment'
const PUBLIC_HOST = 'https://b4df-2402-800-6343-34d1-ec61-4205-5ad1-4792.ngrok-free.app'
export const WHITELIST_DOMAIN = [
	'http://localhost:5173',
	'http://localhost:3000/v1/web/verifyMail',
	PUBLIC_HOST
]
export const PRODUCT_TYPE = {
	TOP: 'top',
	BOTTOM: 'bottom'
}
export const PAY_METHOD = {
	ZALOPAY: 'zaloPay',
	CASH: 'cash'
}
export const EMAIL_REGEX = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/

