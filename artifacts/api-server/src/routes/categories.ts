import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

router.get("/categories", async (_req: Request, res: Response) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(cats);
});

router.post("/categories", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { name, slug } = req.body;
  if (!name || !slug) {
    res.status(400).json({ error: "name and slug are required" });
    return;
  }
  const [cat] = await db.insert(categoriesTable).values({ name, slug }).returning();
  res.status(201).json(cat);
});

router.put("/categories/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, slug } = req.body;
  const [cat] = await db.update(categoriesTable).set({ name, slug }).where(eq(categoriesTable.id, id)).returning();
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(cat);
});

router.delete("/categories/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
