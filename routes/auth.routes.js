const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const UserModel = require("../models/user.model.js")
const validation = require("../validation.js")

dotenv.config()

router.post("/register", async (req, res) => {
	// Validate the user
	const { error } = validation.registrationUserValidaion(req.body)
	if (error) return res.status(400).json({ success: false, msg: error.details[0].message })

	// Does the user already exist
	const emailExists = await UserModel.findOne({ email: req.body.email })
	if (emailExists)
		return res.status(400).json({
			success: false,
			msg: "An account with that email address already exists, try logging in",
		})

	// The sex is an expected value
	if (req.body.sex !== "m" && req.body.sex !== "f")
		return res.status(400).json({
			success: false,
			msg: "The sex of the person must be set",
		})

	// Ensure the passwords match
	if (req.body.password !== req.body.password2)
		return res.status(400).json({
			succes: false,
			msg: "The passwords provided do not match",
		})

	// Hash the password
	const salt = await bcrypt.genSalt(10)
	const hash = await bcrypt.hash(req.body.password, salt)

	const user = new UserModel({
		name: req.body.name,
		email: req.body.email,
		sex: req.body.sex,
		password: hash,
	})

	try {
		const savedUser = await user.save()
		res.json({
			success: true,
			user: {
				_id: savedUser._id,
				name: savedUser.name,
				email: savedUser.email,
				sex: savedUser.sex,
			},
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			msg: "It has not been possible to create an account at this time",
			error: err,
		})
	}
})

router.post("/login", async (req, res) => {
	// User validation
	const { error } = validation.loginUserValidaion(req.body)
	if (error) return res.status(400).json({ success: false, msg: error.details[0].message })

	// Does the user exist?
	const user = await UserModel.findOne({ email: req.body.email })
	if (!user)
		return res.status(404).json({
			success: false,
			msg: "An account with that email address does not exist",
		})

	// Is the password correct?
	const validPassword = await bcrypt.compare(req.body.password, user.password)
	if (!validPassword)
		return res.status(401).json({
			success: false,
			msg: "That password is incorrect",
		})

	// Create a JWT
	const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
	res.header("auth-token", token).json({
		success: true,
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			sex: user.sex,
		},
	})
})

router.post("/authenticate_token", async (req, res) => {
	const token = req.header("auth-token")

	if (!token)
		return res.status(401).json({
			success: false,
			msg: "Missing token",
		})

	try {
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)

		if (decodedToken) {
			const user = await UserModel.findById(decodedToken._id)

			if (!user) {
				return res.status(418).json({
					success: false,
					msg: "It has not been possible to locate a user with that id",
				})
			}

			return res.json({
				success: true,
				token,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					sex: user.sex,
				},
			})
		} else {
			return res.status(401).json({
				success: false,
				msg: "Bad authentication",
			})
		}
	} catch (err) {
		console.error(err)
		return res.status(500).json({
			success: false,
			msg: "Bad authentication",
		})
	}
})

module.exports = router
