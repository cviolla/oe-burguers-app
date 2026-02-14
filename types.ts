
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  category_id?: string;
  isBestSeller?: boolean;
  isPopular?: boolean;
  isActive?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  type: 'percentage' | 'fixed' | 'shipping';
}

export interface CartItem extends Product {
  quantity: number;
  options?: string[];
  cartId?: string;
}


export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;

  complement?: string;
  isDefault: boolean;
}

export interface ScheduledTime {
  date: string;
  time: string;
}

export interface DeliveryFee {
  id: string;
  neighborhood: string;
  fee_cents: number;
}

export type AppView = 'home' | 'menu' | 'coupons' | 'cart' | 'checkout' | 'profile' | 'notifications' | 'payment_methods' | 'product_detail' | 'receipt' | 'rating' | 'settings' | 'order_history' | 'addresses' | 'scheduling' | 'onboarding' | 'login' | 'legal' | 'editor' | 'store_info';
