const express= require('express');
const router = express.Router();

const {checkRoom} = require('../controllers/roomController');

router.get('/:code',  checkRoom);

module.exports = router;


