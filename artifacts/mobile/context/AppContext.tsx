import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'ar';
export type RiskProfile = 'conservative' | 'moderate' | 'growth' | 'aggressive';

export interface UserProfile {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  riskScore: number;
  riskProfile: RiskProfile;
  language: Language;
  biometricEnabled: boolean;
  onboardingComplete: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  totalBalance: number;
  totalReturn: number;
  totalReturnPct: number;
  streakDays: number;
  milestones: string[];
}

export interface Goal {
  id: string;
  name: string;
  nameAr: string;
  type: 'home' | 'education' | 'hajj' | 'retirement' | 'emergency' | 'custom';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  allocation: {
    equity: number;
    bonds: number;
    gold: number;
    cash: number;
    realestate: number;
  };
  progressPct: number;
  monthlyContribution: number;
}

export interface Notification {
  id: string;
  type: 'rebalance' | 'milestone' | 'research' | 'market' | 'payment';
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  read: boolean;
  createdAt: string;
}

interface AppContextType {
  user: UserProfile | null;
  goals: Goal[];
  notifications: Notification[];
  language: Language;
  setLanguage: (lang: Language) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  markNotificationRead: (id: string) => void;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  riskScore: number;
  setRiskScore: (score: number) => void;
  selectedMarket: string;
  setSelectedMarket: (market: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const MOCK_USER: UserProfile = {
  id: '1',
  name: 'Ahmed Hassan',
  nameAr: 'أحمد حسن',
  email: 'ahmed@example.com',
  phone: '+20 100 000 0000',
  riskScore: 6.5,
  riskProfile: 'growth',
  language: 'en',
  biometricEnabled: false,
  onboardingComplete: false,
  kycStatus: 'verified',
  totalBalance: 125000,
  totalReturn: 18500,
  totalReturnPct: 17.3,
  streakDays: 12,
  milestones: ['first_investment', 'goal_created'],
};

const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    name: 'Dream Home',
    nameAr: 'المنزل المثالي',
    type: 'home',
    targetAmount: 2000000,
    currentAmount: 340000,
    targetDate: '2030-06-01',
    allocation: { equity: 45, bonds: 30, gold: 15, cash: 5, realestate: 5 },
    progressPct: 17,
    monthlyContribution: 5000,
  },
  {
    id: '2',
    name: "Children's Education",
    nameAr: 'تعليم الأبناء',
    type: 'education',
    targetAmount: 800000,
    currentAmount: 285000,
    targetDate: '2032-09-01',
    allocation: { equity: 55, bonds: 25, gold: 10, cash: 5, realestate: 5 },
    progressPct: 35.6,
    monthlyContribution: 3000,
  },
  {
    id: '3',
    name: 'Retirement Fund',
    nameAr: 'صندوق التقاعد',
    type: 'retirement',
    targetAmount: 5000000,
    currentAmount: 125000,
    targetDate: '2050-01-01',
    allocation: { equity: 70, bonds: 15, gold: 10, cash: 3, realestate: 2 },
    progressPct: 2.5,
    monthlyContribution: 8000,
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'rebalance',
    title: 'Portfolio Rebalancing Needed',
    titleAr: 'يحتاج المحفظة إلى إعادة التوازن',
    body: 'Your Dream Home portfolio has drifted 6.2% from target. Tap to review.',
    bodyAr: 'انحرفت محفظة المنزل المثالي بنسبة 6.2% عن الهدف. اضغط للمراجعة.',
    read: false,
    createdAt: '2026-03-27T10:00:00Z',
  },
  {
    id: '2',
    type: 'research',
    title: 'New Research Report',
    titleAr: 'تقرير بحثي جديد',
    body: 'Banking Sector Analysis — relevant to 34% of your portfolio',
    bodyAr: 'تحليل قطاع البنوك — ذو صلة بـ 34% من محفظتك',
    read: false,
    createdAt: '2026-03-26T08:00:00Z',
  },
  {
    id: '3',
    type: 'milestone',
    title: 'Milestone Reached!',
    titleAr: 'تم الوصول إلى هدف مرحلي!',
    body: "You've hit 35% of your Education goal. Keep it up!",
    bodyAr: 'وصلت إلى 35% من هدف التعليم. استمر!',
    read: true,
    createdAt: '2026-03-25T12:00:00Z',
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [language, setLanguageState] = useState<Language>('en');
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [riskScore, setRiskScoreState] = useState(0);
  const [selectedMarket, setSelectedMarket] = useState('EGX');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedOnboarded = await AsyncStorage.getItem('isOnboarded');
      const storedLang = await AsyncStorage.getItem('language');
      const storedRisk = await AsyncStorage.getItem('riskScore');
      if (storedOnboarded === 'true') {
        setIsOnboardedState(true);
        setUser(MOCK_USER);
      }
      if (storedLang === 'ar' || storedLang === 'en') {
        setLanguageState(storedLang as Language);
      }
      if (storedRisk) {
        setRiskScoreState(parseFloat(storedRisk));
      }
    } catch {}
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
    if (user) setUser({ ...user, language: lang });
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const addGoal = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const setIsOnboarded = async (v: boolean) => {
    setIsOnboardedState(v);
    await AsyncStorage.setItem('isOnboarded', v ? 'true' : 'false');
    if (v) setUser(MOCK_USER);
  };

  const setRiskScore = async (score: number) => {
    setRiskScoreState(score);
    await AsyncStorage.setItem('riskScore', score.toString());
  };

  return (
    <AppContext.Provider value={{
      user, goals, notifications, language, setLanguage, updateUser,
      addGoal, updateGoal, deleteGoal, markNotificationRead,
      isOnboarded, setIsOnboarded, riskScore, setRiskScore,
      selectedMarket, setSelectedMarket,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
