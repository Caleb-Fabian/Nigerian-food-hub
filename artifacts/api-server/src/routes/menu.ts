import { Router } from "express";
import { db } from "@workspace/db";
import { menuItemsTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike, isNull } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();

router.get("/menu", async (req: Request, res: Response) => {
  const categoryId = req.query.category ? parseInt(req.query.category as string) : undefined;
  const search = req.query.search as string | undefined;

  let rows = await db
    .select({
      id: menuItemsTable.id,
      categoryId: menuItemsTable.categoryId,
      categoryName: categoriesTable.name,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      imageUrl: menuItemsTable.imageUrl,
      available: menuItemsTable.available,
      createdAt: menuItemsTable.createdAt,
    })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .orderBy(menuItemsTable.createdAt);

  if (categoryId) {
    rows = rows.filter((r) => r.categoryId === categoryId);
  }
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter((r) => r.name.toLowerCase().includes(s));
  }

  res.json(
    rows.map((r) => ({
      ...r,
      price: parseFloat(r.price),
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/menu", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { categoryId, name, description, price, imageUrl, available } = req.body;
  if (!name || price === undefined) {
    res.status(400).json({ error: "name and price are required" });
    return;
  }
  const [item] = await db
    .insert(menuItemsTable)
    .values({
      categoryId: categoryId || null,
      name,
      description: description || null,
      price: String(price),
      imageUrl: imageUrl || null,
      available: available !== false,
    })
    .returning();

  const [withCat] = await db
    .select({ id: menuItemsTable.id, categoryId: menuItemsTable.categoryId, categoryName: categoriesTable.name, name: menuItemsTable.name, description: menuItemsTable.description, price: menuItemsTable.price, imageUrl: menuItemsTable.imageUrl, available: menuItemsTable.available, createdAt: menuItemsTable.createdAt })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .where(eq(menuItemsTable.id, item.id));

  res.status(201).json({ ...withCat, price: parseFloat(withCat.price), createdAt: withCat.createdAt.toISOString() });
});

router.get("/menu/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const [item] = await db
    .select({ id: menuItemsTable.id, categoryId: menuItemsTable.categoryId, categoryName: categoriesTable.name, name: menuItemsTable.name, description: menuItemsTable.description, price: menuItemsTable.price, imageUrl: menuItemsTable.imageUrl, available: menuItemsTable.available, createdAt: menuItemsTable.createdAt })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .where(eq(menuItemsTable.id, id));

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json({ ...item, price: parseFloat(item.price), createdAt: item.createdAt.toISOString() });
});

router.put("/menu/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { categoryId, name, description, price, imageUrl, available } = req.body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = String(price);
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (available !== undefined) updates.available = available;
  if (categoryId !== undefined) updates.categoryId = categoryId;

  await db.update(menuItemsTable).set(updates).where(eq(menuItemsTable.id, id));

  const [item] = await db
    .select({ id: menuItemsTable.id, categoryId: menuItemsTable.categoryId, categoryName: categoriesTable.name, name: menuItemsTable.name, description: menuItemsTable.description, price: menuItemsTable.price, imageUrl: menuItemsTable.imageUrl, available: menuItemsTable.available, createdAt: menuItemsTable.createdAt })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .where(eq(menuItemsTable.id, id));

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json({ ...item, price: parseFloat(item.price), createdAt: item.createdAt.toISOString() });
});

router.delete("/menu/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
