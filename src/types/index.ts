// Navigation types
export type RootStackParamList = {
  SignIn: undefined;
  ForgotPassword: undefined;
  RequestAccess: undefined;
  Dashboard: undefined;
  SensorNetwork: undefined;
  SensorDetail: { sensorId: string };
  Analytics: undefined;
  DSM: undefined;
  Reports: undefined;
  CreateReport: undefined;
  SystemSettings: undefined;
  Account: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  ManageDevices: undefined;
  ActivityFeed: undefined;
};

// Sensor types
export interface Sensor {
  id: string;
  name: string;
  category: "Temperature" | "Humidity" | "Airflow" | "Pressure";
  status: "ONLINE" | "WARN" | "OFFLINE";
  zone: string;
  reading?: number;
  battery?: number;
  lastSeen?: string;
}

// Alert types
export interface Alert {
  id: string;
  type: "warning" | "info" | "error";
  title: string;
  description: string;
  timestamp: string;
  sensorId?: string;
  read: boolean;
}

// DSM types
export interface DSMRecommendation {
  id: string;
  zone: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  status: "Pending" | "Approved" | "Dismissed";
  priority: "High" | "Medium" | "Low";
}

// Report types
export interface Report {
  id: string;
  title: string;
  type: string;
  dateRange: string;
  generatedAt: string;
  format: "PDF" | "CSV" | "Excel";
}

// Navigation item
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  screen: keyof RootStackParamList;
  active?: boolean;
}

// KPI stat
export interface KPIStat {
  title: string;
  value: string;
  trend: "up" | "down" | "stable";
  sparkline?: number[];
}
