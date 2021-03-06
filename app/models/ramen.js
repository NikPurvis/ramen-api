const mongoose = require("mongoose")

const { Schema, model } = mongoose

const ramenSchema = new Schema(
	{
		flavor: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		sodium: {
			type: Number,
			required: true,
		},
		haveTried: {
			type: Boolean,
			required: true,
		},
		imageMain: {
			type: String,
			required: false,
		},
		imageDetail: {
			type: String,
			required: false,
		},
        owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	}
)

module.exports = model("Ramen", ramenSchema)
