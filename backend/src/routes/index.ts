import express, { Request, Response } from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req: Request, res: Response) => {
  res.json({ message: "Boilerplate Express 5 + TypeScript opérationnelle ! 🚀" });
});

export default router;