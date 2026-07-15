const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { validateRequest, userSchema, userUpdateSchema } = require('../middleware/validation');

router.post('/', validateRequest(userSchema), UserController.createUser);
router.get('/:id', UserController.getUser);
router.put('/:id', validateRequest(userUpdateSchema), UserController.updateUser);
router.delete('/:id', UserController.deleteUser);
router.get('/:id/enriched', UserController.getEnrichedUser);

module.exports = router;
