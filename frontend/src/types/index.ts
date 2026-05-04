/**
 * TypeScript interfaces matching backend Pydantic schemas.
 */

// === Auth ===
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

// === Profile ===
export interface Profile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  tagline: string | null;
  social_links: Record<string, string>;
  resume_url: string | null;
  location: string | null;
  email: string | null;
  dob: string | null;
  created_at: string;
  updated_at: string;
}

// === Experience ===
export interface Experience {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  tech_stack: string[];
  logo_url: string | null;
  is_current: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

// === Project ===
export interface Project {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  cover_image: string | null;
  featured: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

// === Blog ===
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string;
  tags: string[];
  published_at: string | null;
  cover_image: string | null;
  is_published: boolean;
  views: number;
  reading_time: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  published_at: string | null;
  cover_image: string | null;
  is_published: boolean;
  views: number;
  reading_time: number;
  created_at: string;
}

// === Skill ===
export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon_url: string | null;
  order: number;
  created_at: string;
}

// === Testimonial ===
export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  company: string | null;
  avatar: string | null;
  text: string;
  is_featured: boolean;
  order: number;
  created_at: string;
}

// === Site Settings ===
export interface SiteSettings {
  id: string;
  meta_title: string;
  meta_description: string;
  og_image: string | null;
  favicon: string | null;
  accent_color: string;
  maintenance_mode: boolean;
  updated_at: string;
}

// === Contact ===
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// === Birthday ===
export interface BirthdayEvent {
  id: string;
  year: number;
  birthday_date: string;
  title: string;
  message_from_milan: string | null;
  restaurant_info: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BirthdayActiveResponse {
  event: BirthdayEvent;
  countdown_seconds: number;
  age: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
  is_veg: boolean;
  order: number;
  created_at: string;
}

export interface MenuSelectionItem {
  menu_item_id: string;
  quantity: number;
}

export interface RSVPCreate {
  event_id: string;
  guest_name: string;
  guest_email?: string;
  party_type: "room_party" | "restaurant";
  table_guests?: number;
  special_note?: string;
  menu_selections: MenuSelectionItem[];
}

export interface RSVPMenuSelection {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
}

export interface RSVP {
  id: string;
  event_id: string;
  guest_name: string;
  guest_email: string | null;
  party_type: string;
  table_guests: number | null;
  special_note: string | null;
  menu_selections: RSVPMenuSelection[];
  created_at: string;
}

export interface Wish {
  guest_name: string;
  special_note: string | null;
  party_type: string;
  created_at: string;
}

// === Admin Stats ===
export interface AdminStats {
  total_blog_views: number;
  total_blog_posts: number;
  published_posts: number;
  total_rsvps: number;
  room_party_rsvps: number;
  restaurant_rsvps: number;
  unread_messages: number;
  active_event: string | null;
}
