const mongoose = require("mongoose")

const TrackSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			min: 1,
			max: 256,
		},
		type: {
			type: String,
			required: true,
			default: "weight",
		},
		data: {
			dataPoints: [
				{
					value: { type: Number },
					timestamp: { type: Date, default: Date.now },
				},
			],
			metric: {
				type: String,
				required: true,
				default: "g",
			},
			increaseOrDecrease: {
				type: String,
				required: true,
				default: "decrease",
			},
			target: {
				type: Number,
				required: false,
			},
		},
	},
	{ timestamps: true }
)

const UserSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			min: 1,
			max: 255,
		},
		email: {
			type: String,
			required: true,
			max: 255,
		},
		sex: {
			type: String,
			required: true,
			lowercase: true,
			min: 1,
			max: 1,
		},
		password: {
			type: String,
			required: true,
			min: 6,
			max: 1024,
		},
		tracks: [TrackSchema],
	},
	{ timestamps: true }
)

module.exports = mongoose.model("User", UserSchema)
