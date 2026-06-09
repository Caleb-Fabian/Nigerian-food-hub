import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import menuRouter from "./menu";
import cartRouter from "./cart";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(menuRouter);
router.use(cartRouter);
router.use(ordersRouter);

export default router;
