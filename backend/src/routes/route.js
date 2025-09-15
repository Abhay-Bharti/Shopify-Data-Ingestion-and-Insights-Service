import AuthRouter from "./auth.js";
import AnalyticsRouter from "./analytics.js";
import IngestRouter from "./ingest.js";
import SyncRouter from "./sync.js";
import WebhooksRouter from "./webhooks.js";
import { Router } from "express";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/analytics", AnalyticsRouter);
router.use("/ingest", IngestRouter);
router.use("/sync", SyncRouter);
router.use("/webhooks", WebhooksRouter);

export default router;