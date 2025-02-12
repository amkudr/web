const express = require('express');
const { getMovieLinks, getPublicMovieLinks, addLink, removeLink, editLink, rateLink, clickLink } = require('../controllers/linksController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/public/', getPublicMovieLinks);
router.get('/:imdbID', authMiddleware, getMovieLinks);
router.post('/', authMiddleware, addLink);
router.delete('/:linkID', authMiddleware, removeLink);
router.put('/:linkID', authMiddleware, editLink);
router.put('/rate/:linkID', authMiddleware, rateLink);
router.put('/click/:linkID', authMiddleware, clickLink);

module.exports = router;