const User = require('./../models/user');
const generateAuthToken = require('./../utils/generateToken');
const { hash, compareHash } = require('./../utils/hash');
const { cloudinaryImage, destroyCloudinaryImage } = require('./../services/Cloudinary');

module.exports = {
	async CreateUser(request, response) {
		const { password, passwordConfirm, full_name, email, phone, address, role } = request.body;

		try {
			const userCheck = await User.findOne({ email });
			if (userCheck) {
				throw new Error("message: 'This email is already taken'");
			}
			// if (password != passwordConfirm) {
			// 	return response.status(401).send({ message: 'Password is not correctly alligned' });
			// }
			const user = new User({
				full_name: full_name,
				email: email,
				password: password,
				phone: phone,
				address: address,
				role: role || 'user'
			});
			const token = await generateAuthToken(user);
			await hash(user);

			await user.save();
			response.header('x-auth-token', token).status(201).send({ message: 'Success', user });
		} catch (e) {
			response.status(500).send(e.message);
		}
	},

	async loginUser(request, response) {
		try {
			const { email, password } = request.body;

			const user = await User.findOne({ email });

			if (!user) {
				throw new Error('You are not Authorised');
			}

			const passwordMatch = await compareHash(password, user.password);
			// return console.log(passwordMatch)

			if (!passwordMatch) {
				throw new Error('Invalid Password');
			}
			const token = await generateAuthToken(user);

			response.header('x-auth-token', token).status(201).send({ token });
		} catch (e) {
			response.status(500).send(e.message);
		}
	},

	async getUser(request, response) {
		response.send(request.user);
	},

	async userLogout(request, response) {
		// return console.log(userProfile)
		try {
			const userProfile = request.user;
			userProfile.tokens = [];
			await userProfile.save();
			return response.status(200).send({});
		} catch (e) {
			response.status(400).send(e.message);
		}
	},

	async uploadImage(request, response) {
		try {
			const updatedUser = request.user;
			// return console.log(updatedUser);
			if (!updatedUser) {
				return response.status(404).send('User Not Found');
			} else if (updatedUser.image_url) {
				// return console.log(true);
				const imageUrl = await destroyCloudinaryImage(request.file, updatedUser.image_public_id);

				updatedUser.image_url = imageUrl.secure_url;
				updatedUser.image_public_id = imageUrl.public_id;

				await updatedUser.save();
				response.status(201).send({ updatedUser });
			} else {
				const imageUrl = await cloudinaryImage(request.file);

				updatedUser.image_url = imageUrl.secure_url;
				updatedUser.image_public_id = imageUrl.public_id;

				await updatedUser.save();
				response.status(201).send({ updatedUser });
			}
		} catch (err) {
			response.status(400).send(err);
		}
	},

	async updatedUser(request, response) {
		//setting up validation for the keys to be updated
		const updates = Object.keys(request.body);
		const allowable = [ 'full_name', 'phone', 'address', 'email' ];
		const isValid = updates.every((update) => allowable.includes(update));

		//Prompt invalid order inputs
		if (!isValid) {
			return response.status(404).send(' Error: Invalid Order Input ');
		}
		//Send valid data for update
		try {
			const updatedUser = request.user;
			if (!updatedUser) {
				return response.status(404).send('User not Found');
			}

			updates.forEach((update) => (updatedUser[update] = request.body[update]));

			await updatedUser.save();

			return response.status(201).send({
				Message: 'Update Successful',
				updatedUser
			});
		} catch (e) {
			console.log(e);
		}
	}
};
