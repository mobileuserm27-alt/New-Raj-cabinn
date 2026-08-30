import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, playNotificationChime } from '../lib/api';
import { cloudSync, CloudSyncEvent } from '../lib/cloudSync';
import { localStore } from '../lib/localStore';
import { translations, Language } from '../lib/translations';
import {
  AdminTab,
  Category,
  CartItem,
  MenuItem,
  MenuItemAddon,
  MenuItemVariant,
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  Restaurant,
  StaffMember,
  StaffRole,
  TableInfo,
  UserRole,
  WaiterRequest
} from '../types';

export type AppView =
  | 'landing'
  | 'customer'
  | 'admin'
  | 'customer_menu'
  | 'restaurant_admin'
  | 'kitchen_display'
  | 'super_admin'
  | 'onboarding';

interface ToastState {
  title: string;
  message?: string;
  desc?: string;
  type?: 'info' | 'success' | 'warn';
}

interface AppContextType {
  // Navigation & View
  view: AppView;
  setView: (view: AppView) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  activeRestaurantSlug: string;
  setActiveRestaurantSlug: (slug: string) => void;
  activeTableNumber: string;
  setActiveTableNumber: (table: string) => void;
  isTableLockedFromQr: boolean;
  setIsTableLockedFromQr: (locked: boolean) => void;
  openCustomerMenuForTable: (tableNum: string, restaurantSlug?: string) => void;

  // Staff & Role
  currentStaff: StaffMember;
  setCurrentStaff: (staff: StaffMember) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Data
  restaurant: Restaurant | null;
  restaurants: Restaurant[];
  allRestaurants: Restaurant[];
  categories: Category[];
  menuItems: MenuItem[];
  tables: TableInfo[];
  orders: Order[];
  waiterRequests: WaiterRequest[];
  staffList: StaffMember[];
  isLoading: boolean;
  error: string | null;

  // Cart & Customer Flow
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  isTableSelectorOpen: boolean;
  setIsTableSelectorOpen: (open: boolean) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, variant?: MenuItemVariant, addons?: MenuItemAddon[], specialInstructions?: string, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartTaxAmount: number;
  cartGrandTotal: number;

  // Customer Modals & Tracking
  customerOrders: Order[];
  activeOrderModal: Order | null;
  setActiveOrderModal: (order: Order | null) => void;
  selectedFoodDetail: MenuItem | null;
  setSelectedFoodDetail: (item: MenuItem | null) => void;
  isCallWaiterOpen: boolean;
  setIsCallWaiterOpen: (open: boolean) => void;
  isBillRequestOpen: boolean;
  setIsBillRequestOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Search & Filter
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dietFilter: 'all' | 'veg' | 'non_veg';
  setDietFilter: (filter: 'all' | 'veg' | 'non_veg') => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;

  // Feedback & Toasts
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toast: ToastState | null;
  toastMessage: ToastState | null;
  showToast: (title: string, descOrMsg?: string, type?: 'info' | 'success' | 'warn') => void;
  closeToast: () => void;

  // Secret Master Admin Security
  isSecretAdminOpen: boolean;
  setIsSecretAdminOpen: (open: boolean) => void;
  openSecretAdminModal: () => void;
  closeSecretAdminModal: () => void;
  isAdminUnlocked: boolean;
  unlockAdminWithPassword: (password: string) => boolean;
  lockAdmin: () => void;

  // Actions & CRUD
  refreshData: () => Promise<void>;
  placeCustomerOrder: (customerName?: string, customerPhone?: string, specialNotes?: string) => Promise<Order>;
  submitWaiterCall: (requestType: 'call_waiter' | 'water' | 'bill' | 'help' | 'clean_table', note?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderPayment: (orderId: string, paymentStatus: PaymentStatus, method?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  clearAllOrders: () => Promise<boolean>;
  clearAllWaiterRequests: () => Promise<boolean>;
  resolveWaiterCall: (requestId: string) => Promise<void>;
  switchRestaurantAndTable: (restaurantSlug: string, tableNumber: string, targetView?: AppView) => void;

  // Admin CRUD
  addTable: (tableData: { tableNumber: string; capacity?: number; status?: string }) => Promise<TableInfo>;
  updateTable: (tableId: string, data: Partial<TableInfo>) => Promise<TableInfo>;
  deleteTable: (tableId: string) => Promise<boolean>;

  addMenuItem: (itemData: Partial<MenuItem>) => Promise<MenuItem>;
  updateMenuItem: (itemId: string, itemData: Partial<MenuItem>) => Promise<MenuItem>;
  deleteMenuItem: (itemId: string) => Promise<boolean>;

  addCategory: (catData: { name: string; hindiName?: string; sortOrder?: number }) => Promise<Category>;
  updateCategory: (catId: string, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (catId: string) => Promise<boolean>;

  addStaffMember: (staffData: Partial<StaffMember>) => Promise<StaffMember>;
  updateStaffMember: (staffId: string, data: Partial<StaffMember>) => Promise<StaffMember>;
  deleteStaffMember: (staffId: string) => Promise<boolean>;

  updateRestaurantBranding: (data: Partial<Restaurant>) => Promise<Restaurant>;
  updateRestaurantProfile: (data: Partial<Restaurant>) => Promise<Restaurant>;
  sendTestLiveOrder: () => Promise<Order>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<AppView>('landing');
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [activeRestaurantSlug, setActiveRestaurantSlug] = useState<string>('raj-cabin');
  const [activeTableNumber, setActiveTableNumberState] = useState<string>(() => {
    try {
      // Check query params immediately
      const sp = new URLSearchParams(window.location.search);
      const urlTable = sp.get('table') || sp.get('tbl') || sp.get('t') || sp.get('tableNumber');
      if (urlTable) return urlTable;

      // Check pathname
      const match = window.location.pathname.match(/\/table\/([^/]+)/);
      if (match && match[1]) return match[1];

      // Check session
      const saved = sessionStorage.getItem('snd_scanned_table');
      if (saved) return saved;
    } catch {
      // fallback
    }
    return '1';
  });

  const [isTableLockedFromQr, setIsTableLockedFromQr] = useState<boolean>(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('table') || sp.get('tbl') || sp.get('t') || sp.get('tableNumber')) return true;
      if (window.location.pathname.includes('/table/')) return true;
      if (sessionStorage.getItem('snd_table_locked') === 'true') return true;
    } catch {
      // fallback
    }
    return false;
  });

  const setActiveTableNumber = (table: string, lock: boolean = true) => {
    setActiveTableNumberState(table);
    if (lock) {
      setIsTableLockedFromQr(true);
      try {
        sessionStorage.setItem('snd_scanned_table', table);
        sessionStorage.setItem('snd_table_locked', 'true');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiterRequests, setWaiterRequests] = useState<WaiterRequest[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);

  const [currentStaff, setCurrentStaff] = useState<StaffMember>({
    id: 'staff_1',
    restaurantId: 'rest_raj_001',
    name: 'Raj Cabin Management',
    email: 'admin@rajcabin.in',
    role: 'owner',
    pin: '1234',
    isActive: true
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Customer Identity & Table
  const [customerName, setCustomerNameState] = useState<string>(() => {
    try {
      return localStorage.getItem('snd_customer_name') || '';
    } catch {
      return '';
    }
  });

  const [customerPhone, setCustomerPhoneState] = useState<string>(() => {
    try {
      return localStorage.getItem('snd_customer_phone') || '';
    } catch {
      return '';
    }
  });

  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState<boolean>(false);

  const setCustomerName = (name: string) => {
    setCustomerNameState(name);
    try {
      localStorage.setItem('snd_customer_name', name);
    } catch (e) {
      console.error(e);
    }
  };

  const setCustomerPhone = (phone: string) => {
    setCustomerPhoneState(phone);
    try {
      localStorage.setItem('snd_customer_phone', phone);
    } catch (e) {
      console.error(e);
    }
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerOrders, setCustomerOrdersState] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('snd_customer_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const setCustomerOrders = (val: Order[] | ((prev: Order[]) => Order[])) => {
    setCustomerOrdersState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem('snd_customer_orders', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Modals
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<MenuItem | null>(null);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState<boolean>(false);
  const [isBillRequestOpen, setIsBillRequestOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Filters & Language
  const [language, setLanguage] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non_veg'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Admin & Sound
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);

  // Secret Master Admin Modal & Auth
  const [isSecretAdminOpen, setIsSecretAdminOpen] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('snd_admin_auth') === 'unlocked';
    } catch {
      return false;
    }
  });

  const openSecretAdminModal = () => setIsSecretAdminOpen(true);
  const closeSecretAdminModal = () => setIsSecretAdminOpen(false);

  const unlockAdminWithPassword = (entered: string): boolean => {
    if (entered.trim() === 'admin.Kalimandir') {
      setIsAdminUnlocked(true);
      try {
        localStorage.setItem('snd_admin_auth', 'unlocked');
      } catch (e) {
        console.error(e);
      }
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    try {
      localStorage.removeItem('snd_admin_auth');
    } catch (e) {
      console.error(e);
    }
    setView('customer');
    showToast('एडमिन सुरक्षित रूप से लॉक किया गया', 'Switched to Customer Dining Menu', 'info');
  };

  const t = translations[language];

  // Helper for toasts
  const showToast = (title: string, descOrMsg?: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setToastMessage({ title, message: descOrMsg, desc: descOrMsg, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.title === title ? null : prev));
    }, 4500);
  };

  const closeToast = () => setToastMessage(null);

  const openCustomerMenuForTable = (tableNum: string, restaurantSlug?: string) => {
    if (restaurantSlug) {
      setActiveRestaurantSlug(restaurantSlug);
    }
    setActiveTableNumber(tableNum);
    setView('customer');
    const slug = restaurantSlug || activeRestaurantSlug || restaurant?.slug || 'royal-spice-001';
    window.history.pushState({}, '', `/menu/${slug}/table/${tableNum}`);
  };

  // URL parsing on boot to support https://.../menu/:restaurant/table/:table or ?table=... or #table=...
  useEffect(() => {
    const parseUrl = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      // 1. Check pattern /menu/:rest/table/:tbl or /table/:tbl
      const matchFull = pathname.match(/\/menu\/([^/]+)\/table\/([^/]+)/);
      const matchShort = pathname.match(/\/table\/([^/]+)/);
      
      let detectedRest = searchParams.get('restaurant') || searchParams.get('r');
      let detectedTable = searchParams.get('table') || searchParams.get('tbl') || searchParams.get('t') || searchParams.get('tableNumber');
      const qView = searchParams.get('view') as AppView;

      if (matchFull) {
        detectedRest = matchFull[1];
        detectedTable = matchFull[2];
      } else if (matchShort) {
        detectedTable = matchShort[1];
      }

      // Check hash params e.g. #table=3 or #/table/3
      if (!detectedTable && hash) {
        const hashMatch = hash.match(/table[=/]([^&]+)/i);
        if (hashMatch) {
          detectedTable = hashMatch[1];
        }
      }

      if (detectedRest) {
        setActiveRestaurantSlug(detectedRest);
      }

      if (detectedTable) {
        setActiveTableNumber(detectedTable, true);
        setView('customer');
        showToast(
          `टेबल #${detectedTable} कनेक्टेड (QR Scan)`,
          `Table #${detectedTable} verified directly from QR Code. Your orders will be served here.`,
          'success'
        );
        return;
      }

      if (qView) {
        setView(qView);
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // Fetch initial data whenever activeRestaurantSlug changes
  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [allRests, currentRest] = await Promise.all([
        api.getRestaurants(),
        api.getRestaurant(activeRestaurantSlug).catch(() => null)
      ]);

      setAllRestaurants(allRests);

      if (currentRest) {
        setRestaurant(currentRest);
        const [cats, items, tbls, ords, wReqs, staff, cloudRes, cloudWaiters] = await Promise.all([
          api.getCategories(currentRest.id),
          api.getMenuItems(currentRest.id),
          api.getTables(currentRest.id),
          api.getOrders(currentRest.id),
          api.getWaiterRequests(currentRest.id),
          api.getStaff(currentRest.id),
          cloudSync.pullCloudOrders(currentRest.id).catch(() => ({ orders: [] as Order[], deletedIds: new Set<string>(), cleared: false })),
          cloudSync.pullCloudWaiterRequests(currentRest.id).catch(() => [] as WaiterRequest[])
        ]);

        // Merge orders from local/server + cloud
        const orderMap = new Map<string, Order>();
        if (!cloudRes.cleared) {
          ords.forEach(o => {
            if (!cloudRes.deletedIds.has(o.id) && !cloudRes.deletedIds.has(o.orderNumber)) {
              orderMap.set(o.id, o);
            }
          });
          cloudRes.orders.forEach(o => {
            if (!cloudRes.deletedIds.has(o.id) && !cloudRes.deletedIds.has(o.orderNumber)) {
              orderMap.set(o.id, o);
            }
          });
        }
        const mergedOrders = Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setCategories(cats);
        setMenuItems(items);
        setTables(tbls);
        setOrders(mergedOrders);

        // Merge waiter requests
        const waiterMap = new Map<string, WaiterRequest>();
        wReqs.forEach(w => waiterMap.set(w.id, w));
        cloudWaiters.forEach(w => waiterMap.set(w.id, w));
        setWaiterRequests(Array.from(waiterMap.values()));

        setStaffList(staff);
        if (staff.length > 0) {
          setCurrentStaff(staff[0]);
        }
      } else if (allRests.length > 0) {
        // Fallback to first restaurant
        const first = allRests[0];
        setRestaurant(first);
        setActiveRestaurantSlug(first.slug);
      }
    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to load restaurant data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeRestaurantSlug]);

  // Real-time Event Listener (SSE + CloudSync Relay + Cross-Tab Storage Event)
  useEffect(() => {
    if (!restaurant) return;

    // Start real-time SSE listener from cloud relay
    cloudSync.startRealtimeListener(restaurant.id);

    // 1. Listen to cross-device cloud sync and local BroadcastChannel
    const unsubscribeCloud = cloudSync.subscribe((event: CloudSyncEvent) => {
      if (event.type === 'new_order') {
        const payload = event.order;
        setOrders(prev => {
          if (prev.some(o => o.id === payload.id)) return prev;
          return [payload, ...prev];
        });
        if (soundEnabled) {
          playNotificationChime('order');
        }
        showToast('🔔 New Live Order!', `${payload.orderNumber} from Table #${payload.tableNumber} (₹${payload.grandTotal})`, 'success');
      } else if (event.type === 'order_status_updated') {
        const payload = event.order;
        setOrders(prev => prev.map(o => (o.id === payload.id ? payload : o)));
        setCustomerOrders(prev => prev.map(o => (o.id === payload.id ? payload : o)));
        setActiveOrderModal(prev => (prev?.id === payload.id ? payload : prev));
        if (soundEnabled) {
          playNotificationChime('success');
        }
      } else if (event.type === 'new_waiter_request') {
        const payload = event.request;
        setWaiterRequests(prev => {
          if (prev.some(w => w.id === payload.id)) return prev;
          return [payload, ...prev];
        });
        if (soundEnabled) {
          playNotificationChime('waiter');
        }
        const label = payload.requestType === 'bill' ? 'Bill Request' : payload.requestType === 'water' ? 'Water Request' : 'Waiter Call';
        showToast(`🛎️ Table #${payload.tableNumber}: ${label}`, payload.note || 'Customer is waiting at table', 'warn');
      } else if (event.type === 'order_deleted') {
        const orderId = event.orderId;
        setOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));
        setCustomerOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));
        setActiveOrderModal(prev => (prev?.id === orderId || prev?.orderNumber === orderId ? null : prev));
      } else if (event.type === 'orders_cleared') {
        setOrders([]);
        setCustomerOrders([]);
        setActiveOrderModal(null);
        try {
          localStorage.removeItem('snd_customer_orders');
        } catch (e) {
          // ignore
        }
      } else if (event.type === 'waiter_requests_cleared') {
        setWaiterRequests([]);
      }
    });

    // 2. Storage event listener for cross-tab sync on same device
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'snd_offline_orders' && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          setOrders(fresh);
        } catch (err) {
          // ignore
        }
      } else if (e.key === 'snd_offline_waiter_requests' && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          setWaiterRequests(fresh);
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. High-Frequency 2-Second Smart Poller for guaranteed sync across all phones & laptops
    const pollInterval = setInterval(async () => {
      try {
        const [freshOrders, freshWaiters, cloudRes, cloudWaiters] = await Promise.all([
          api.getOrders(restaurant.id).catch(() => []),
          api.getWaiterRequests(restaurant.id).catch(() => []),
          cloudSync.pullCloudOrders(restaurant.id).catch(() => ({ orders: [] as Order[], deletedIds: new Set<string>(), cleared: false })),
          cloudSync.pullCloudWaiterRequests(restaurant.id).catch(() => [] as WaiterRequest[])
        ]);

        if (cloudRes.cleared) {
          setOrders([]);
          setCustomerOrders([]);
          setActiveOrderModal(null);
        } else {
          const orderMap = new Map<string, Order>();
          freshOrders.forEach(o => {
            if (!cloudRes.deletedIds.has(o.id) && !cloudRes.deletedIds.has(o.orderNumber)) {
              orderMap.set(o.id, o);
            }
          });
          cloudRes.orders.forEach(o => {
            if (!cloudRes.deletedIds.has(o.id) && !cloudRes.deletedIds.has(o.orderNumber)) {
              orderMap.set(o.id, o);
            }
          });

          const merged = Array.from(orderMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          if (merged.length > 0) {
            setOrders(prev => {
              const prevIds = new Set(prev.map(p => p.id));
              const hasNew = merged.some(m => !prevIds.has(m.id));
              if (hasNew && soundEnabled) {
                playNotificationChime('order');
              }
              return merged;
            });

            // Also reconcile customer orders so deleted orders are pruned
            const activeIds = new Set([...merged.map(m => m.id), ...merged.map(m => m.orderNumber)]);
            setCustomerOrders(prev => prev.filter(co => activeIds.has(co.id) || activeIds.has(co.orderNumber)));
            setActiveOrderModal(prev => (prev && !activeIds.has(prev.id) && !activeIds.has(prev.orderNumber) ? null : prev));
          }
        }

        if (cloudWaiters.length > 0 || freshWaiters.length > 0) {
          const waiterMap = new Map<string, WaiterRequest>();
          freshWaiters.forEach(w => waiterMap.set(w.id, w));
          cloudWaiters.forEach(w => waiterMap.set(w.id, w));
          setWaiterRequests(Array.from(waiterMap.values()));
        }
      } catch (e) {
        // silent
      }
    }, 2000);

    // 4. Server-Sent Events (SSE) if running on custom server / Cloud Run
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/events?restaurantId=${encodeURIComponent(restaurant.id)}`);

      eventSource.onerror = () => {
        if (eventSource && eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
        }
      };

      eventSource.addEventListener('new_order', (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data).payload as Order;
          setOrders(prev => [payload, ...prev.filter(o => o.id !== payload.id)]);
          if (soundEnabled) {
            playNotificationChime('order');
          }
          showToast('🔔 New Order Received!', `${payload.orderNumber} from Table ${payload.tableNumber} (₹${payload.grandTotal})`, 'success');
        } catch (e) {
          console.error(e);
        }
      });

      eventSource.addEventListener('order_status_updated', (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data).payload as Order;
          setOrders(prev => prev.map(o => (o.id === payload.id ? payload : o)));
          setCustomerOrders(prev => prev.map(o => (o.id === payload.id ? payload : o)));
          setActiveOrderModal(prev => (prev?.id === payload.id ? payload : prev));
          if (soundEnabled) {
            playNotificationChime('success');
          }
        } catch (e) {
          console.error(e);
        }
      });
    } catch (err) {
      // SSE not available
    }

    return () => {
      unsubscribeCloud();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [restaurant?.id, soundEnabled]);

  // Cart operations
  const addToCart = (
    item: MenuItem,
    variant?: MenuItemVariant,
    addons: MenuItemAddon[] = [],
    specialInstructions?: string,
    quantity: number = 1
  ) => {
    const safeAddons = Array.isArray(addons) ? addons : [];
    const variantId = variant?.id || 'base';
    const addonIds = safeAddons.map(a => a.id).sort().join('_');
    const cartItemId = `${item.id}-${variantId}-${addonIds}-${specialInstructions || ''}`;

    const unitPrice = (variant ? variant.price : item.price) + safeAddons.reduce((sum, a) => sum + a.price, 0);

    setCart(prev => {
      const existingIdx = prev.findIndex(c => c.cartItemId === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          menuItem: item,
          selectedVariant: variant,
          selectedAddons: safeAddons,
          quantity,
          specialInstructions,
          itemPrice: unitPrice
        }
      ];
    });

    showToast('Added to Cart', `${item.name} (${quantity}x)`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(c => c.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.itemPrice * item.quantity, 0);
  const cartTaxAmount = 0;
  const cartGrandTotal = cartSubtotal;

  // Place Order
  const placeCustomerOrder = async (orderCustomerName?: string, orderCustomerPhone?: string, specialNotes?: string): Promise<Order> => {
    if (!restaurant) throw new Error('Restaurant not selected');
    if (cart.length === 0) throw new Error('Cart is empty');

    const finalCustomerName = orderCustomerName || customerName || 'Guest Diner';
    const finalCustomerPhone = orderCustomerPhone || customerPhone || '';

    const orderPayload = {
      restaurantId: restaurant.id,
      tableNumber: activeTableNumber,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      items: cart.map(c => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        price: c.itemPrice,
        quantity: c.quantity,
        dietType: c.menuItem.dietType,
        selectedVariant: c.selectedVariant,
        selectedAddons: c.selectedAddons,
        specialInstructions: c.specialInstructions
      })),
      specialNotes
    };

    const newOrder = await api.placeOrder(orderPayload);
    setCustomerOrders(prev => [newOrder, ...prev]);
    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    setActiveOrderModal(newOrder);
    clearCart();
    setIsCartOpen(false);
    playNotificationChime('success');
    return newOrder;
  };

  // Waiter call
  const submitWaiterCall = async (requestType: any, note?: string) => {
    if (!restaurant) return;
    await api.submitWaiterRequest(restaurant.id, activeTableNumber, requestType, note);
    setIsCallWaiterOpen(false);
    setIsBillRequestOpen(false);
    playNotificationChime('waiter');
    showToast('Request Sent', t.waiterDispatched, 'success');
  };

  // Order management
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await api.updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
  };

  const updateOrderPayment = async (orderId: string, paymentStatus: PaymentStatus, method?: string) => {
    const updated = await api.updateOrderPayment(orderId, paymentStatus, method);
    setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
  };

  const deleteOrder = async (orderId: string) => {
    const success = await api.deleteOrder(orderId, restaurant?.id);
    if (success) {
      setOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));
      setCustomerOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));
      setActiveOrderModal(prev => (prev?.id === orderId || prev?.orderNumber === orderId ? null : prev));
      if (restaurant) {
        const freshTables = await api.getTables(restaurant.id);
        setTables(freshTables);
      }
    }
    return success;
  };

  const clearAllOrders = async () => {
    if (!restaurant) return false;
    const success = await api.clearAllOrders(restaurant.id);
    if (success) {
      setOrders([]);
      setCustomerOrders([]);
      setActiveOrderModal(null);
      try {
        localStorage.removeItem('snd_customer_orders');
      } catch (e) {
        // ignore
      }
      const freshTables = await api.getTables(restaurant.id);
      setTables(freshTables);
    }
    return success;
  };

  const clearAllWaiterRequests = async () => {
    if (!restaurant) return false;
    const success = await api.clearAllWaiterRequests(restaurant.id);
    if (success) {
      setWaiterRequests([]);
    }
    return success;
  };

  const resolveWaiterCall = async (requestId: string) => {
    const updated = await api.resolveWaiterRequest(requestId);
    setWaiterRequests(prev => prev.map(w => (w.id === requestId ? updated : w)));
  };

  const switchRestaurantAndTable = (restaurantSlug: string, tableNumber: string, targetView: AppView = 'customer') => {
    setActiveRestaurantSlug(restaurantSlug);
    setActiveTableNumber(tableNumber);
    setView(targetView);
    // Update browser URL without reload for true QR demo experience
    const newPath = `/menu/${restaurantSlug}/table/${tableNumber}`;
    window.history.pushState({}, '', newPath);
  };

  // Admin CRUD implementations
  const addTable = async (tableData: { tableNumber: string; capacity?: number; status?: string }) => {
    if (!restaurant) throw new Error('No active restaurant');
    const created = await api.createTable(restaurant.id, tableData.tableNumber, tableData.capacity || 4);
    setTables(prev => (prev.some(t => t.id === created.id) ? prev : [...prev, created]));
    return created;
  };

  const updateTable = async (tableId: string, data: Partial<TableInfo>) => {
    const updated = await api.updateTable(tableId, data);
    setTables(prev => prev.map(t => (t.id === tableId ? updated : t)));
    return updated;
  };

  const deleteTable = async (tableId: string) => {
    const ok = await api.deleteTable(tableId);
    if (ok) {
      setTables(prev => prev.filter(t => t.id !== tableId));
    }
    return ok;
  };

  const addMenuItem = async (itemData: Partial<MenuItem>) => {
    if (!restaurant) throw new Error('No active restaurant');
    const created = await api.createMenuItem(restaurant.id, itemData);
    setMenuItems(prev => (prev.some(m => m.id === created.id) ? prev : [...prev, created]));
    return created;
  };

  const updateMenuItem = async (itemId: string, itemData: Partial<MenuItem>) => {
    const updated = await api.updateMenuItem(itemId, itemData);
    setMenuItems(prev => prev.map(m => (m.id === itemId ? updated : m)));
    return updated;
  };

  const deleteMenuItem = async (itemId: string) => {
    const ok = await api.deleteMenuItem(itemId);
    if (ok) {
      setMenuItems(prev => prev.filter(m => m.id !== itemId));
    }
    return ok;
  };

  const addCategory = async (catData: { name: string; hindiName?: string; sortOrder?: number }) => {
    if (!restaurant) throw new Error('No active restaurant');
    const created = await api.createCategory(restaurant.id, catData.name, catData.hindiName);
    setCategories(prev => (prev.some(c => c.id === created.id) ? prev : [...prev, created]));
    return created;
  };

  const updateCategory = async (catId: string, data: Partial<Category>) => {
    const updated = await api.updateCategory(catId, data);
    setCategories(prev => prev.map(c => (c.id === catId ? updated : c)));
    return updated;
  };

  const deleteCategory = async (catId: string) => {
    const ok = await api.deleteCategory(catId);
    if (ok) {
      setCategories(prev => prev.filter(c => c.id !== catId));
    }
    return ok;
  };

  const addStaffMember = async (staffData: Partial<StaffMember>) => {
    if (!restaurant) throw new Error('No active restaurant');
    const created = await api.createStaff(restaurant.id, staffData);
    setStaffList(prev => (prev.some(s => s.id === created.id) ? prev : [...prev, created]));
    return created;
  };

  const updateStaffMember = async (staffId: string, data: Partial<StaffMember>) => {
    const updated = await api.updateStaff(staffId, data);
    setStaffList(prev => prev.map(s => (s.id === staffId ? updated : s)));
    return updated;
  };

  const deleteStaffMember = async (staffId: string) => {
    const ok = await api.deleteStaff(staffId);
    if (ok) {
      setStaffList(prev => prev.filter(s => s.id !== staffId));
    }
    return ok;
  };

  const updateRestaurantBranding = async (data: Partial<Restaurant>) => {
    if (!restaurant) throw new Error('No active restaurant');
    const updated = await api.updateRestaurant(restaurant.id, data);
    setRestaurant(updated);
    return updated;
  };

  const sendTestLiveOrder = async (): Promise<Order> => {
    if (!restaurant) throw new Error('No active restaurant');
    const tableNum = (Math.floor(Math.random() * 8) + 1).toString();
    const sampleDishes = menuItems.length > 0
      ? menuItems.slice(0, 2)
      : [
          {
            id: 'item-demo-1',
            restaurantId: restaurant.id,
            name: 'Special Chicken Dum Biryani',
            hindiName: 'स्पेशल चिकन दम बिरयानी',
            price: 240,
            dietType: 'non-veg',
            isAvailable: true
          },
          {
            id: 'item-demo-2',
            restaurantId: restaurant.id,
            name: 'Butter Garlic Naan',
            hindiName: 'बटर गार्लिक नान',
            price: 60,
            dietType: 'veg',
            isAvailable: true
          }
        ];

    const orderItems = sampleDishes.map(d => ({
      id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      menuItemId: d.id,
      name: d.name,
      hindiName: d.hindiName,
      unitPrice: d.price,
      quantity: 1,
      totalPrice: d.price,
      dietType: d.dietType || 'non-veg'
    }));

    const newOrder = await api.placeOrder({
      restaurantId: restaurant.id,
      tableNumber: tableNum,
      customerName: 'Live Demo Guest',
      customerPhone: '9876543210',
      items: orderItems,
      specialNotes: '⚡ Live Test Order (Spicy & Fresh)'
    });

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    playNotificationChime('order');
    showToast('⚡ Live Test Order Placed!', `${newOrder.orderNumber} placed for Table #${newOrder.tableNumber} (₹${newOrder.grandTotal})`, 'success');
    return newOrder;
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        adminTab,
        setAdminTab,
        activeRestaurantSlug,
        setActiveRestaurantSlug,
        activeTableNumber,
        setActiveTableNumber,
        isTableLockedFromQr,
        setIsTableLockedFromQr,
        openCustomerMenuForTable,
        currentStaff,
        setCurrentStaff,
        userRole,
        setUserRole,
        restaurant,
        restaurants: allRestaurants,
        allRestaurants,
        categories,
        menuItems,
        tables,
        orders,
        waiterRequests,
        staffList,
        isLoading,
        error,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        isTableSelectorOpen,
        setIsTableSelectorOpen,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTaxAmount,
        cartGrandTotal,
        customerOrders,
        activeOrderModal,
        setActiveOrderModal,
        selectedFoodDetail,
        setSelectedFoodDetail,
        isCallWaiterOpen,
        setIsCallWaiterOpen,
        isBillRequestOpen,
        setIsBillRequestOpen,
        isCartOpen,
        setIsCartOpen,
        language,
        setLanguage,
        t,
        searchQuery,
        setSearchQuery,
        dietFilter,
        setDietFilter,
        selectedCategoryId,
        setSelectedCategoryId,
        soundEnabled,
        setSoundEnabled,
        toast: toastMessage,
        toastMessage,
        showToast,
        closeToast,
        isSecretAdminOpen,
        setIsSecretAdminOpen,
        openSecretAdminModal,
        closeSecretAdminModal,
        isAdminUnlocked,
        unlockAdminWithPassword,
        lockAdmin,
        refreshData,
        placeCustomerOrder,
        submitWaiterCall,
        updateOrderStatus,
        updateOrderPayment,
        deleteOrder,
        clearAllOrders,
        clearAllWaiterRequests,
        resolveWaiterCall,
        switchRestaurantAndTable,
        addTable,
        updateTable,
        deleteTable,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addCategory,
        updateCategory,
        deleteCategory,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        updateRestaurantBranding,
        updateRestaurantProfile: updateRestaurantBranding,
        sendTestLiveOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

