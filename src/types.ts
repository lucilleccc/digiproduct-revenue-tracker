export interface IncomeSource {
  id: string;
  name: string;
  userId: string;
}

export interface RevenueEntry {
  id: string;
  date: string; // YYYY-MM-DD
  sourceId: string;
  amount: number;
  notes?: string;
  userId: string;
  createdAt: any;
}

export interface UserGoal {
  id: string;
  dailyTarget: number;
  monthlyTarget: number;
  userId: string;
}

export interface DashboardStats {
  todayRevenue: number;
  dailyGoal: number;
  monthlyRevenue: number;
  monthlyGoal: number;
  last7Days: { date: string; amount: number }[];
  breakdown: { sourceId: string; sourceName: string; amount: number }[];
  compareYesterday: number; // percentage
}
