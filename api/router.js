const express = require('express');
const router = express.Router();

const Actions = require('./controllers/Actions');

router.post('/new', Actions.new);
router.post('/join', Actions.join);
router.post('/do_step', Actions.doStep);

router.get('/list', Actions.list);
router.get('/state', Actions.state);


module.exports = router;