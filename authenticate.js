const jwt = require("jsonwebtoken")
const UserModel = require("./models/user.model.js")

// Middleware to be used on routes requiring authentication
module.exports = async (req, res, next) => {
	const token = req.header("auth-token")

	if (!token)
		return res.status(401).json({
			success: false,
			msg: "Missing token",
		})

	try {
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)
		const user = await UserModel.findById(decodedToken._id)

		if (!user)
			return res.status(404).json({
				success: false,
				msg: "UNAUTHORISED - No user matching given token",
			})

		req.token = decodedToken
		req.requestUser = user
	} catch (err) {
		return res.status(418).json({ success: false, msg: "Bad authentication" })
	}

	next()
}
