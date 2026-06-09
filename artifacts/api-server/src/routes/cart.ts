import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, menuItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { Request, Response } from "express";
import type { JwtPayload } from "../middlewares/auth";

const router = Router();

function getUser(req: Request): JwtPayload {
  return (req as Request & { user: JwtPayload }).user;
}

router.get("/cart", requireAuth, async (req: Request, res: Response) => {
  const { userId } = getUser(req);
  const items = await db
    .select({
      id: cartItemsTable.id,
      menuItemId: cartItemsTable.menuItemId,
      quantity: cartItemsTable.quantity,
      name: menuItemsTable.name,
      price: menuItemsTable.price,
      imageUrl: menuItemsTable.imageUrl,
    })
    .from(cartItemsTable)
    .innerJoin(menuItemsTable, eq(cartItemsTable.menuItemId, menuItemsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  res.json(
    items.map((i) => ({
      id: i.id,
      menuItemId: i.menuItemId,
      name: i.name,
      price: parseFloat(i.price),
      imageUrl: i.imageUrl,
      quantity: i.quantity,
      subtotal: parseFloat(i.price) * i.quantity,
    }))
  );
});

router.post("/cart", requireAuth, async (req: Request, res: Response) => {
  const { userId } = getUser(req);
  const { menuItemId, quantity } = req.body;
  if (!menuItemId || !quantity) {
    res.status(400).json({ error: "menuItemId and quantity are required" });
    return;
  }

  const menuItem = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, menuItemId)).limit(1);
  if (!menuItem.length) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.menuItemId, menuItemId)))
    .limit(1);

  let cartItem;
  if (existing.length > 0) {
    const [updated] = await db
      .update(cartItemsTable)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItemsTable.id, existing[0].id))
      .returning();
    cartItem = updated;
  } else {
    const [created] = await db.insert(cartItemsTable).values({ userId, menuItemId, quantity }).returning();
    cartItem = created;
  }

  const mi = menuItem[0];
  res.status(201).json({
    id: cartItem.id,
    menuItemId: cartItem.menuItemId,
    name: mi.name,
    price: parseFloat(mi.price),
    imageUrl: mi.imageUrl,
    quantity: cartItem.quantity,
    subtotal: parseFloat(mi.price) * cartItem.quantity,
  });
});

router.put("/cart/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = getUser(req);
  const id = parseInt(req.params.id);
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400).json({ error: "quantity must be at least 1" });
    return;
  }

  const [cartItem] = await db
    .update(cartItemsTable)
    .set({ quantity })
    .where(and(eq(cartItemsTable.id, id), eq(cartItemsTable.userId, userId)))
    .returning();

  if (!cartItem) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  const [mi] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, cartItem.menuItemId)).limit(1);
  res.json({
    id: cartItem.id,
    menuItemId: cartItem.menuItemId,
    name: mi.name,
    price: parseFloat(mi.price),
    imageUrl: mi.imageUrl,
    quantity: cartItem.quantity,
    subtotal: parseFloat(mi.price) * cartItem.quantity,
  });
});

router.delete("/cart/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = getUser(req);
  const id = parseInt(req.params.id);
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, id), eq(cartItemsTable.userId, userId)));
  res.json({ message: "Removed" });
});

router.delete("/cart", requireAuth, async (req: Request, res: Response) => {
  const { userId } = getUser(req);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  res.json({ message: "Cart cleared" });
});

export default router;
