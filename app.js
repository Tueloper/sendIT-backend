const app = require('./index');
const chalk = require('chalk');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
	console.log(chalk.cyan.italic(`Server Started At ${PORT}`));
});
