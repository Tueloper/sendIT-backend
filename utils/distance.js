const turf = require('@turf/turf');
// const getCord = require('turf-point');

//calculating distance between cordinates

const generateDistance = async (order) => {
	try {
		const location = turf.point(order.location_cordinates);
		const destination = turf.point(order.destination_cordinates);
		// return console.log(location, destination);
		const options = { units: 'kilometers' };

		const distance = await turf.distance(location, destination, options);
		order.travel_distance = distance;

		await order.save();
		return distance;
	} catch (error) {
		throw new Error('Distance is not available');
	}
};

module.exports = generateDistance;
