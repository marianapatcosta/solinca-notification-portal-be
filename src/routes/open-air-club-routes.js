const { Router } = require("express");
const checkAuthorization = require("../middleware/check-authorization");
const { fetchAvailableClasses, fetchClubs } = require("../controllers/open-air-club-controller");

const router = Router();
router.use(checkAuthorization);

router.get("/open-air-classes", fetchAvailableClasses);
router.get("/open-air-locations", fetchClubs);


module.exports = router;
