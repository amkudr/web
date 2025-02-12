const express = require('express');
const { isFavorite, addToFavorites, removeFromFavorites, getFavorites } = require('../controllers/favoritesController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/isFavorite', authMiddleware, isFavorite);
router.post('/', authMiddleware, addToFavorites);
router.delete('/', authMiddleware, removeFromFavorites);
router.get('/', authMiddleware, getFavorites); 

module.exports = router;
