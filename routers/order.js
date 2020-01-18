const { Router } = require('express');
const Auth = require('./../middleware/Auth');
const { isUser, isAdmin } = require('./../middleware/isAdmin');
const clearNest = require('./../middleware/clearCache');
const {
	CreateOrder,
	getOneOrder,
	getUserOrders,
	updateOrder,
	deleteOrder,
	getAllOrder,
	notifyProcessing,
	notifyDelivered
} = require('../controllers/order');

const router = Router();

router.post('/create/order', [ Auth, isUser, clearNest ], CreateOrder);

router.get('/getUser/Orders', [ Auth, isUser ], getUserOrders);

router.get('/getSingle/order/:id', [ Auth, isUser ], getOneOrder);

router.get('/getAll/orders', [ Auth, isAdmin, clearNest ], getAllOrder);

router.patch('/update/order/:id', [ Auth, isUser, clearNest ], updateOrder);

router.delete('/delete/order/:id', [ Auth, isUser, clearNest ], deleteOrder);

router.patch('/processing/order/:id', [ Auth, isAdmin, clearNest ], notifyProcessing);

router.patch('/delivered/order/:id', [ Auth, isUser, clearNest ], notifyDelivered);

module.exports = router;
