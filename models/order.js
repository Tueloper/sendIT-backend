const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
	{
		sender_name: {
			type: String,
			trim: true
		},

		recipient_name: {
			type: String,
			trim: true
		},

		recipient_email: {
			type: String,
			trim: true
		},

		parcel_name: {
			type: String,
			trim: true
		},

		weight: {
			type: String,
			trim: true
		},

		location_address: {
			type: String,
			trim: true
		},

		location_state: {
			type: String,
			trim: true
		},

		location_cordinates: {
			type: Array,
			required: true,
			trim: true
		},

		destination_address: {
			type: String,
			trim: true
		},

		destination_state: {
			type: String,
			trim: true
		},

		destination_cordinates: {
			type: Array,
			required: true,
			trim: true
		},

		travel_distance: {
			type: String
		},

		sender_phone_number: {
			type: Number,
			trim: true
		},

		recipient_phone_number: {
			type: Number,
			trim: true
		},

		price: {
			type: String,
			trim: true
		},

		status: {
			type: String
		},

		ownerId: {
			type: mongoose.Schema.Types.ObjectId,
			trim: true,
			required: true,
			ref: 'user'
		}
	},
	{
		timestamps: true
	}
);

const Order = mongoose.model('orderTable', orderSchema);
module.exports = Order;
