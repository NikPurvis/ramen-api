const mongoose = require('mongoose')

const ramenSchema = new mongoose.Schema(
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
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Ramen', ramenSchema)
