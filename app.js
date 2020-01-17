const app = require('./index');
const chalk = require('chalk');

const PORT = parseInt(process.env.PORT, '0.0.0.0') || 5001;

app.listen(PORT, () => {
	console.log(chalk.cyan.italic(`Server Started At ${PORT}`));
});
