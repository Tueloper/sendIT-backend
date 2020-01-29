const Order = require('../models/order');
const {
	sendOrderNotification,
	sendProcessingNotification,
	sendDeliveredNotification,
	sendUserOrderNotification,
	orderComplete
} = require('./../services/EmailSender');

module.exports = {
	//simple testing router
	async CreateOrder(request, response) {
		const user = request.user;
		//adding the ownerId id to help know who created the id
		const order = new Order({
			...request.body,
			ownerId: user._id,
			status: 'Pending'
		});

		try {
			const NewOrder = await order.save();

			response.status(201).send({ NewOrder });
		} catch (err) {
			response.status(400).send(err);
		}
	},

	async updateOrder(request, response) {
		//setting up validation for the keys to be updated
		const updates = Object.keys(request.body);
		const allowableOrder = [
			'parcel_name',
			'weight',
			'destination_address',
			'destination_state',
			'status',
			'recipient_phone_number',
			'recipient_name',
			'recipient_email',
			'price'
		];
		const isValidOrder = updates.every((update) => allowableOrder.includes(update));

		//Prompt invalid order inputs
		if (!isValidOrder) {
			return response.status(404).send(' Error: Invalid Order Input ');
		}

		const _id = request.params.id;

		//Send valid data for update
		try {
			const user = request.user;
			const updatedOrder = await Order.findOne({ _id, ownerId: user._id });
			if (!updatedOrder) {
				return response.status(404).send('Order not Found');
			}

			updates.forEach((update) => (updatedOrder[update] = request.body[update]));

			await updatedOrder.save();

			return response.status(200).send({
				Message: 'Update Successful',
				updatedOrder
			});
		} catch (e) {
			console.log(e);
		}
	},

	async getAllOrder(request, response) {
		try {
			const orders = await Order.find({}).cache({ key: request.user._id });
			response.status(200).send({ message: 'Success', orders });
		} catch (error) {
			throw response.status(500).send(err.message);
		}
	},

	async getUserOrders(request, response) {
		// const match = {};
		// const sort = {};

		// if (request.query.completed) {
		// 	match.completed = request.query.completed === 'true';
		// }

		// if (request.query.sortBy) {
		// 	//accessing the string query to make your sorting process
		// 	const pathSort = request.query.sortBy.split(':');
		// 	sort[pathSort[0]] = pathSort[1] === 'desc' ? -1 : 1;
		// }

		try {
			const user = request.user;
			// return console.log(user.id);
			// const tasks = await Order.find({ ownerId: userProfile._id })
			// await user
			// 	.populate({
			// 		path: 'orders',
			// 		match
			// 	})
			// 	.execPopulate();

			// response.send(user.orders);

			const orders = await Order.find({ ownerId: user._id }).cache({ key: user._id });
			// console.log('Serving from mongodb')
			response.send(orders);
		} catch (e) {
			response.status(400).send(e);
		}
	},

	async deleteOrder(request, response) {
		const _id = request.params.id;

		try {
			const user = request.user;
			const deletedOrder = await Order.findByIdAndDelete({ _id, ownerId: user._id });

			if (!deletedOrder) {
				return response.status(404).send();
			}

			response.send(deletedOrder);
		} catch (e) {
			response.status(500).send(e);
		}
	},

	//This is used to read Order by id
	async getOneOrder(request, response) {
		try {
			const user = request.user;
			const _id = request.params.id;
			// const taskId = await Order.findById(_id);

			const order = await Order.findOne({ _id, ownerId: user._id });

			if (!order) {
				return response.status(404).send('Error: Message Not Found');
			}

			response.status(200).send({
				Message: 'The Order is Gotten successfully',
				order
			});
		} catch (e) {
			response.status(500).send(e);
		}
	},

	async notifyProcessing(request, response) {
		const user = request.user;
		try {
			const { role } = user;
			if (role != 'admin') return response.status(401).send('You cannot perform this function');

			const _id = request.params.id;
			const order = await Order.findOne({ _id });

			order.status = 'Processing';
			await order.save();

			response.status(200).send({ message: 'The Order is in Process', status: order.status });
			//sending email to user that the order is ongoing
			sendProcessingNotification(user.email, _id);
		} catch (error) {
			response.status(500).send(error.message);
		}
	},

	async notifyDelivered(request, response) {
		const user = request.user;
		try {
			const { role } = user;
			if (role != 'user') return response.status(401).send('You cannot perform this function');

			const _id = request.params.id;
			const order = await Order.findOne({ _id });

			order.status = 'Delivered';
			await order.save();

			response.status(200).send({ message: 'The Order is Delivered', status: order.status });

			//sending email to user that the order is ongoing
			sendDeliveredNotification(user.email, _id, user.full_name);

			//thanking the user
			orderComplete(_id, user.full_name);
		} catch (error) {
			response.status(500).send(error.message);
		}
	},

	async confirmPayment(request, response) {
		const user = request.user;
		try {
			const _id = request.body.id;
			const price = request.body.price;
			const order = await Order.findOne({ _id });

			order.price = price;
			await order.save();

			response.status(201).send(order);
			//send an email to the user
			sendUserOrderNotification(user, order);

			//send an email to the admin for the order
			sendOrderNotification(user, order);
		} catch (error) {
			response.status(500).send(error.message);
		}
	}
};
