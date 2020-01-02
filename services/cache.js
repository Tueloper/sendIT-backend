const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const chalk = require('chalk');

//get redis url
const client = redis.createClient(process.env.REDIS_URL);
client.hget = util.promisify(client.hget);

//getting the default query setup of mongoose
const exec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.cache = function(options = {}) {
	this.engagaeCache = true;

	//setting the values as a anested object
	this.nestKey = JSON.stringify(options.key || '');

	return this;
};

//creating a query condition for all query
mongoose.Query.prototype.exec = async function() {
	if (!this.engagaeCache) return exec.apply(this, arguments);

	//conbining both keys of the collection and the query
	const key = JSON.stringify(
		Object.assign({}, this.getQuery(), {
			collection: this.mongooseCollection.name
		})
	);

	const cacheValue = await client.hget(this.nestKey, key);

	//itf there is a cache value
	if (cacheValue) {
		console.log(chalk.yellow.inverse('Caching Values'));

		//changing the data in the model document, model works with an object
		const doc = JSON.parse(cacheValue);

		//check if its an object or an array
		return Array.isArray(doc) ? doc.map((d) => new this.model(d)) : new this.model(doc);
	}

	//otherwise issue the query and the store a copy in redis
	const result = await exec.apply(this, arguments);
	client.hmset(this.nestKey, key, JSON.stringify(result), 'EX', '10');
	return result;
};

//creating a fnction that automatically clears the cache using user id
module.exports = {
	clearNest(nestKey) {
		client.del(JSON.stringify(nestKey));
	},
	client
};
