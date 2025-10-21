import {
  Shield,
  CheckCircle,
  Award,
  Star,
  Lock,
  FileCheck,
  TrendingUp,
  Target,
  Eye,
  Users,
  Search,
  DollarSign,
  CreditCard,
  Clock,
  Percent,
  Info,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  CheckSquare,
  XCircle,
  Settings,
  Zap,
  Activity,
  BarChart,
  PieChart,
  TrendingDown,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Coins,
  Wallet,
  Banknote,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react'

// Map of icon names to Lucide components
export const iconMap: Record<string, LucideIcon> = {
  // Security & Trust
  shield: Shield,
  lock: Lock,
  'file-check': FileCheck,
  'check-circle': CheckCircle,
  'check-square': CheckSquare,

  // Quality & Rating
  award: Award,
  star: Star,
  target: Target,

  // Performance & Analytics
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  activity: Activity,
  'bar-chart': BarChart,
  'pie-chart': PieChart,
  zap: Zap,

  // Transparency & Review
  eye: Eye,
  search: Search,

  // Community & Users
  users: Users,

  // Money & Payments
  'dollar-sign': DollarSign,
  'credit-card': CreditCard,
  coins: Coins,
  wallet: Wallet,
  banknote: Banknote,
  'circle-dollar-sign': CircleDollarSign,

  // Gambling Specific
  'dice-1': Dice1,
  'dice-2': Dice2,
  'dice-3': Dice3,
  'dice-4': Dice4,
  'dice-5': Dice5,
  'dice-6': Dice6,

  // Time & Percentages
  clock: Clock,
  percent: Percent,

  // Information & Learning
  info: Info,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'help-circle': HelpCircle,
  lightbulb: Lightbulb,
  'alert-circle': AlertCircle,

  // Settings
  settings: Settings,

  // Negative indicators
  'x-circle': XCircle,
}

// Get icon component by name, with fallback
export function getIconComponent(iconName?: string): LucideIcon | null {
  if (!iconName) return null

  // Clean the string: remove invisible Unicode characters, trim, and normalize
  const cleanName = iconName
    .replace(/[\u200B-\u200D\uFEFF\u202C\u202D\u202E\u2060-\u206F]/g, '') // Remove zero-width chars, BOM, and directional marks
    .trim()
    .normalize('NFKC') // Normalize Unicode to canonical form
    .toLowerCase()

  console.log('getIconComponent - Input:', iconName, 'Cleaned:', cleanName, 'Found:', !!iconMap[cleanName])

  return iconMap[cleanName] || null
}

// Export list of available icon names for Sanity schema
export const availableIcons = Object.keys(iconMap).sort()
