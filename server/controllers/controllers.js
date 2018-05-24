var express = require('express');
var router = express.Router();

var users = require('./users');

router.use(express.static('public'));
router.use(users);

router.get('/', async (req, res) => {
  res.status(200).send(`Hello from the API BikBox ${JSON.stringify(req.hostname)}`)
});


module.exports = router;
