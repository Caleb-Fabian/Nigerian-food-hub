import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, menuItemsTable, usersTable } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import type { Request, Response } from "express";
import type { JwtPayload } from "../middlewares/auth";

const router = Router();

function getUser(req: Request): JwtPayload {
  return (req as Request & { user: JwtPayload }).user;
}

async function formatOrder(order: typeof ordersTable.$inferSelect & { userName?: string | null }) {
  const items = await db
    .select({
      id: orderItemsTable.id,
      menuItemId: orderItemsTable.menuItemId,
      name: orderItemsTable.name,
      price: orderItemsTable.price,
      quantity: orderItemsTable.quantity,
    })
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  return {
    id: order.id,
    userId: order.userId,
    userName: order.userName || null,
    status: order.status,
    total: parseFloat(order.total),
    deliveryAddress: order.deliveryAddress,
    note: order.note,
    createdAt: order.createdAt.toISOString(),
    items: items.map((i) => ({
      id: i.id,
      menuItemId: i.menuItemId,
      name: i.name,
      price: parseFloat(i.price),
      quantity: i.quantity,
      subtotal: parseFloat(i.price) * i.quantity,
    })),
  };
}

router.post("/orders", requireAuth, async (req: Request, res: Response) => {
  const { userId } = getUser(req);
  const { deliveryAddress, note } = req.body;

  if (!deliveryAddress) {
    res.status(400).json({ error: "deliveryAddress is required" });
    return;
  }

  const cartItems = await db
    .select({
      id: cartItemsTable.id,
      menuItemId: cartItemsTable.menuItemId,
      quantity: cartItemsTable.quantity,
      name: menuItemsTable.name,
      price: menuItemsTable.price,
    })
    .from(cartItemsTable)
    .innerJoin(menuItemsTable, eq(cartItemsTable.menuItemId, menuItemsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  if (!cartItems.length) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      userId,
      status: "pending",
      total: String(total),
      deliveryAddress,
      note: note || null,
    })
    .returning();

  await db.insert(orderItemsTable).values(
    cartItems.map((item) => ({
      orderId: order.id,
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))
  );

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  res.status(201).json(await formatOrder(order));
});

router.get("/orders", requireAuth, async (req: Request, res: Response) => {
  const { userId } = getUser(req);
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(sql`${ordersTable.createdAt} DESC`);

  const formatted = await Promise.all(orders.map(formatOrder));
  res.json(formatted);
});

router.get("/orders/all", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const orders = await db
    .select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      userName: usersTable.name,
      status: ordersTable.status,
      total: ordersTable.total,
      deliveryAddress: ordersTable.deliveryAddress,
      note: ordersTable.note,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .orderBy(sql`${ordersTable.createdAt} DESC`);

  const formatted = await Promise.all(orders.map(formatOrder));
  res.json(formatted);
});

router.get("/admin/stats", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const allOrders = await db.select().from(ordersTable);
  const menuCount = await db.select({ count: sql<number>`count(*)` }).from(menuItemsTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((s, o) => s + parseFloat(o.total), 0);
  const pendingOrders = allOrders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing").length;
  const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= today).length;
  const todayRevenue = allOrders.filter((o) => new Date(o.createdAt) >= today).reduce((s, o) => s + parseFloat(o.total), 0);

  res.json({
    totalOrders,
    totalRevenue,
    pendingOrders,
    totalMenuItems: Number(menuCount[0].count),
    todayOrders,
    todayRevenue,
  });
});

router.get("/orders/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId, role } = getUser(req);
  const id = parseInt(req.params.id);

  const [order] = await db
    .select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      userName: usersTable.name,
      status: ordersTable.status,
      total: ordersTable.total,
      deliveryAddress: ordersTable.deliveryAddress,
      note: ordersTable.note,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .where(eq(ordersTable.id, id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.userId !== userId && role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(await formatOrder(order));
});

router.put("/orders/:id/status", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(await formatOrder(order));
});

export default router;
