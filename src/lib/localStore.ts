import {
  Category,
  MenuItem,
  Order,
  OrderItem,
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
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_RESTAURANTS,
  INITIAL_STAFF,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TABLES,
  INITIAL_WAITER_REQUESTS
} from '../data/initialData';

const STORAGE_KEYS = {
  RESTAURANTS: 'snd_offline_restaurants',
  CATEGORIES: 'snd_offline_categories',
  MENU_ITEMS: 'snd_offline_menu_items',
  TABLES: 'snd_offline_tables',
  ORDERS: 'snd_offline_orders',
  WAITER_REQUESTS: 'snd_offline_waiter_requests',
  STAFF: 'snd_offline_staff',
  SUBSCRIPTIONS: 'snd_offline_subscriptions'
};

function getItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`LocalStore parse error for ${key}:`, e);
    return defaultVal;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`LocalStore save error for ${key}:`, e);
  }
}

class LocalStoreEngine {
  private restaurants: Restaurant[];
  private categories: Category[];
  private menuItems: MenuItem[];
  private tables: TableInfo[];
  private orders: Order[];
  private waiterRequests: WaiterRequest[];
  private staff: StaffMember[];
  private subscriptions: SubscriptionPlan[];
  private orderCounter: number = 10300;

  constructor() {
    this.restaurants = getItem(STORAGE_KEYS.RESTAURANTS, [...INITIAL_RESTAURANTS]);
    this.categories = getItem(STORAGE_KEYS.CATEGORIES, [...INITIAL_CATEGORIES]);
    this.menuItems = getItem(STORAGE_KEYS.MENU_ITEMS, [...INITIAL_MENU_ITEMS]);
    this.tables = getItem(STORAGE_KEYS.TABLES, [...INITIAL_TABLES]);
    this.orders = getItem(STORAGE_KEYS.ORDERS, [...INITIAL_ORDERS]);
    this.waiterRequests = getItem(STORAGE_KEYS.WAITER_REQUESTS, [...INITIAL_WAITER_REQUESTS]);
    this.staff = getItem(STORAGE_KEYS.STAFF, [...INITIAL_STAFF]);
    this.subscriptions = getItem(STORAGE_KEYS.SUBSCRIPTIONS, [...INITIAL_SUBSCRIPTIONS]);

    // Ensure New Raj Cabin and all essentials exist and are populated
    if (!this.restaurants || this.restaurants.length === 0 || !this.restaurants.some(r => r.slug === 'raj-cabin')) {
      this.restaurants = [...INITIAL_RESTAURANTS];
      this.saveRestaurants();
    } else {
      // Preserve restaurant branding and any custom name set by admin (e.g. New-Raj-Cabin)
      const raj = this.restaurants.find(r => r.id === 'rest_raj_001' || r.slug === 'raj-cabin');
      if (raj) {
        let updated = false;
        if (!raj.name) {
          raj.name = 'New-Raj-Cabin';
          updated = true;
        }
        if (!raj.branding?.coverImageUrl) {
          raj.branding = {
            ...raj.branding,
            coverImageUrl: '/images/raj-cabin-grand-facade.jpg'
          };
          updated = true;
        }
        if (!raj.branding?.logoUrl) {
          raj.branding = {
            ...raj.branding,
            logoUrl: '/images/raj-cabin-logo.jpg'
          };
          updated = true;
        }
        if (updated) {
          this.saveRestaurants();
        }
      }
    }
    if (!this.categories || this.categories.length === 0) {
      this.categories = [...INITIAL_CATEGORIES];
      this.saveCategories();
    }
    if (!this.menuItems || this.menuItems.length === 0) {
      this.menuItems = [...INITIAL_MENU_ITEMS];
      this.saveMenuItems();
    }
    if (!this.tables || this.tables.length === 0) {
      this.tables = [...INITIAL_TABLES];
      this.saveTables();
    }

    // Purge old (>12 hrs) local orders so they don't lock tables across devices
    const now = Date.now();
    const freshOrders = this.orders.filter(o => {
      const ageHours = o.createdAt ? (now - new Date(o.createdAt).getTime()) / 3600000 : 999;
      return ageHours < 12;
    });
    if (freshOrders.length !== this.orders.length) {
      this.orders = freshOrders;
      this.saveOrders();
    }

    // Determine max existing order number to guarantee strictly unique incremental IDs
    const existingOrderNums = this.orders.map(o => {
      const m = (o.orderNumber || '').match(/\d+/);
      return m ? parseInt(m[0], 10) : 10300;
    });
    this.orderCounter = existingOrderNums.length > 0 ? Math.max(10300, ...existingOrderNums) : 10300;

    // Sanitize any existing orders that accidentally share identical order numbers
    const seenOrderNumbers = new Set<string>();
    let changed = false;
    let autoCounter = 10301;
    this.orders.forEach(o => {
      if (!o.orderNumber || seenOrderNumbers.has(o.orderNumber)) {
        while (seenOrderNumbers.has(`#RC-${autoCounter}`)) {
          autoCounter++;
        }
        o.orderNumber = `#RC-${autoCounter}`;
        seenOrderNumbers.add(o.orderNumber);
        autoCounter++;
        changed = true;
      } else {
        seenOrderNumbers.add(o.orderNumber);
      }
    });
    if (changed) {
      this.orderCounter = Math.max(this.orderCounter, autoCounter);
      this.saveOrders();
    }
  }

  private saveRestaurants() { setItem(STORAGE_KEYS.RESTAURANTS, this.restaurants); }
  private saveCategories() { setItem(STORAGE_KEYS.CATEGORIES, this.categories); }
  private saveMenuItems() { setItem(STORAGE_KEYS.MENU_ITEMS, this.menuItems); }
  private saveTables() { setItem(STORAGE_KEYS.TABLES, this.tables); }
  private saveOrders() { setItem(STORAGE_KEYS.ORDERS, this.orders); }
  private saveWaiterRequests() { setItem(STORAGE_KEYS.WAITER_REQUESTS, this.waiterRequests); }
  private saveStaff() { setItem(STORAGE_KEYS.STAFF, this.staff); }
  private saveSubscriptions() { setItem(STORAGE_KEYS.SUBSCRIPTIONS, this.subscriptions); }

  // --- RESTAURANTS ---
  getAllRestaurants(): Restaurant[] {
    return this.restaurants;
  }

  getRestaurantBySlug(slug: string): Restaurant | null {
    return this.restaurants.find(r => r.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  getRestaurantById(id: string): Restaurant | null {
    return this.restaurants.find(r => r.id === id) || null;
  }

  createRestaurant(data: Partial<Restaurant>): Restaurant {
    const newRest: Restaurant = {
      id: `rest_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : `rest-${Date.now()}`),
      name: data.name || 'New Restaurant',
      description: data.description || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      city: data.city || 'Kolkata',
      state: data.state || 'West Bengal',
      pincode: data.pincode || '',
      cuisineTypes: data.cuisineTypes || ['Multi-Cuisine'],
      dietaryType: data.dietaryType || 'non_veg_available',
      rating: 4.8,
      reviewCount: 1,
      isOpen: true,
      openingHours: data.openingHours || '11:00 AM - 11:00 PM',
      planId: data.planId || 'pro',
      isSuspended: false,
      createdAt: new Date().toISOString(),
      branding: {
        primaryColor: data.branding?.primaryColor || '#e11d48',
        secondaryColor: data.branding?.secondaryColor || '#f59e0b',
        logoUrl: data.branding?.logoUrl || '/images/raj-cabin-logo.jpg',
        coverImageUrl: data.branding?.coverImageUrl || '/images/raj-cabin-exterior.jpg',
        tagline: data.branding?.tagline || 'Multi-Cuisine Dining',
        currencySymbol: data.branding?.currencySymbol || '₹',
        taxPercentage: data.branding?.taxPercentage ?? 0,
        serviceChargePercentage: data.branding?.serviceChargePercentage ?? 0,
        gstNumber: data.branding?.gstNumber || ''
      }
    };
    this.restaurants.push(newRest);
    this.saveRestaurants();
    return newRest;
  }

  updateRestaurant(id: string, data: Partial<Restaurant>): Restaurant | null {
    const idx = this.restaurants.findIndex(r => r.id === id || r.slug === id);
    if (idx === -1) return null;
    this.restaurants[idx] = {
      ...this.restaurants[idx],
      ...data,
      branding: {
        ...this.restaurants[idx].branding,
        ...(data.branding || {})
      }
    };
    this.saveRestaurants();
    return this.restaurants[idx];
  }

  toggleSuspendRestaurant(id: string): Restaurant | null {
    const idx = this.restaurants.findIndex(r => r.id === id || r.slug === id);
    if (idx === -1) return null;
    this.restaurants[idx].isSuspended = !this.restaurants[idx].isSuspended;
    this.saveRestaurants();
    return this.restaurants[idx];
  }

  // --- CATEGORIES ---
  getCategories(restaurantId: string): Category[] {
    let list = this.categories
      .filter(c => c.restaurantId === restaurantId || c.restaurantId === 'rest_raj_001')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (!list || list.length === 0) {
      this.categories = [...INITIAL_CATEGORIES];
      this.saveCategories();
      list = [...INITIAL_CATEGORIES];
    }
    return list;
  }

  createCategory(restaurantId: string, name: string, hindiName?: string): Category {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      restaurantId,
      name,
      hindiName: hindiName || name,
      sortOrder: this.categories.length + 1,
      isActive: true
    };
    this.categories.push(newCat);
    this.saveCategories();
    return newCat;
  }

  updateCategory(catId: string, data: Partial<Category>): Category | null {
    const idx = this.categories.findIndex(c => c.id === catId);
    if (idx === -1) return null;
    this.categories[idx] = { ...this.categories[idx], ...data };
    this.saveCategories();
    return this.categories[idx];
  }

  deleteCategory(catId: string): boolean {
    const initialLen = this.categories.length;
    this.categories = this.categories.filter(c => c.id !== catId);
    this.saveCategories();
    return this.categories.length < initialLen;
  }

  // --- MENU ITEMS ---
  getMenuItems(restaurantId: string): MenuItem[] {
    let list = this.menuItems.filter(m => m.restaurantId === restaurantId || m.restaurantId === 'rest_raj_001');
    if (!list || list.length === 0) {
      this.menuItems = [...INITIAL_MENU_ITEMS];
      this.saveMenuItems();
      list = [...INITIAL_MENU_ITEMS];
    }
    return list;
  }

  createMenuItem(restaurantId: string, data: Partial<MenuItem>): MenuItem {
    const newItem: MenuItem = {
      id: `item_${Date.now()}`,
      restaurantId,
      categoryId: data.categoryId || this.categories[0]?.id || 'cat_rc_1',
      name: data.name || 'New Item',
      hindiName: data.hindiName || data.name || 'नया आइटम',
      description: data.description || '',
      price: data.price || 100,
      dietType: data.dietType || 'veg',
      spiceLevel: data.spiceLevel || 'medium',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&h=400&q=80',
      isAvailable: data.isAvailable !== false,
      isPopular: !!data.isPopular,
      isChefSpecial: !!data.isChefSpecial,
      preparationTimeMinutes: data.preparationTimeMinutes || 15,
      variants: data.variants || [],
      addons: data.addons || []
    };
    this.menuItems.push(newItem);
    this.saveMenuItems();
    return newItem;
  }

  updateMenuItem(itemId: string, data: Partial<MenuItem>): MenuItem | null {
    const idx = this.menuItems.findIndex(m => m.id === itemId);
    if (idx === -1) return null;
    this.menuItems[idx] = { ...this.menuItems[idx], ...data };
    this.saveMenuItems();
    return this.menuItems[idx];
  }

  deleteMenuItem(itemId: string): boolean {
    const initialLen = this.menuItems.length;
    this.menuItems = this.menuItems.filter(m => m.id !== itemId);
    this.saveMenuItems();
    return this.menuItems.length < initialLen;
  }

  // --- TABLES ---
  getTables(restaurantId: string): TableInfo[] {
    return this.tables.filter(t => t.restaurantId === restaurantId || t.restaurantId === 'rest_raj_001');
  }

  createTable(restaurantId: string, tableNumber: string, capacity: number = 4): TableInfo {
    const newTbl: TableInfo = {
      id: `tbl_${Date.now()}`,
      restaurantId,
      tableNumber,
      capacity,
      status: 'available'
    };
    this.tables.push(newTbl);
    this.saveTables();
    return newTbl;
  }

  updateTable(tableId: string, data: Partial<TableInfo>): TableInfo | null {
    const idx = this.tables.findIndex(t => t.id === tableId || t.tableNumber === tableId);
    if (idx === -1) return null;
    this.tables[idx] = { ...this.tables[idx], ...data };
    this.saveTables();
    return this.tables[idx];
  }

  deleteTable(tableId: string): boolean {
    const initialLen = this.tables.length;
    this.tables = this.tables.filter(t => t.id !== tableId && t.tableNumber !== tableId);
    this.saveTables();
    return this.tables.length < initialLen;
  }

  setAllMenuItems(items: MenuItem[]) {
    this.menuItems = items;
    this.saveMenuItems();
  }

  setAllCategories(categories: Category[]) {
    this.categories = categories;
    this.saveCategories();
  }

  setAllTables(tables: TableInfo[]) {
    this.tables = tables;
    this.saveTables();
  }

  // --- ORDERS ---
  getOrders(restaurantId: string): Order[] {
    return this.orders.filter(o => o.restaurantId === restaurantId || o.restaurantId === 'rest_raj_001');
  }

  getOrder(orderId: string): Order | null {
    return this.orders.find(o => o.id === orderId || o.orderNumber === orderId) || null;
  }

  getTableOrders(restaurantId: string, tableNumber: string): Order[] {
    return this.orders.filter(
      o => (o.restaurantId === restaurantId || o.restaurantId === 'rest_raj_001') && o.tableNumber === tableNumber
    );
  }

  createOrder(data: {
    restaurantId: string;
    tableNumber: string;
    customerName?: string;
    customerPhone?: string;
    items: any[];
    specialNotes?: string;
  }): Order {
    this.orderCounter++;
    const subtotal = data.items.reduce((acc, it) => acc + (it.itemPrice || it.price || 0) * (it.quantity || 1), 0);
    const tax = 0;
    const total = subtotal + tax;

    const orderItems: OrderItem[] = data.items.map(it => {
      const p = it.price || it.itemPrice || 0;
      const q = it.quantity || 1;
      return {
        id: it.id || `oit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: it.menuItemId || it.menuItem?.id || it.id,
        name: it.name || it.menuItem?.name || 'Item',
        price: p,
        quantity: q,
        dietType: it.dietType || it.menuItem?.dietType || 'veg',
        selectedVariantName: it.selectedVariant?.name,
        selectedAddonNames: (it.selectedAddons || []).map((a: any) => a.name),
        specialInstructions: it.specialInstructions || '',
        totalPrice: p * q
      };
    });

    this.orderCounter += 1;
    const orderNumber = `#RC-${this.orderCounter}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      orderNumber,
      restaurantId: data.restaurantId || 'rest_raj_001',
      tableId: `tbl_${data.tableNumber}`,
      tableNumber: data.tableNumber,
      customerName: data.customerName || 'Dine-In Guest',
      customerPhone: data.customerPhone || '',
      items: orderItems,
      subtotal,
      taxAmount: tax,
      serviceCharge: 0,
      discount: 0,
      grandTotal: total,
      status: 'received' as OrderStatus,
      paymentStatus: 'pending' as PaymentStatus,
      paymentMethod: 'cash',
      specialNotes: data.specialNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedPrepTimeMinutes: 15
    };

    this.orders.unshift(newOrder);
    this.saveOrders();

    // Mark table occupied
    const tbl = this.tables.find(t => t.tableNumber === data.tableNumber);
    if (tbl) {
      tbl.status = 'occupied';
      tbl.currentOrderId = newOrder.id;
      this.saveTables();
    }

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    let idx = this.orders.findIndex(o => o.id === orderId);
    if (idx === -1) {
      idx = this.orders.findIndex(o => o.orderNumber === orderId);
    }
    if (idx === -1) return null;
    this.orders[idx].status = status;
    this.orders[idx].updatedAt = new Date().toISOString();
    this.saveOrders();
    return this.orders[idx];
  }

  updateOrderPayment(orderId: string, paymentStatus: PaymentStatus, paymentMethod?: string): Order | null {
    let idx = this.orders.findIndex(o => o.id === orderId);
    if (idx === -1) {
      idx = this.orders.findIndex(o => o.orderNumber === orderId);
    }
    if (idx === -1) return null;
    this.orders[idx].paymentStatus = paymentStatus;
    if (paymentMethod) {
      this.orders[idx].paymentMethod = paymentMethod as any;
    }
    this.orders[idx].updatedAt = new Date().toISOString();
    this.saveOrders();
    return this.orders[idx];
  }

  deleteOrder(orderId: string): boolean {
    const initialLen = this.orders.length;
    this.orders = this.orders.filter(o => o.id !== orderId);
    if (this.orders.length === initialLen) {
      this.orders = this.orders.filter(o => o.orderNumber !== orderId);
    }
    this.saveOrders();
    return this.orders.length < initialLen;
  }

  clearAllOrders(restaurantId: string): boolean {
    this.orders = this.orders.filter(o => o.restaurantId !== restaurantId && o.restaurantId !== 'rest_raj_001');
    this.saveOrders();
    return true;
  }

  // --- WAITER REQUESTS ---
  getWaiterRequests(restaurantId: string): WaiterRequest[] {
    return this.waiterRequests.filter(w => w.restaurantId === restaurantId || w.restaurantId === 'rest_raj_001');
  }

  createWaiterRequest(restaurantId: string, tableNumber: string, requestType: string, note?: string): WaiterRequest {
    const newReq: WaiterRequest = {
      id: `wreq_${Date.now()}`,
      restaurantId,
      tableNumber,
      requestType: requestType as any,
      status: 'pending',
      note: note || '',
      createdAt: new Date().toISOString()
    };
    this.waiterRequests.unshift(newReq);
    this.saveWaiterRequests();
    return newReq;
  }

  resolveWaiterRequest(requestId: string): WaiterRequest | null {
    const idx = this.waiterRequests.findIndex(w => w.id === requestId);
    if (idx === -1) return null;
    this.waiterRequests[idx].status = 'resolved';
    this.saveWaiterRequests();
    return this.waiterRequests[idx];
  }

  clearAllWaiterRequests(restaurantId: string): boolean {
    this.waiterRequests = this.waiterRequests.filter(w => w.restaurantId !== restaurantId && w.restaurantId !== 'rest_raj_001');
    this.saveWaiterRequests();
    return true;
  }

  // --- STAFF ---
  getStaff(restaurantId: string): StaffMember[] {
    return this.staff.filter(s => s.restaurantId === restaurantId || s.restaurantId === 'rest_raj_001');
  }

  createStaff(restaurantId: string, data: Partial<StaffMember>): StaffMember {
    const newStaff: StaffMember = {
      id: `staff_${Date.now()}`,
      restaurantId,
      name: data.name || 'New Staff',
      email: data.email || `staff_${Date.now()}@rajcabin.in`,
      phone: data.phone || '',
      role: (data.role || 'waiter') as any,
      pin: data.pin || '1111',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.staff.push(newStaff);
    this.saveStaff();
    return newStaff;
  }

  updateStaff(staffId: string, data: Partial<StaffMember>): StaffMember | null {
    const idx = this.staff.findIndex(s => s.id === staffId);
    if (idx === -1) return null;
    this.staff[idx] = { ...this.staff[idx], ...data } as StaffMember;
    this.saveStaff();
    return this.staff[idx];
  }

  deleteStaff(staffId: string): boolean {
    const initialLen = this.staff.length;
    this.staff = this.staff.filter(s => s.id !== staffId);
    this.saveStaff();
    return this.staff.length < initialLen;
  }

  // --- SUBSCRIPTIONS ---
  getSubscriptions(): SubscriptionPlan[] {
    return this.subscriptions;
  }

  updateSubscription(planId: string, data: Partial<SubscriptionPlan>): SubscriptionPlan | null {
    const idx = this.subscriptions.findIndex(s => s.id === planId);
    if (idx === -1) return null;
    this.subscriptions[idx] = { ...this.subscriptions[idx], ...data } as SubscriptionPlan;
    this.saveSubscriptions();
    return this.subscriptions[idx];
  }

  // --- ANALYTICS ---
  getAnalytics(restaurantId: string): RestaurantAnalytics {
    const restOrders = this.orders.filter(o => o.restaurantId === restaurantId || o.restaurantId === 'rest_raj_001');
    const totalSales = restOrders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' || o.status === 'served' ? o.grandTotal : 0), 0);
    const completedOrders = restOrders.filter(o => o.status === 'served').length;
    const pendingOrders = restOrders.filter(o => o.status === 'received').length;
    const activeOrders = restOrders.filter(o => o.status === 'accepted' || o.status === 'preparing' || o.status === 'ready').length;

    return {
      todaySales: totalSales,
      todayOrdersCount: restOrders.length,
      activeOrdersCount: activeOrders,
      pendingOrdersCount: pendingOrders,
      completedOrdersCount: completedOrders,
      waiterRequestsCount: this.waiterRequests.length,
      averageOrderValue: restOrders.length > 0 ? Math.round(totalSales / restOrders.length) : 0,
      dailyRevenue: [
        { date: 'Mon', revenue: 14200, orders: 48 },
        { date: 'Tue', revenue: 16800, orders: 55 },
        { date: 'Wed', revenue: 15400, orders: 50 },
        { date: 'Thu', revenue: 18900, orders: 62 },
        { date: 'Fri', revenue: 24500, orders: 78 },
        { date: 'Sat', revenue: 32000, orders: 104 },
        { date: 'Sun', revenue: 38500, orders: 122 }
      ],
      hourlyPeakTimes: [
        { hour: '12 PM', orders: 8 },
        { hour: '1 PM', orders: 15 },
        { hour: '2 PM', orders: 12 },
        { hour: '7 PM', orders: 14 },
        { hour: '8 PM', orders: 22 },
        { hour: '9 PM', orders: 19 }
      ],
      popularDishes: this.menuItems.slice(0, 5).map(m => ({
        name: m.name,
        count: Math.floor(Math.random() * 20) + 5,
        revenue: m.price * (Math.floor(Math.random() * 20) + 5)
      })),
      activeTablesStats: this.tables.map(t => ({
        tableNumber: t.tableNumber,
        ordersCount: 1,
        totalSales: 450
      }))
    };
  }

  getPlatformStats(): PlatformStats {
    return {
      totalRestaurants: this.restaurants.length,
      activeRestaurants: this.restaurants.filter(r => !r.isSuspended).length,
      totalOrders: 3840 + this.orders.length,
      totalRevenue: 584000,
      activeUsers: 14,
      monthlyGrowthRate: 18.5
    };
  }
}

export const localStore = new LocalStoreEngine();
