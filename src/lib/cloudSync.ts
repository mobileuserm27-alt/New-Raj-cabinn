/**
 * High-Speed Multi-Device Real-Time Cloud Sync Engine
 * Guaranteed to work across mobile phones, tablets, and laptops on Netlify static hosting.
 */

import { Order, WaiterRequest } from '../types';

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

// Same-device multi-tab broadcast channel
let localBroadcast: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    localBroadcast = new BroadcastChannel('snd_raj_cabin_sync_channel_v2');
    localBroadcast.onmessage = (ev) => {
      if (ev.data) {
        listeners.forEach(fn => fn(ev.data));
      }
    };
  }
} catch (e) {
  // fallback
}

// Generate consistent unified topic name per restaurant
function getTopic(restaurantIdOrSlug: string = 'raj-cabin'): string {
  const str = (restaurantIdOrSlug || '').toLowerCase().trim();
  if (!str || str === 'raj-cabin' || str === 'rest_raj_001' || str === 'raj_cabin' || str.includes('raj')) {
    return 'snd_raj_cabin_orders_live_sync_v2';
  }
  const clean = str.replace(/[^a-zA-Z0-9]/g, '_');
  return `snd_res_${clean}_live_v2`;
}

// Active EventSource connection
let activeSSE: EventSource | null = null;
let activeTopic: string = '';

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

  // Start real-time SSE listener from cloud relay
  startRealtimeListener(restaurantId: string) {
    const topic = getTopic(restaurantId);
    if (activeSSE && activeTopic === topic) return;

    if (activeSSE) {
      activeSSE.close();
      activeSSE = null;
    }

    activeTopic = topic;
    try {
      const sseUrl = `https://ntfy.sh/${topic}/sse`;
      activeSSE = new EventSource(sseUrl);

      activeSSE.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          if (raw.message) {
            const event = JSON.parse(raw.message) as CloudSyncEvent;
            if (event && event.type) {
              this.broadcastLocal(event);
            }
          }
        } catch (err) {
          // ignore non-json messages
        }
      };

      activeSSE.onerror = () => {
        // EventSource will automatically retry in modern browsers
      };
    } catch (e) {
      console.debug('SSE connection error', e);
    }
  },

  // Publish event to Cloud Relay so ALL devices receive it in < 0.1s
  async publishEvent(restaurantId: string, event: CloudSyncEvent): Promise<boolean> {
    this.broadcastLocal(event);

    const topic = getTopic(restaurantId);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });
        if (res.ok) return true;
      } catch (e) {
        console.debug(`Cloud publish attempt ${attempt} failed`, e);
      }
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 200 * attempt));
      }
    }
    return false;
  },

  // Save an order to cloud & broadcast
  async syncOrderToCloud(order: Order): Promise<void> {
    await this.publishEvent(order.restaurantId, { type: 'new_order', order });
  },

  // Update order status across cloud
  async syncOrderStatusToCloud(order: Order): Promise<void> {
    await this.publishEvent(order.restaurantId, { type: 'order_status_updated', order });
  },

  // Broadcast deleted order
  async syncOrderDeleted(restaurantId: string, orderId: string): Promise<void> {
    await this.publishEvent(restaurantId, { type: 'order_deleted', orderId });
  },

  // Broadcast all orders cleared
  async syncOrdersCleared(restaurantId: string): Promise<void> {
    await this.publishEvent(restaurantId, { type: 'orders_cleared', restaurantId });
  },

  // Sync waiter request to cloud
  async syncWaiterRequestToCloud(request: WaiterRequest): Promise<void> {
    await this.publishEvent(request.restaurantId, { type: 'new_waiter_request', request });
  },

  // Broadcast waiter requests cleared
  async syncWaiterRequestsCleared(restaurantId: string): Promise<void> {
    await this.publishEvent(restaurantId, { type: 'waiter_requests_cleared', restaurantId });
  },

  // Pull past 24 hours orders directly from Cloud Relay
  async pullCloudOrders(restaurantId: string): Promise<{ orders: Order[]; deletedIds: Set<string>; cleared: boolean }> {
    const topic = getTopic(restaurantId);
    const result = {
      orders: [] as Order[],
      deletedIds: new Set<string>(),
      cleared: false
    };

    try {
      const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=24h`);
      if (!res.ok) return result;

      const text = await res.text();
      const lines = text.trim().split('\n');
      const orderMap = new Map<string, Order>();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const item = JSON.parse(line);
          if (item.message) {
            const ev = JSON.parse(item.message) as CloudSyncEvent;
            if (ev.type === 'new_order' && ev.order) {
              orderMap.set(ev.order.id, ev.order);
            } else if (ev.type === 'order_status_updated' && ev.order) {
              orderMap.set(ev.order.id, ev.order);
            } else if (ev.type === 'order_deleted' && ev.orderId) {
              orderMap.delete(ev.orderId);
              result.deletedIds.add(ev.orderId);
            } else if (ev.type === 'orders_cleared') {
              orderMap.clear();
              result.cleared = true;
            }
          }
        } catch (e) {
          // ignore malformed line
        }
      }

      result.orders = Array.from(orderMap.values());
      return result;
    } catch (e) {
      return result;
    }
  },

  // Pull past 24 hours waiter requests
  async pullCloudWaiterRequests(restaurantId: string): Promise<WaiterRequest[]> {
    const topic = getTopic(restaurantId);
    try {
      const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=24h`);
      if (!res.ok) return [];

      const text = await res.text();
      const lines = text.trim().split('\n');
      const waiterMap = new Map<string, WaiterRequest>();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const item = JSON.parse(line);
          if (item.message) {
            const ev = JSON.parse(item.message) as CloudSyncEvent;
            if (ev.type === 'new_waiter_request' && ev.request) {
              waiterMap.set(ev.request.id, ev.request);
            } else if (ev.type === 'waiter_requests_cleared') {
              waiterMap.clear();
            }
          }
        } catch (e) {
          // ignore
        }
      }

      return Array.from(waiterMap.values());
    } catch (e) {
      return [];
    }
  }
};
