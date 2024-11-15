import JWT from 'jsonwebtoken'
const generateToken = async (payload, privateKey, tokenLife) => {
	try {

		return JWT.sign(payload, privateKey, { algorithm: 'HS256', expiresIn: tokenLife })

	} catch (error) { throw new Error(error) }
}
const verifyToken = async (token, privateKey) => {
	try {

		const a = await JWT.verify(token, privateKey)
		return a

	} catch (error) {
		throw new Error(error)
	}
}

export const JwtProvider = {
	generateToken,
	verifyToken
}