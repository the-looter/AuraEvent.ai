export type EventType = 'wedding' | 'birthday' | 'community' | 'custom';

export type PlannerRole = 'lead_planner' | 'budget_manager' | 'logistics_decor' | 'client_host';

export interface Collaborator {
  id: string;
  name: string;
  role: PlannerRole;
  title: string;
  avatar: string;
  color: string;
  status: 'online' | 'idle' | 'offline';
  currentSection?: string;
  isCurrentUser?: boolean;
}

export type BudgetCategory = 
  | 'Venue' 
  | 'Catering & Bar' 
  | 'Decor & Florals' 
  | 'Photography & Video' 
  | 'Music & Entertainment' 
  | 'Rentals & Attire' 
  | 'Permits & Security' 
  | 'Contingency' 
  | 'Other';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  title: string;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  status: 'planned' | 'deposit_paid' | 'paid_in_full' | 'negotiating';
  notes: string;
  assignedTo: string; // collaborator id
  priority: 'essential' | 'recommended' | 'luxury';
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  assignedTo: string;
  category: string;
}

export interface TimelinePhase {
  id: string;
  name: string;
  timeframe: string;
  items: TimelineItem[];
}

export interface DayOfScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  leadPerson: string;
  notes: string;
  completed: boolean;
}

export type VendorStatus = 
  | 'researching' 
  | 'contacted' 
  | 'proposal_received' 
  | 'contract_signed' 
  | 'paid';

export interface VendorItem {
  id: string;
  category: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  quotedPrice: number;
  finalPrice: number;
  status: VendorStatus;
  rating: number;
  notes: string;
  tags: string[];
}

export type IdeaCategory = 
  | 'Theme & Decor' 
  | 'Signature Menu' 
  | 'Entertainment & Music' 
  | 'Guest Experience' 
  | 'Gifts & Favors';

export interface CreativeIdea {
  id: string;
  category: IdeaCategory;
  title: string;
  description: string;
  estimatedCostTier: '$' | '$$' | '$$$';
  tags: string[];
  saved: boolean;
  notes?: string;
}

export interface CollaborativeComment {
  id: string;
  collaboratorId: string;
  targetType: 'general' | 'budget' | 'timeline' | 'vendor' | 'idea';
  targetId?: string;
  content: string;
  timestamp: string;
}

export interface ActivityLogItem {
  id: string;
  collaboratorId: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface EventPlan {
  id: string;
  title: string;
  eventType: EventType;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  theme: string;
  vibeKeywords: string[];
  coverImage: string;
  budgetItems: BudgetItem[];
  timelinePhases: TimelinePhase[];
  dayOfSchedule: DayOfScheduleItem[];
  vendors: VendorItem[];
  creativeIdeas: CreativeIdea[];
  collaborators: Collaborator[];
  comments: CollaborativeComment[];
  activityLog: ActivityLogItem[];
  notes: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  actionType?: 'add_budget' | 'add_timeline' | 'add_idea' | 'add_vendor';
  actionPayload?: any;
}
