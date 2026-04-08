const express = require('express');
const router = express.Router();
const { RoomType } = require('../models');

router.get('/', async (req, res) => {
  try {
    const types = await RoomType.findAll();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;