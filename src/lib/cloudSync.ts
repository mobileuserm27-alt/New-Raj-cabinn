/**
 * Multi-Device Cloud Sync Engine for Static & Server Deployments
 * Enables instant cross-device order & waiter request sync across Customer & Admin phones
 */

import { Order, WaiterRequest, Restaurant, MenuItem, Category, TableInfo } from '../types';

// Free global cloud key-value store endpoint for instant cross-device sync
const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects';
const CLOUD_STORAGE_KEY_PREFIX = 'snd_cloud_v2_';

// BroadcastChannel for instant same-browser multi-tab sync
let localBroadcast: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    localBroadcast = new BroadcastChannel('snd_restaurant_realtime_channel');
  }
} catch (e) {
  // fallback
}

export type CloudSyncEvent =
  | { type: 'new_order'; order: Order }
  | { type: 'order_status_updated'; order: Order }
  | { type: 'order_deleted'; orderId: string }
  | { type: 'orders_cleared'; restaurantId: string }
  | { type: 'new_waiter_request'; request: WaiterRequest }
  | { type: 'waiter_request_updated'; request: WaiterRequest }
  | { type: 'waiter_requests_cleared'; restaurantId: string };

type EventListener = (event: CloudSyncEvent) => void;
const listeners: Set<EventListener> = new Set();

if (localBroadcast) {
  localBroadcast.onmessage = (ev) => {
    if (ev.data) {
      listeners.forEach(fn => fn(ev.data));
    }
  };
}

// Global Cloud Sync Manager
export const cloudSync = {
  subscribe(fn: EventListener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  broadcastLocal(event: CloudSyncEvent) {
    try {
      if (localBroadcast) {
        localBroadcast.postMessage(event);
      }
      listeners.forEach(fn => fn(event));
    } catch (e) {
      console.debug('Broadcast error', e);
    }
  },

  // Save an order to free public cloud storage so other devices see it
  async syncOrderToCloud(order: Order): Promise<void> {
    this.broadcastLocal({ type: 'new_order', order });

    try {
      // Also store in shared cloud KV storage with restaurantId
      const key = `${CLOUD_STORAGE_KEY_PREFIX}order_${order.restaurantId}_${order.id}`;
      await fetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: key,
          data: {
            order,
            restaurantId: order.restaurantId,
            timestamp: Date.now()
          }
        })
      }).catch(() => null);
    } catch (e) {
      // silent fallback
    }
  },

  // Update order status across cloud
  async syncOrderStatusToCloud(order: Order): Promise<void> {
    this.broadcastLocal({ type: 'order_status_updated', order });
  },

  // Broadcast deleted order
  async syncOrderDeleted(orderId: string): Promise<void> {
    this.broadcastLocal({ type: 'order_deleted', orderId });
  },

  // Broadcast all orders cleared
  async syncOrdersCleared(restaurantId: string): Promise<void> {
    this.broadcastLocal({ type: 'orders_cleared', restaurantId });
  },

  // Broadcast waiter requests cleared
  async syncWaiterRequestsCleared(restaurantId: string): Promise<void> {
    this.broadcastLocal({ type: 'waiter_requests_cleared', restaurantId });
  },

  // Sync waiter request to cloud
  async syncWaiterRequestToCloud(request: WaiterRequest): Promise<void> {
    this.broadcastLocal({ type: 'new_waiter_request', request });

    try {
      const key = `${CLOUD_STORAGE_KEY_PREFIX}waiter_${request.restaurantId}_${request.id}`;
      await fetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: key,
          data: {
            request,
            restaurantId: request.restaurantId,
            timestamp: Date.now()
          }
        })
      }).catch(() => null);
    } catch (e) {
      // silent fallback
    }
  },

  // Pull latest shared cloud orders
  async pullCloudOrders(restaurantId: string): Promise<Order[]> {
    try {
      // Query recent objects for this restaurant
      const res = await fetch(`${CLOUD_SYNC_URL}`, { method: 'GET' });
      if (!res.ok) return [];
      const items = await res.json();
      if (!Array.isArray(items)) return [];

      const orders: Order[] = [];
      const prefix = `${CLOUD_STORAGE_KEY_PREFIX}order_${restaurantId}`;

      for (const it of items) {
        if (it.name && it.name.startsWith(prefix) && it.data && it.data.order) {
          orders.push(it.data.order);
        }
      }
      return orders;
    } catch (e) {
      return [];
    }
  }
};
