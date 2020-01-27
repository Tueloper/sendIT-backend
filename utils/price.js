const generatePrice = async (order) => {
	//convert km to m
	const meterDistance = parseFloat(order.travel_distance);

	//calculate price with weight
	const priceValue = Math.floor(meterDistance * order.weight * 50);

	const price = '₦' + priceValue;

	order.price = price;
	await order.save();
	return price;
};

module.exports = generatePrice;
