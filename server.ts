import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { restaurantStore } from './server/storage';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS / headers for local development if needed
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // --- HEALTH CHECK ---
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'scan-and-dine', timestamp: new Date().toISOString() });
  });

  // --- SSE REAL-TIME EVENTS ---
  app.get('/api/events', (req: Request, res: Response) => {
    const restaurantId = req.query.restaurantId as string;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    restaurantStore.addSSEClient(clientId, res, restaurantId);

    // Initial keep-alive ping
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: Date.now() })}\n\n`);

    const intervalId = setInterval(() => {
      try {
        res.write(`: ping\n\n`);
      } catch (e) {
        clearInterval(intervalId);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(intervalId);
    });
  });

  // --- RESTAURANTS ---
  app.get('/api/restaurants', (req: Request, res: Response) => {
    res.json(restaurantStore.getAllRestaurants());
  });

  app.get('/api/restaurants/:slugOrId', (req: Request, res: Response) => {
    const param = req.params.slugOrId;
    let rest = restaurantStore.getRestaurantBySlug(param);
    if (!rest) {
      rest = restaurantStore.getRestaurantById(param);
    }
    if (!rest) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    res.json(rest);
  });

  app.post('/api/restaurants', (req: Request, res: Response) => {
    try {
      const rest = restaurantStore.createRestaurant(req.body);
      res.status(201).json(rest);
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to create restaurant' });
    }
  });

  app.put('/api/restaurants/:id', (req: Request, res: Response) => {
    const updated = restaurantStore.updateRestaurant(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    res.json(updated);
  });

  app.post('/api/restaurants/:id/toggle-suspend', (req: Request, res: Response) => {
    const updated = restaurantStore.toggleSuspendRestaurant(req.params.id);
    if (!updated) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }
    res.json(updated);
  });

  // --- CATEGORIES ---
  app.get('/api/restaurants/:id/categories', (req: Request, res: Response) => {
    res.json(restaurantStore.getCategories(req.params.id));
  });

  app.post('/api/restaurants/:id/categories', (req: Request, res: Response) => {
    const { name, hindiName } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }
    const cat = restaurantStore.createCategory(req.params.id, name, hindiName);
    res.status(201).json(cat);
  });

  app.put('/api/categories/:id', (req: Request, res: Response) => {
    const updated = restaurantStore.updateCategory(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    const ok = restaurantStore.deleteCategory(req.params.id);
    res.json({ success: ok });
  });

  // --- MENU ITEMS ---
  app.get('/api/restaurants/:id/menu', (req: Request, res: Response) => {
    res.json(restaurantStore.getMenuItems(req.params.id));
  });

  app.post('/api/restaurants/:id/menu', (req: Request, res: Response) => {
    try {
      const item = restaurantStore.createMenuItem(req.params.id, req.body);
      res.status(201).json(item);
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to create menu item' });
    }
  });

  app.put('/api/menu/:id', (req: Request, res: Response) => {
    const updated = restaurantStore.updateMenuItem(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/menu/:id', (req: Request, res: Response) => {
    const ok = restaurantStore.deleteMenuItem(req.params.id);
    res.json({ success: ok });
  });

  // --- TABLES ---
  app.get('/api/restaurants/:id/tables', (req: Request, res: Response) => {
    res.json(restaurantStore.getTables(req.params.id));
  });

  app.post('/api/restaurants/:id/tables', (req: Request, res: Response) => {
    const { tableNumber, capacity } = req.body;
    if (!tableNumber) {
      res.status(400).json({ error: 'Table number is required' });
      return;
    }
    const table = restaurantStore.createTable(req.params.id, String(tableNumber), Number(capacity) || 4);
    res.status(201).json(table);
  });

  app.put('/api/tables/:id', (req: Request, res: Response) => {
    const updated = restaurantStore.updateTable(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/tables/:id', (req: Request, res: Response) => {
    const ok = restaurantStore.deleteTable(req.params.id);
    res.json({ success: ok });
  });

  // --- ORDERS ---
  app.get('/api/restaurants/:id/orders', (req: Request, res: Response) => {
    res.json(restaurantStore.getOrders(req.params.id));
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = restaurantStore.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  });

  app.get('/api/restaurants/:id/tables/:tableNumber/orders', (req: Request, res: Response) => {
    res.json(restaurantStore.getOrdersByTable(req.params.id, req.params.tableNumber));
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const { restaurantId, tableNumber, items } = req.body;
    if (!restaurantId || !tableNumber || !items || !items.length) {
      res.status(400).json({ error: 'Missing required order fields (restaurantId, tableNumber, items)' });
      return;
    }
    const order = restaurantStore.createOrder(req.body);
    res.status(201).json(order);
  });

  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    const updated = restaurantStore.updateOrderStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(updated);
  });

  app.put('/api/orders/:id/payment', (req: Request, res: Response) => {
    const { paymentStatus, paymentMethod } = req.body;
    const updated = restaurantStore.updateOrderPayment(req.params.id, paymentStatus, paymentMethod);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/orders/:id', (req: Request, res: Response) => {
    const ok = restaurantStore.deleteOrder(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ success: true });
  });

  app.delete('/api/restaurants/:id/orders', (req: Request, res: Response) => {
    const ok = restaurantStore.clearAllOrders(req.params.id);
    res.json({ success: ok });
  });

  // --- WAITER REQUESTS ---
  app.get('/api/restaurants/:id/waiter-requests', (req: Request, res: Response) => {
    res.json(restaurantStore.getWaiterRequests(req.params.id));
  });

  app.delete('/api/restaurants/:id/waiter-requests', (req: Request, res: Response) => {
    const ok = restaurantStore.clearAllWaiterRequests(req.params.id);
    res.json({ success: ok });
  });

  app.post('/api/waiter-requests', (req: Request, res: Response) => {
    const { restaurantId, tableNumber, requestType, note } = req.body;
    if (!restaurantId || !tableNumber || !requestType) {
      res.status(400).json({ error: 'Missing required request fields' });
      return;
    }
    const reqItem = restaurantStore.createWaiterRequest(restaurantId, String(tableNumber), requestType, note);
    res.status(201).json(reqItem);
  });

  app.put('/api/waiter-requests/:id/resolve', (req: Request, res: Response) => {
    const resolved = restaurantStore.resolveWaiterRequest(req.params.id);
    if (!resolved) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    res.json(resolved);
  });

  // --- STAFF ---
  app.get('/api/restaurants/:id/staff', (req: Request, res: Response) => {
    res.json(restaurantStore.getStaff(req.params.id));
  });

  app.post('/api/restaurants/:id/staff', (req: Request, res: Response) => {
    const staff = restaurantStore.createStaff(req.params.id, req.body);
    res.status(201).json(staff);
  });

  app.put('/api/staff/:id', (req: Request, res: Response) => {
    const updated = restaurantStore.updateStaff(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/staff/:id', (req: Request, res: Response) => {
    const ok = restaurantStore.deleteStaff(req.params.id);
    res.json({ success: ok });
  });

  // --- SUBSCRIPTIONS ---
  app.get('/api/subscriptions', (req: Request, res: Response) => {
    res.json(restaurantStore.getSubscriptions());
  });

  app.put('/api/subscriptions/:id', (req: Request, res: Response) => {
    const updated = restaurantStore.updateSubscriptionPlan(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.json(updated);
  });

  // --- ANALYTICS & PLATFORM STATS ---
  app.get('/api/restaurants/:id/analytics', (req: Request, res: Response) => {
    res.json(restaurantStore.getAnalytics(req.params.id));
  });

  app.get('/api/platform/stats', (req: Request, res: Response) => {
    res.json(restaurantStore.getPlatformStats());
  });

  // --- VITE MIDDLEWARE (Development) or STATIC ASSETS (Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Scan & Dine server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
