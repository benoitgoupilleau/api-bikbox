var express = require('express');
var router = express.Router();

var users = require('./users');

router.use(express.static('public'));
router.use(users);


module.exports = router;
