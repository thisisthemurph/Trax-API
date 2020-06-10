const express = require("express")
const router = express.Router()

const UserModel = require("../models/user.model.js")

/**
 * Get a specific track by the track's id
 */
router.get("/:trackId", async (req, res) => {
	const query = UserModel.findOne({ "tracks._id": req.params.trackId })
	let user = null

	try {
		user = await query.exec()
		if (user === null) throw new Error("No Track was found with the specified id")
	} catch (err) {
		return res.status(404).json({ success: false, msg: "Could not find a Track with that id" })
	}

	const track = user.tracks.id(req.params.trackId)
	return res.json({ success: true, track })
})

/**
 * Get all Tracks for a specific user
 */
router.get("/user/:userId", async (req, res) => {
	try {
		const user = await UserModel.findById(req.params.userId)
		return res.json(user.tracks)
	} catch (err) {
		return res.status(404).json({ msg: "Could not find a user with that id" })
	}
})

/**
 * Creates a new track for the currently authenticated user
 */
router.post("/", async (req, res) => {
	const bodyIsValid = () => {
		if (!req.body.hasOwnProperty("name")) return false
		if (!req.body.hasOwnProperty("type")) return false
		if (!req.body.hasOwnProperty("data")) return false
		if (!req.body.data.hasOwnProperty("metric")) return false
		if (!req.body.data.hasOwnProperty("target")) return false
		if (!req.body.data.hasOwnProperty("increaseOrDecrease")) return false

		return true
	}

	if (!bodyIsValid()) {
		return res.status(400).json({
			success: false,
			msg: "Not all required parameters were present in the request",
		})
	}

	// Create the track, add it to the user

	const user = req.requestUser

	const track = {
		name: req.body.name,
		type: req.body.type,
		data: {
			metric: req.body.data.metric,
			target: req.body.data.target || null,
			increaseOrDecrease: req.body.data.increaseOrDecrease || null,
		},
	}

	user.tracks.push(track)

	// Save the user's data

	try {
		await user.save()
		return res.json({ success: true, track })
	} catch (err) {
		console.error(err)
		return res.status(500).json({
			success: false,
			msg: "It has not been possible to create the track at this time",
		})
	}
})

/**
 * Add new datapoints (1 or more) to the Track for the currently authenticated user
 * The req.body is expected to resemble the following:
 * 		{ dataPoints: [{ value: x, date: Date.ISO_String }] }
 *
 * ISO String: 1990-08-25T00:00:00.000Z
 */
router.post("/:trackId", async (req, res) => {
	// Validate the request

	const validateRequest = () => req.body.hasOwnProperty("dataPoints")
	if (!validateRequest())
		return res.status(400).json({
			success: false,
			msg: "Not all required parameters were present in the request",
			body: req.body,
		})

	// Get the specific track from the user's tracks and add the new data

	const user = req.requestUser
	const trackId = req.params.trackId

	const track = await user.tracks.id(trackId)
	if (track === null)
		return res.status(404).json({
			success: false,
			msg: "No such track with given id",
		})

	const originalLength = track.data.dataPoints.length
	const expectedLength = originalLength + req.body.dataPoints.length

	track.data.dataPoints.push(...req.body.dataPoints)

	// Save the user

	try {
		const updatedUser = await user.save()

		// Check that the update has worked
		const actualLength = updatedUser.tracks.id(trackId).data.dataPoints.length
		if (!actualLength === expectedLength) throw new Error("The update was not successfull")

		return res.json({
			success: true,
			track,
		})
	} catch (err) {
		return res.status(500).json({
			success: false,
			msg: "Could not save the new data points to the user",
		})
	}
})

/**
 * Updates the target for the given track
 */
router.put("/:trackId/target", async (req, res) => {
	// Get the specific track from the user's tracks and add the new data

	const query = UserModel.findOne({ "tracks._id": req.params.trackId })
	let user = null

	try {
		user = await query.exec()
		if (user === null) throw new Error("No Track was found with the specified id")
	} catch (err) {
		return res.status(404).json({ msg: "Could not find a Track with that id" })
	}

	const track = user.tracks.id(req.params.trackId)
	track.data.target = req.body.target

	try {
		const updatedUser = await user.save()

		// Check that the update has happened
		const updateWorked =
			updatedUser.tracks.id(req.params.trackId).data.target === req.body.target
		if (!updateWorked) throw new Error("The update was not successfull")

		return res.json({ success: true, track, updatedUser })
	} catch (err) {
		return res.status(500).json({
			success: false,
			msg: "Could not upate the Track's target",
		})
	}
})

/**
 * Update a specific Track
 */
router.put("/:trackId", async (req, res) => {
	const user = req.requestUser
	const trackId = req.params.trackId

	const validateBodyParams = () => {
		if (!req.body.hasOwnProperty("name")) return false
		if (!req.body.hasOwnProperty("type")) return false
		if (!req.body.hasOwnProperty("target")) return false
		if (!req.body.hasOwnProperty("metric")) return false
		if (!req.body.hasOwnProperty("increaseOrDecrease")) return false
		return true
	}

	const track = await user.tracks.id(trackId)
	if (track === null) {
		return res.status(404).json({
			success: false,
			msg: "A track could not be found with that ID for the given user",
		})
	}

	if (!validateBodyParams())
		return res.status(400).json({
			success: false,
			msg: "The body does not contain all appropriate parameters",
		})

	// Update the user and save

	track.name = req.body.name
	track.type = req.body.type
	track.data.target = req.body.target
	track.data.metric = req.body.metric
	track.data.increaseOrDecrease = req.body.increaseOrDecrease

	try {
		await user.save()
	} catch (err) {
		return res.status(500).json({
			success: false,
			msg: "It was not possible to upate the Track",
		})
	}

	return res.json({ success: true, track })
})

/**
 * Update a specific point of a Track
 */
router.put("/:trackId/point/:pointId", async (req, res) => {
	const user = req.requestUser
	const trackId = req.params.trackId
	const pointId = req.params.pointId

	const track = await user.tracks.id(trackId)
	if (track === null) {
		return res.status(404).json({
			success: false,
			msg: "A track could not be found with that ID for the given user",
		})
	}

	const point = track.data.dataPoints.id(pointId)
	if (point === null) {
		return res.status(404).json({
			success: false,
			msg: "A point could not be found with that ID for the given Track",
		})
	}

	// Update the point and save it back to the track

	point.timestamp = req.body.timestamp
	point.value = req.body.value

	try {
		await user.save()
	} catch (err) {
		return res.status(500).json({
			success: false,
			msg: "It was not possible to upate the Track's point data",
		})
	}

	return res.json({ success: true, track })
})

/**
 * Deletes a track for the authenticated user
 */
router.delete("/:trackId", async (req, res) => {
	// Get the current user and the trackId

	const user = req.requestUser
	const trackId = req.params.trackId

	const track = await user.tracks.id(trackId)
	if (track === null)
		return res.status(404).json({
			success: false,
			msg: "A track could not be found with that ID for the given user",
		})

	// If we got this far, the Track exists

	user.tracks.id(trackId).remove()
	user.save()

	return res.json({ success: true, track })
})

/**
 * Deletes a point from a track for the authenticated user
 */
router.delete("/:trackId/point/:pointId", async (req, res) => {
	const user = req.requestUser
	const trackId = req.params.trackId
	const pointId = req.params.pointId

	const track = await user.tracks.id(trackId)
	if (track === null)
		return res.status(404).json({
			success: false,
			msg: "A track could not be found with that ID for the given user",
		})

	// If we got this far, the Track exists

	const dataPointToDelete = track.data.dataPoints.id(pointId)

	if (dataPointToDelete === null) {
		console.log("NO DELETE")
		return res.status(404).json({
			success: false,
			msg: `Could not find a point with ID X in the Track with ID Y`,
		})
	} else {
		user.tracks.id(trackId).data.dataPoints.id(dataPointToDelete._id).remove()
		user.save()

		return res.json({ success: true, point: dataPointToDelete })
	}
})

module.exports = router
