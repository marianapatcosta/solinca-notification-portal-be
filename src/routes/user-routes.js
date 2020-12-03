const { Router } = require("express");
const { check } = require("express-validator");
const checkAuthorization = require("../middleware/check-authorization");
const {
  signup,
  signin,
  getUserData,
  updateUserData,
  resetPassword,
  restorePassword
} = require("../controllers/user-controller");

const router = Router();

router.post(
  "/signup",
  [
    check("username").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("solincaAuth").not().isEmpty(),
    check("password").isLength({ min: 8 }),
    check('phoneNumber').optional().not().isEmpty()
  ],
  signup
);

router.post(
  "/signin",
  [check("username").not().isEmpty(), check("password").isLength({ min: 8 })],
  signin
);

router.post("/reset-password", [check("email").normalizeEmail().isEmail()], resetPassword);
router.post("/restore-password", [check("resetPasswordToken").not().isEmpty(), check("password").isLength({ min: 8 })], restorePassword);

router.use(checkAuthorization);
router.patch("/:id", [
  check("email").optional().normalizeEmail().isEmail(),
  check("solincaAuth").optional().not().isEmpty(),
  check("password").optional().isLength({ min: 8 }),
  check('phoneNumber').optional().not().isEmpty()
], updateUserData);
router.get("/:id", getUserData);


module.exports = router;
