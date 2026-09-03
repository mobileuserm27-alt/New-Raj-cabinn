export type Language = 'en' | 'hi';

export interface Translations {
  scanAndDine: string;
  table: string;
  callWaiter: string;
  needWater: string;
  requestBill: string;
  needHelp: string;
  cleanTable: string;
  searchDishes: string;
  allCategories: string;
  vegOnly: string;
  nonVegOnly: string;
  all: string;
  chefSpecial: string;
  popular: string;
  add: string;
  added: string;
  customizable: string;
  viewCart: string;
  items: string;
  cart: string;
  yourOrder: string;
  subtotal: string;
  taxes: string;
  grandTotal: string;
  placeOrder: string;
  placingOrder: string;
  orderSuccess: string;
  orderId: string;
  prepTime: string;
  orderStatus: string;
  orderReceived: string;
  accepted: string;
  preparing: string;
  ready: string;
  served: string;
  specialInstructions: string;
  specialInstructionsPlaceholder: string;
  guestNameOptional: string;
  phoneNumberOptional: string;
  selectVariant: string;
  optionalAddons: string;
  spiceLevel: string;
  billRequested: string;
  billRequestedSuccess: string;
  waiterDispatched: string;
  emptyCart: string;
  noDishesFound: string;
  tryAdjustingFilters: string;
  closed: string;
  open: string;
  mins: string;
  trackOrder: string;
  close: string;
  cancel: string;
  confirm: string;
  cancelOrder: string;
  cancelOrderConfirmTitle: string;
  cancelOrderConfirmDesc: string;
  orderCancelled: string;
  orderCancelledNotice: string;
  orderAgain: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    scanAndDine: 'Scan & Dine',
    table: 'Table',
    callWaiter: 'Call Waiter',
    needWater: 'Need Water',
    requestBill: 'Request Bill',
    needHelp: 'Need Help',
    cleanTable: 'Clean Table',
    searchDishes: 'Search food, biryani, paneer, drinks...',
    allCategories: 'All Categories',
    vegOnly: 'Veg Only',
    nonVegOnly: 'Non-Veg Only',
    all: 'All',
    chefSpecial: "Chef's Special",
    popular: 'Bestseller',
    add: 'ADD',
    added: 'ADDED',
    customizable: 'Customizable',
    viewCart: 'View Cart',
    items: 'Items',
    cart: 'Your Food Cart',
    yourOrder: 'Your Table Order',
    subtotal: 'Item Total',
    taxes: 'GST & Taxes (5%)',
    grandTotal: 'To Pay',
    placeOrder: 'Place Order',
    placingOrder: 'Sending to Kitchen...',
    orderSuccess: 'Order Placed Successfully! 🎉',
    orderId: 'Order ID',
    prepTime: 'Estimated Time',
    orderStatus: 'Live Order Status',
    orderReceived: 'Order Received',
    accepted: 'Accepted',
    preparing: 'Cooking in Kitchen',
    ready: 'Ready to Serve',
    served: 'Served at Table',
    specialInstructions: 'Special Cooking Instructions',
    specialInstructionsPlaceholder: 'e.g., Less spicy, no coriander, extra crispy...',
    guestNameOptional: 'Your Name (Optional)',
    phoneNumberOptional: 'Phone Number (For digital receipt)',
    selectVariant: 'Choose Size / Portion',
    optionalAddons: 'Enhance Your Dish (Add-ons)',
    spiceLevel: 'Spice Level',
    billRequested: 'Request Bill',
    billRequestedSuccess: 'Bill requested! Staff will arrive with your invoice shortly.',
    waiterDispatched: 'Service request sent! Waiter is on the way to your table.',
    emptyCart: 'Your cart is empty',
    noDishesFound: 'No dishes match your search or filters',
    tryAdjustingFilters: 'Try clearing your veg/non-veg filter or search term.',
    closed: 'Closed for Dining',
    open: 'Open Now',
    mins: 'mins',
    trackOrder: 'Track Order',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    cancelOrder: 'Cancel Order',
    cancelOrderConfirmTitle: 'Cancel This Order?',
    cancelOrderConfirmDesc: 'The restaurant kitchen will be notified immediately to stop preparing your dishes.',
    orderCancelled: 'Order Cancelled',
    orderCancelledNotice: 'This order has been cancelled. No amount is due. You can place a new order anytime.',
    orderAgain: 'Order Again'
  },
  hi: {
    scanAndDine: 'स्कैन एंड डाइन',
    table: 'टेबल नं.',
    callWaiter: 'वेटर बुलाएं',
    needWater: 'पानी चाहिए',
    requestBill: 'बिल मांगें',
    needHelp: 'मदद चाहिए',
    cleanTable: 'टेबल साफ करें',
    searchDishes: 'खाना, पनीर, बिरयानी या ड्रिंक्स खोजें...',
    allCategories: 'सभी श्रेणियां',
    vegOnly: 'केवल शाकाहारी',
    nonVegOnly: 'मांसाहारी',
    all: 'सब',
    chefSpecial: 'शेफ स्पेशल',
    popular: 'लोकप्रिय',
    add: 'जोड़ें',
    added: 'जुड़ गया',
    customizable: 'कस्टमाइज़',
    viewCart: 'कार्ट देखें',
    items: 'आइटम',
    cart: 'आपकी कार्ट',
    yourOrder: 'आपका ऑर्डर',
    subtotal: 'कुल योग',
    taxes: 'जीएसटी और टैक्स (5%)',
    grandTotal: 'कुल देय राशि',
    placeOrder: 'ऑर्डर भेजें',
    placingOrder: 'रसोई में भेजा जा रहा है...',
    orderSuccess: 'ऑर्डर सफलतापूर्वक दर्ज हुआ! 🎉',
    orderId: 'ऑर्डर नं.',
    prepTime: 'अनुमानित समय',
    orderStatus: 'लाइव ऑर्डर स्थिति',
    orderReceived: 'ऑर्डर मिला',
    accepted: 'स्वीकृत',
    preparing: 'किचन में बन रहा है',
    ready: 'तैयार है',
    served: 'टेबल पर परोसा गया',
    specialInstructions: 'खास निर्देश',
    specialInstructionsPlaceholder: 'जैसे कम तीखा, बिना धनिया, एक्स्ट्रा क्रिस्पी...',
    guestNameOptional: 'आपका नाम (वैकल्पिक)',
    phoneNumberOptional: 'मोबाइल नंबर (बिल के लिए)',
    selectVariant: 'पोर्शन / साइज़ चुनें',
    optionalAddons: 'अतिरिक्त ऐड-ऑन्स',
    spiceLevel: 'तीखापन',
    billRequested: 'बिल का अनुरोध करें',
    billRequestedSuccess: 'बिल का अनुरोध भेजा गया! स्टाफ जल्द आपके पास पहुंचेगा।',
    waiterDispatched: 'अनुरोध दर्ज! वेटर आपकी टेबल की ओर आ रहा है।',
    emptyCart: 'आपकी कार्ट खाली है',
    noDishesFound: 'कोई व्यंजन नहीं मिला',
    tryAdjustingFilters: 'फ़िल्टर या खोज बदल कर देखें।',
    closed: 'अभी बंद है',
    open: 'खुला है',
    mins: 'मिनट',
    trackOrder: 'ऑर्डर देखें',
    close: 'बंद करें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    cancelOrder: 'ऑर्डर कैंसिल करें',
    cancelOrderConfirmTitle: 'क्या आप ऑर्डर कैंसिल करना चाहते हैं?',
    cancelOrderConfirmDesc: 'किचन को तुरंत सूचना भेज दी जाएगी ताकि आपका खाना न बनाया जाए।',
    orderCancelled: 'ऑर्डर कैंसिल हो गया',
    orderCancelledNotice: 'यह ऑर्डर कैंसिल कर दिया गया है। कोई बिल देय नहीं है। आप जब चाहें नया ऑर्डर कर सकते हैं।',
    orderAgain: 'नया ऑर्डर करें'
  }
};
