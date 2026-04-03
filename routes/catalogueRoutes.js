const express = require('express');
const router = express.Router();

const {
  createCatalogue,
  getAllCatalogues,
  updateCatalogue,
  deleteCatalogue
} = require('../controllers/courseController'); // Still using courseController for now for simplicity
const { protect, authorize } = require('../middleware/auth');

// All routes in this file are protected and for admins only
router.use(protect, authorize('admin'));

router.route('/')
  .post(createCatalogue)
  .get(getAllCatalogues);

router.route('/:id')
  .put(updateCatalogue)
  .delete(deleteCatalogue);

module.exports = router;