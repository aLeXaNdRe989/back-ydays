const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', photoController.getAllPhotos);
router.get('/:id', photoController.getPhotoById);
router.post('/', protect, photoController.createPhoto);
router.put('/:id', protect, photoController.updatePhoto);
router.delete('/:id', protect, photoController.deletePhoto);

module.exports = router;
