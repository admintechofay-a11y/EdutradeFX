import { Router } from 'express';
import { optionsController } from './options.controller';

const router = Router();

// Public: GET /api/options?group=REGULATOR,LANGUAGE,...
router.get('/', (req, res, next) => {
  optionsController.getOptions(req, res).catch(next);
});

export default router;
