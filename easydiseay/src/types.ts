export type Language = "en" | "bn";

export interface AnalysisResult {
  id: string;
  crop: string;
  cropBn: string;
  disease: string;
  diseaseBn: string;
  confidence: string;
  confidenceBn: string;
  date: string;
  timestamp: number;
  imageUrl: string;
  symptoms: string;
  symptomsBn: string;
  causes: string;
  causesBn: string;
  treatment: string;
  treatmentBn: string;
  bangladeshMedicines: string[];
  bangladeshMedicinesBn: string[];
  preventionTips: string[];
  preventionTipsBn: string[];
}

export interface MedicineItem {
  id: string;
  brandName: string;
  genericName: string;
  company: string;
  targetDiseases: string[];
  cropTypes: string[];
  dosage: string;
  dosageBn: string;
  packSize: string;
}

export interface DiseaseItem {
  id: string;
  name: string;
  nameBn: string;
  crop: string;
  cropBn: string;
  pathogen: string;
  severity: "High" | "Medium" | "Low";
  commonMedicines: string[];
}

export interface AdminUser {
  name: string;
  role: string;
  email: string;
  token: string;
}

export interface RegisteredUser {
  id: string;
  userId: string;
  loginCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: "Active" | "Pending" | "Suspended";
  createdAt: string;
}

export interface RegistrationRequest {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface ContactAdminInfo {
  email: string;
  phone: string;
  description: string;
  displayStyle?: "card_green" | "card_dual";
}

export interface SupportedCrop {
  id: string;
  name: string;
  nameBn: string;
  imageUrl: string;
}

export interface SampleLeaf {
  id: string;
  cropName: string;
  cropNameBn: string;
  diseaseName: string;
  diseaseNameBn: string;
  imageUrl: string;
  tag: string;
}

export type AnalyticsFilterMode = "hours" | "day" | "month" | "year" | "all_time";
export type AnalyticsHourRange = "1h" | "2h" | "3h" | "6h" | "12h" | "24h";
export type AnalyticsTimeRange = "1d" | "2d" | "7d" | "30d" | "1y";

export interface CropSearchStat {
  crop: string;
  cropBn: string;
  icon: string;
  count: number;
  percentage: number;
}

export interface DiseaseDetectionStat {
  disease: string;
  diseaseBn: string;
  crop: string;
  severity: string;
  count: number;
}

export interface TimelinePoint {
  timeLabel: string;
  visits: number;
  diagnoses: number;
  searches: number;
}

export interface LocationDistributionItem {
  district: string;
  districtBn: string;
  count: number;
  percentage: number;
}

export interface DeviceBreakdownItem {
  device: string;
  count: number;
  percentage: number;
}

export interface AnalyticsReport {
  filterMode: AnalyticsFilterMode;
  filterLabel: string;
  filterLabelBn: string;
  totalVisits: number;
  uniqueVisitors: number;
  diagnosesCount: number;
  nearbySearchesCount: number;
  avgSessionSeconds: number;
  diagnosisSuccessRate: number;
  topCrops: CropSearchStat[];
  topDiseases: DiseaseDetectionStat[];
  timeline: TimelinePoint[];
  locationDistribution: LocationDistributionItem[];
  deviceBreakdown: DeviceBreakdownItem[];
  autoReset: {
    cycleStartedAt: number;
    nextResetAt: number;
    lastResetAt: number;
    nextResetFormatted: string;
    autoResetInterval: string;
  };
}


