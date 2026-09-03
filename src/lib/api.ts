import {
  Category,
  MenuItem,
  Order,
  OrderStatus,
  PaymentStatus,
  PlatformStats,
  Restaurant,
  RestaurantAnalytics,
  StaffMember,
  SubscriptionPlan,
  TableInfo,
  WaiterRequest
} from '../types';
import { localStore } from './localStore';
import { cloudSync } from './cloudSync';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_RESTAURANTS,
  INITIAL_TABLES
} from '../data/initialData';

export const API_BASE = '/api';

// Simple Web Audio sound synthesizer for instant crisp notification chimes
export function playNotificationChime(type: 'order' | 'waiter' | 'success' | 'alert' = 'order') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'order') {
      // Pleasant dual chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } else if (type === 'waiter') {
      // High ding-dong
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(783.99, now + 0.18); // G5

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'success') {
      // Success fanfare chord
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.2, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.4);
      });
    }
  } catch (e) {
    console.debug('Audio chime disabled or unavailable', e);
  }
}

// Helper to safely execute fetch with fallback to local storage
async function safeFetch<T>(fetchFn: () => Promise<Response>, fallbackFn: () => T): Promise<T> {
  try {
    const res = await fetchFn();
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    // network failure / static hosting environment (Netlify/Vercel)
  }
  return fallbackFn();
}

// REST API CLIENT WITH ZERO-CONFIG OFFLINE & NETLIFY STATIC FALLBACK
export const api = {
  // Restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    const list = await safeFetch(
      () => fetch(`${API_BASE}/restaurants`),
      () => localStore.getAllRestaurants()
    );
    if (!list || list.length === 0) {
      return [...INITIAL_RESTAURANTS];
    }
    return list;
  },

  async getRestaurant(slugOrId: string = 'raj-cabin'): Promise<Restaurant> {
    // Priority 1: Pull authoritative restaurant profile from Firestore cloud
    try {
      const cloudRest = await cloudSync.pullCloudRestaurant('rest_raj_001');
      if (cloudRest && cloudRest.name) {
        localStore.updateRestaurant(cloudRest.id, cloudRest);
        return cloudRest;
      }
    } catch (e) {
      // fallback
    }

    return safeFetch(
      () => fetch(`${API_BASE}/restaurants/${encodeURIComponent(slugOrId)}`),
      () => {
        const r = localStore.getRestaurantBySlug(slugOrId) || localStore.getRestaurantById(slugOrId);
        if (!r) {
          // fallback to first restaurant
          const all = localStore.getAllRestaurants();
          return (all && all.length > 0) ? all[0] : INITIAL_RESTAURANTS[0];
        }
        return r;
      }
    );
  },

  async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
    const created = await safeFetch(
      () => fetch(`${API_BASE}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      () => localStore.createRestaurant(data)
    );
    if (created) {
      await cloudSync.syncRestaurantToCloud(created);
    }
    return created;
  },

  async updateRestaurant(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
    const updated = await safeFetch(
      () => fetch(`${API_BASE}/restaurants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      () => {
        const u = localStore.updateRestaurant(id, data);
        return u || (localStore.getAllRestaurants()[0]);
      }
    );
    if (updated) {
      await cloudSync.syncRestaurantToCloud(updated);
    }
    return updated;
  },

  async toggleSuspendRestaurant(id: string): Promise<Restaurant> {
    return safeFetch(
      () => fetch(`${API_BASE}/restaurants/${id}/toggle-suspend`, { method: 'POST' }),
      () => {
        const u = localStore.toggleSuspendRestaurant(id);
        return u || (localStore.getAllRestaurants()[0]);
      }
    );
  },

  // Categories
  async getCategories(restaurantId: string): Promise<Category[]> {
    try {
      const cloudCats = await cloudSync.pullCloudCategories(restaurantId);
      if (cloudCats && cloudCats.length > 0) {
        localStore.setAllCategories(cloudCats);
        return cloudCats;
      }
    } catch (e) {
      // fallback
    }

    const list = await safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/categories`),
      () => localStore.getCategories(restaurantId)
    );
    if (!list || list.length === 0) {
      return [...INITIAL_CATEGORIES];
    }
    return list;
  },

  async createCategory(restaurantId: string, name: string, hindiName?: string): Promise<Category> {
    const created = await safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hindiName })
      }),
      () => localStore.createCategory(restaurantId, name, hindiName)
    );
    if (created) {
      await cloudSync.syncCategoryToCloud(created);
    }
    return created;
  },

  async updateCategory(catId: string, data: Partial<Category>): Promise<Category> {
    const updated = await safeFetch(
      () => fetch(`${API_BASE}/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      () => {
        const c = localStore.updateCategory(catId, data);
        if (!c) throw new Error('Category not found');
        return c;
      }
    );
    if (updated) {
      await cloudSync.syncCategoryToCloud(updated);
    }
    return updated;
  },

  async deleteCategory(catId: string): Promise<boolean> {
    const ok = await safeFetch(
      async () => {
        const res = await fetch(`${API_BASE}/categories/${catId}`, { method: 'DELETE' });
        return res.ok ? new Response(JSON.stringify(true), { headers: { 'content-type': 'application/json' } }) : res;
      },
      () => localStore.deleteCategory(catId)
    );
    if (ok) {
      await cloudSync.deleteCategoryFromCloud(catId);
    }
    return ok;
  },

  // Menu Items
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      const cloudItems = await cloudSync.pullCloudMenuItems(restaurantId);
      if (cloudItems && cloudItems.length > 0) {
        localStore.setAllMenuItems(cloudItems);
        return cloudItems;
      }
    } catch (e) {
      // fallback
    }

    const list = await safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/menu`),
      () => localStore.getMenuItems(restaurantId)
    );
    if (!list || list.length === 0) {
      return [...INITIAL_MENU_ITEMS];
    }
    return list;
  },

  async createMenuItem(restaurantId: string, itemData: Partial<MenuItem>): Promise<MenuItem> {
    const created = await safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      }),
      () => localStore.createMenuItem(restaurantId, itemData)
    );
    if (created) {
      await cloudSync.syncMenuItemToCloud(created);
    }
    return created;
  },

  async updateMenuItem(itemId: string, itemData: Partial<MenuItem>): Promise<MenuItem> {
    const updated = await safeFetch(
      () => fetch(`${API_BASE}/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      }),
      () => {
        const m = localStore.updateMenuItem(itemId, itemData);
        if (!m) throw new Error('Menu item not found');
        return m;
      }
    );
    if (updated) {
      await cloudSync.syncMenuItemToCloud(updated);
    }
    return updated;
  },

  async deleteMenuItem(itemId: string): Promise<boolean> {
    const ok = await safeFetch(
      async () => {
        const res = await fetch(`${API_BASE}/menu/${itemId}`, { method: 'DELETE' });
        return res.ok ? new Response(JSON.stringify(true), { headers: { 'content-type': 'application/json' } }) : res;
      },
      () => localStore.deleteMenuItem(itemId)
    );
    if (ok) {
      await cloudSync.deleteMenuItemFromCloud(itemId);
    }
    return ok;
  },

  // Tables
  async getTables(restaurantId: string): Promise<TableInfo[]> {
    try {
      const cloudTables = await cloudSync.pullCloudTables(restaurantId);
      if (cloudTables && cloudTables.length > 0) {
        localStore.setAllTables(cloudTables);
        return cloudTables;
      }
    } catch (e) {
      // fallback
    }

    const list = await safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/tables`),
      () => localStore.getTables(restaurantId)
    );
    if (!list || list.length === 0) {
      return [...INITIAL_TABLES];
    }
    return list;
  },

  async createTable(restaurantId: string, tableNumber: string, capacity: number = 4): Promise<TableInfo> {
    const created = await safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber, capacity })
      }),
      () => localStore.createTable(restaurantId, tableNumber, capacity)
    );
    if (created) {
      await cloudSync.syncTableToCloud(created);
    }
    return created;
  },

  async updateTable(tableId: string, data: Partial<TableInfo>): Promise<TableInfo> {
    const updated = await safeFetch(
      () => fetch(`${API_BASE}/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      () => {
        const t = localStore.updateTable(tableId, data);
        if (!t) throw new Error('Table not found');
        return t;
      }
    );
    if (updated) {
      await cloudSync.syncTableToCloud(updated);
    }
    return updated;
  },

  async deleteTable(tableId: string): Promise<boolean> {
    const ok = await safeFetch(
      async () => {
        const res = await fetch(`${API_BASE}/tables/${tableId}`, { method: 'DELETE' });
        return res.ok ? new Response(JSON.stringify(true), { headers: { 'content-type': 'application/json' } }) : res;
      },
      () => localStore.deleteTable(tableId)
    );
    if (ok) {
      await cloudSync.deleteTableFromCloud(tableId);
    }
    return ok;
  },

  // Orders
  async getOrders(restaurantId: string): Promise<Order[]> {
    return safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/orders`),
      () => {
        const local = localStore.getOrders(restaurantId);
        return local;
      }
    );
  },

  async getOrder(orderId: string): Promise<Order> {
    return safeFetch(
      () => fetch(`${API_BASE}/orders/${orderId}`),
      () => {
        const o = localStore.getOrder(orderId);
        if (!o) throw new Error('Order not found');
        return o;
      }
    );
  },

  async getTableOrders(restaurantId: string, tableNumber: string): Promise<Order[]> {
    return safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/tables/${tableNumber}/orders`),
      () => localStore.getTableOrders(restaurantId, tableNumber)
    );
  },

  async placeOrder(orderData: {
    restaurantId: string;
    tableNumber: string;
    customerName?: string;
    customerPhone?: string;
    items: any[];
    specialNotes?: string;
  }): Promise<Order> {
    const order = await safeFetch(
      () => fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }),
      () => localStore.createOrder(orderData)
    );

    // Broadcast across all connected client devices & tabs in real-time
    await cloudSync.syncOrderToCloud(order);
    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const updated = await safeFetch(
      () => fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }),
      () => {
        const o = localStore.updateOrderStatus(orderId, status);
        if (!o) throw new Error('Order not found');
        return o;
      }
    );
    await cloudSync.syncOrderStatusToCloud(updated);
    return updated;
  },

  async updateOrderPayment(orderId: string, paymentStatus: PaymentStatus, paymentMethod?: string): Promise<Order> {
    const updated = await safeFetch(
      () => fetch(`${API_BASE}/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, paymentMethod })
      }),
      () => {
        const o = localStore.updateOrderPayment(orderId, paymentStatus, paymentMethod);
        if (!o) throw new Error('Order not found');
        return o;
      }
    );
    await cloudSync.syncOrderStatusToCloud(updated);
    return updated;
  },

  async deleteOrder(orderId: string, restaurantId?: string): Promise<boolean> {
    const resObj = await safeFetch<{ success: boolean }>(
      () => fetch(`${API_BASE}/orders/${orderId}`, { method: 'DELETE' }),
      () => ({ success: localStore.deleteOrder(orderId) })
    );
    const success = resObj?.success ?? false;
    if (success) {
      cloudSync.syncOrderDeleted(restaurantId || 'raj-cabin', orderId);
    }
    return success;
  },

  async clearAllOrders(restaurantId: string): Promise<boolean> {
    const resObj = await safeFetch<{ success: boolean }>(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/orders`, { method: 'DELETE' }),
      () => ({ success: localStore.clearAllOrders(restaurantId) })
    );
    const success = resObj?.success ?? false;
    if (success) {
      cloudSync.syncOrdersCleared(restaurantId);
    }
    return success;
  },

  // Waiter Requests
  async getWaiterRequests(restaurantId: string): Promise<WaiterRequest[]> {
    return safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/waiter-requests`),
      () => localStore.getWaiterRequests(restaurantId)
    );
  },

  async clearAllWaiterRequests(restaurantId: string): Promise<boolean> {
    const success = await safeFetch(
      async () => {
        const res = await fetch(`${API_BASE}/restaurants/${restaurantId}/waiter-requests`, { method: 'DELETE' });
        const data = await res.json();
        return new Response(JSON.stringify(data.success), { headers: { 'content-type': 'application/json' } });
      },
      () => localStore.clearAllWaiterRequests(restaurantId)
    );
    if (success) {
      cloudSync.syncWaiterRequestsCleared(restaurantId);
    }
    return success;
  },

  async submitWaiterRequest(restaurantId: string, tableNumber: string, requestType: string, note?: string): Promise<WaiterRequest> {
    const req = await safeFetch(
      () => fetch(`${API_BASE}/waiter-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, tableNumber, requestType, note })
      }),
      () => localStore.createWaiterRequest(restaurantId, tableNumber, requestType, note)
    );
    await cloudSync.syncWaiterRequestToCloud(req);
    return req;
  },

  async resolveWaiterRequest(requestId: string): Promise<WaiterRequest> {
    const res = await safeFetch(
      () => fetch(`${API_BASE}/waiter-requests/${requestId}/resolve`, { method: 'PUT' }),
      () => {
        const r = localStore.resolveWaiterRequest(requestId);
        if (!r) throw new Error('Request not found');
        return r;
      }
    );
    await cloudSync.syncWaiterRequestUpdated(res);
    return res;
  },

  // Staff
  async getStaff(restaurantId: string): Promise<StaffMember[]> {
    return safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/staff`),
      () => localStore.getStaff(restaurantId)
    );
  },

  async createStaff(restaurantId: string, data: Partial<StaffMember>): Promise<StaffMember> {
    return safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      () => localStore.createStaff(restaurantId, data)
    );
  },

  async updateStaff(staffId: string, data: Partial<StaffMember>): Promise<StaffMember> {
    return safeFetch(
      () => fetch(`${API_BASE}/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      () => {
        const s = localStore.updateStaff(staffId, data);
        if (!s) throw new Error('Staff not found');
        return s;
      }
    );
  },

  async deleteStaff(staffId: string): Promise<boolean> {
    return safeFetch(
      async () => {
        const res = await fetch(`${API_BASE}/staff/${staffId}`, { method: 'DELETE' });
        return res.ok ? new Response(JSON.stringify(true), { headers: { 'content-type': 'application/json' } }) : res;
      },
      () => localStore.deleteStaff(staffId)
    );
  },

  // Subscriptions
  async getSubscriptions(): Promise<SubscriptionPlan[]> {
    return safeFetch(
      () => fetch(`${API_BASE}/subscriptions`),
      () => localStore.getSubscriptions()
    );
  },

  async updateSubscription(planId: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    return safeFetch(
      () => fetch(`${API_BASE}/subscriptions/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      () => {
        const s = localStore.updateSubscription(planId, data);
        if (!s) throw new Error('Subscription not found');
        return s;
      }
    );
  },

  // Analytics & Stats
  async getAnalytics(restaurantId: string): Promise<RestaurantAnalytics> {
    return safeFetch(
      () => fetch(`${API_BASE}/restaurants/${restaurantId}/analytics`),
      () => localStore.getAnalytics(restaurantId)
    );
  },

  async getPlatformStats(): Promise<PlatformStats> {
    return safeFetch(
      () => fetch(`${API_BASE}/platform/stats`),
      () => localStore.getPlatformStats()
    );
  }
};
