const express = require("express");
const router = express.Router();

const questionController = require("../../controllers/questionController");

const {
  authenticate,
  authorize,
} = require("../../middleware/authMiddleware");

router.post(
  "/",
  authenticate,
  authorize("admin"),
  questionController.createQuestion
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  questionController.updateQuestion
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  questionController.deleteQuestion
);

module.exports = router;
