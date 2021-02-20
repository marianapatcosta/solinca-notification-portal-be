const { Router } = require("express");
const { check } = require("express-validator");
const checkAuthorization = require("../middleware/check-authorization");
const {
  signup,
  signin,
  getUserData,
  updateUserData,
  resetPassword,
  restorePassword,
} = require("../controllers/user-controller");

const router = Router();

// implemented for a cron job to keep heroku's dyno awake
router.get("/", (req, res, next) => res.send("Hello User!!"));

/**
 * @swagger
 * /api/v1/
 */
router.post(
  "/signup",
  [
    check("username").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("solincaAuth").not().isEmpty(),
    check("password").isLength({ min: 8 }),
    check("phoneNumber").optional().not().isEmpty(),
  ],
  signup
);

/**
 * @swagger
 * /api/v1/user/signin:
 *   post:
 *     summary: User login
 *     description: This API authenticates the user according to the username and password
 *     requestBody:
 *       required: true
 *       description: login body
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username
 *                   example: janedoe
 *                 password:
 *                   type: string
 *                   description: The user's password.
 *                   example: admin1234
 *     responses:
 *       200:
 *         description: An object containing user information and auth token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username
 *                   example: janedoe
 *                 userId:
 *                   type: string
 *                   description: The user's ID
 *                   example: 5354bj646665
 *                 token:
 *                   type: string
 *                   description: The user's authorization token
 *                   example: ewrewte9tegfewytreyrurt98ryrutyiyrootp
 */
router.post(
  "/signin",
  [check("username").not().isEmpty(), check("password").isLength({ min: 8 })],
  signin
);

router.post(
  "/reset-password",
  [check("email").normalizeEmail().isEmail()],
  resetPassword
);
router.post(
  "/restore-password",
  [
    check("resetPasswordToken").not().isEmpty(),
    check("password").isLength({ min: 8 }),
  ],
  restorePassword
);

router.use(checkAuthorization);
router.patch(
  "/:id",
  [
    check("email").optional().normalizeEmail().isEmail(),
    check("solincaAuth").optional().not().isEmpty(),
    check("password").optional().isLength({ min: 8 }),
    check("phoneNumber").optional().not().isEmpty(),
  ],
  updateUserData
);
router.get("/:id", getUserData);

module.exports = router;
