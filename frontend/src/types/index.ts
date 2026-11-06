export type CarStatus = 'available' | 'reserved' | 'sold' | 'archived';
export type CarCondition = 'New' | 'Certified Pre-Owned' | 'Used';

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  cars_count?: number;
}

export interface CarModel {
  id: number;
  brand_id: number;
  name: string;
  body_type: string;
  brand?: Brand;
}

export interface ShowroomSlot {
  id: number;
  floor_id: number;
  label: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  rotation_y: number;
  type: 'indoor' | 'outdoor' | 'service';
  car?: Car;
  floor?: ShowroomFloor;
}

export interface ShowroomFloor {
  id: number;
  showroom_id: number;
  name: string;
  level: number;
  model_url?: string;
  navmesh_url?: string;
  scale: number;
  slots?: ShowroomSlot[];
}

export interface Showroom {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  opening_hours: string;
  image?: string;
  floors?: ShowroomFloor[];
  slots?: ShowroomSlot[];
  cars_count?: number;
  available_cars_count?: number;
}

export interface CarColorVariant {
  name: string;
  hex: string;
  roughness?: number;
  metalness?: number;
}

export interface CarWheelVariant {
  name: string;
  code: string;
  price?: number;
}

export interface CarModel3D {
  id: number;
  car_id: number;
  glb_url: string;
  variants?: {
    colors?: CarColorVariant[];
    wheels?: CarWheelVariant[];
    interior?: { name: string; code: string }[];
  };
  interior_camera?: {
    position: [number, number, number];
    target: [number, number, number];
  };
}

export interface CarImage {
  id: number;
  car_id: number;
  url: string;
  type: 'gallery' | '360' | 'interior';
  sort_order: number;
}

export interface Feature {
  id: number;
  name: string;
  category: string;
  icon?: string;
}

export interface Car {
  id: number;
  model_id: number;
  showroom_id: number;
  slot_id: number | null;
  title: string;
  slug: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  color: string;
  vin: string;
  condition: CarCondition;
  description: string;
  status: CarStatus;
  is_featured: boolean;
  location_updated_at?: string;
  model?: CarModel;
  showroom?: Showroom;
  slot?: ShowroomSlot;
  images?: CarImage[];
  model3d?: CarModel3D;
  features?: Feature[];
}

export interface KioskConfig {
  id: number;
  name: string;
  token: string;
  showroom: Showroom;
  floor: ShowroomFloor;
  kiosk_position: {
    x: number;
    y: number;
    z: number;
  };
  attract_video_url: string;
  idle_timeout_seconds: number;
}

export interface KioskNavigation {
  kiosk_position: { x: number; y: number; z: number };
  slot_coordinates: {
    label: string;
    x: number;
    y: number;
    z: number;
    rotation_y: number;
  } | null;
  waypoints: { x: number; y: number; z: number }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'manager' | 'sales_staff' | 'showroom_staff' | 'customer';
  showroom_id?: number;
  showroom?: Showroom;
}

export interface Enquiry {
  id: number;
  car_id: number;
  user_id?: number;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
  car?: Car;
}

export interface TestDrive {
  id: number;
  car_id: number;
  user_id?: number;
  name: string;
  phone: string;
  email?: string;
  date_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  car?: Car;
}

export interface Reservation {
  id: number;
  car_id: number;
  user_id?: number;
  name: string;
  phone: string;
  email?: string;
  amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  created_at: string;
  car?: Car;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  action: string;
  subject?: string;
  meta?: any;
  created_at: string;
  user?: User;
}

export interface DashboardStats {
  overview: {
    total_cars: number;
    available_cars: number;
    reserved_cars: number;
    sold_cars: number;
    inventory_value: number;
    average_price: number;
    total_enquiries: number;
    total_test_drives: number;
    total_reservations: number;
    total_sales_revenue: number;
    total_kiosks: number;
    online_kiosks: number;
    kiosk_leads: number;
    kiosk_sessions: number;
  };
  charts: {
    monthly_sales: { month: string; revenue: number; units: number }[];
    brand_distribution: { name: string; count: number }[];
  };
  recent_activities: ActivityLog[];
}

