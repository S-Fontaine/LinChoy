import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.json({ message: "Boilerplate Express 5 + TypeScript opérationnelle ! 🚀" });
});

export default router;