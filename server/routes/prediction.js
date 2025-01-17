const express = require("express");
const { getDetections } = require("../controller/prediction");
const router = express.Router();

router.get("/detection", getDetections);

module.exports = router;
