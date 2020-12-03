const { Router } = require("express");
const checkAuthorization = require("../middleware/check-authorization");
const { fetchAvailableClasses, fetchClubs } = require("../controllers/club-controller");

const router = Router();
router.use(checkAuthorization);

router.get("/classes", fetchAvailableClasses);
router.get("/locations", fetchClubs);


module.exports = router;
