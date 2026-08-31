export type UserRole = 'superadmin' | 'owner' | 'manager' | 'waiter' | 'kitchen';
export type StaffRole = UserRole;

export type AdminTab =
  | 'orders'
  | 'kds'
  | 'waiter_calls'
  | 'menu'
  | 'categories'
  | 'tables'
  | 'billing'
  | 'analytics'
  | 'staff'
  | 'profile'
  | 'onboarding';

export type OrderStatus = 'received' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'counter';

export type SpiceLevel = 'none' | 'mild' | 'medium' | 'spicy' | 'extra_spicy';
export type FoodDietType = 'veg' | 'non_veg' | 'vegan' | 'egg';

export interface MenuItemVariant {
  id: string;
  name: string; // e.g. "Half", "Full", "Small", "Large"
  price: number;
}

export interface MenuItemAddon {
  id: string;
  name: string; // e.g. "Extra Butter", "Extra Cheese", "Garlic Butter Dip"
  price: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  hindiName?: string;
  description: string;
  price: number; // Base price
  dietType: FoodDietType;
  spiceLevel: SpiceLevel;
  imageUrl: string;
  isAvailable: boolean;
  isPopular?: boolean;
  isChefSpecial?: boolean;
  preparationTimeMinutes?: number;
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
  calories?: number;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  hindiName?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}
export type MenuCategory = Category;

export interface TableInfo {
  id: string;
  restaurantId: string;
  tableNumber: string; // e.g. "1", "12", "T-05", "Outdoor 2"
  capacity: number;
  status: 'available' | 'occupied' | 'bill_requested' | 'reserved';
  currentOrderId?: string;
  qrCodeUrl?: string; // Target URL e.g. /menu/royal-spice-001/table/12
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  selectedVariant?: MenuItemVariant;
  selectedAddons: MenuItemAddon[];
  quantity: number;
  specialInstructions?: string;
  itemPrice: number; // calculated variant or base + addons
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  dietType: FoodDietType;
  selectedVariantName?: string;
  selectedAddonNames?: string[];
  specialInstructions?: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#SD10245"
  restaurantId: string;
  tableId: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number; // GST (e.g. 5%)
  serviceCharge: number;
  discount: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  orderType?: 'dine_in' | 'takeaway' | 'delivery';
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedPrepTimeMinutes: number;
}

export interface WaiterRequest {
  id: string;
  restaurantId: string;
  tableNumber: string;
  requestType: 'call_waiter' | 'water' | 'bill' | 'help' | 'clean_table';
  note?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}
export type WaiterCallRequest = WaiterRequest;

export interface BillRequest {
  id: string;
  restaurantId: string;
  tableNumber: string;
  orderId?: string;
  paymentMethodPreference?: PaymentMethod;
  status: 'pending' | 'printed' | 'settled';
  createdAt: string;
  totalAmount: number;
}

export interface RestaurantBranding {
  primaryColor: string; // hex
  secondaryColor?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  tagline?: string;
  currencySymbol: string; // e.g. "₹"
  taxPercentage: number; // e.g. 5%
  serviceChargePercentage: number; // e.g. 0% or 5%
  gstNumber?: string;
}

export interface Restaurant {
  id: string;
  slug: string; // e.g. "royal-spice-001"
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  cuisineTypes: string[]; // e.g. ["North Indian", "Mughlai", "Biryani"]
  dietaryType: 'all' | 'pure_veg' | 'non_veg_available';
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openingHours: string; // e.g. "11:00 AM - 11:30 PM"
  branding: RestaurantBranding;
  planId: 'free' | 'basic' | 'pro' | 'premium';
  isSuspended: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: 'free' | 'basic' | 'pro' | 'premium';
  name: string;
  priceMonthly: number; // in INR
  description: string;
  features: string[];
  isPopular?: boolean;
  maxTables: number;
  maxMenuItems: number;
}

export interface StaffMember {
  id: string;
  restaurantId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  pin: string;
  isActive: boolean;
  createdAt?: string;
}

export interface RestaurantAnalytics {
  todaySales: number;
  todayOrdersCount: number;
  activeOrdersCount: number;
  pendingOrdersCount: number;
  completedOrdersCount: number;
  waiterRequestsCount: number;
  averageOrderValue: number;
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  hourlyPeakTimes: { hour: string; orders: number }[];
  popularDishes: { name: string; count: number; revenue: number }[];
  activeTablesStats: { tableNumber: string; ordersCount: number; totalSales: number }[];
}

export interface AnalyticsSummary {
  todaySales: number;
  todayOrders: number;
  pendingOrders: number;
  activeOrders: number;
  waiterCalls: number;
  dailySales: { date: string; sales: number }[];
  hourlyPeak: { hour: string; orders: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
}

export interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  monthlyGrowthRate: number;
}
