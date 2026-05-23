export type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "submitted"
  | "verified"
  | "rejected"
  | "expired";

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: string; // numeric from supabase
  currency: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: any;
  pay_by: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string;
  quantity: number;
  price_at_purchase: string;
  created_at: string;
};

export type OrderPaymentProof = {
  id: string;
  order_id: string;
  storage_path: string;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};
