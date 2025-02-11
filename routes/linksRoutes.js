const express = require('express');
const { getMovieLinks, addLink, removeLink, editLink } = require('../controllers/linksController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:imdbID', authMiddleware, getMovieLinks);
router.post('/', authMiddleware, addLink);
router.delete('/:linkId', authMiddleware, removeLink);
router.put('/:linkId', authMiddleware, editLink);
router.put('/rate/:linkId', authMiddleware, rateLink);
router.put('/click/:linkId', authMiddleware, clickLink);

module.exports = router;