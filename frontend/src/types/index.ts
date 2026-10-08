export type Role = 'ADMIN' | 'BROKER' | 'ACCOUNT_MANAGER' | 'SIGNAL_PROVIDER' | 'TUTOR' | 'STUDENT';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type BrokerBusinessType = 'MARKET_MAKER' | 'STP' | 'ECN' | 'DMA' | 'HYBRID' | 'OTHER';
export type BrokerOnboardingStatus = 'DRAFT' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'VERIFIED';
export type BrokerDocType =
  | 'REGULATORY_LICENSE'
  | 'BOARD_MEMBER_ID'
  | 'OFFICE_IMAGE'
  | 'COMMISSION_STRUCTURE'
  | 'SWAP_STRUCTURE'
  | 'POLICY_TERMS'
  | 'POLICY_RISK_DISCLOSURE'
  | 'POLICY_PRIVACY'
  | 'POLICY_AML'
  | 'POLICY_ORDER_EXECUTION'
  | 'POLICY_CONFLICT_INTEREST'
  | 'OTHER';
export type SpreadType = 'FIXED' | 'VARIABLE' | 'RAW' | 'ZERO_SPREAD';
export type OrderExecution = 'INSTANT' | 'MARKET' | 'EXCHANGE';
export type GtcMode = 'CANCEL' | 'HOLD_WEEKEND';
export type IbSettlement = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'INSTANT';

export type CourseStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
export type LessonType = 'VIDEO' | 'PDF' | 'QUIZ' | 'TEXT';
export type SignalDirection = 'BUY' | 'SELL';
export type SignalStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED';
export type ComplaintStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
export type ComplaintTargetType = 'BROKER' | 'ACCOUNT_MANAGER' | 'SIGNAL_PROVIDER' | 'TUTOR' | 'PLATFORM';
export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
export type AdPlacement = 'HOME_HERO' | 'HOME_SIDEBAR' | 'BROKER_LIST' | 'COURSE_LIST' | 'BLOG_SIDEBAR' | 'POPUP';
export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'APPROVAL' | 'REJECTION' | 'PAYMENT' | 'REVIEW' | 'ENQUIRY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  phone?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface BrokerServer {
  id: string;
  brokerId?: string;
  name: string;
  ip?: string | null;
  location?: string | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerLicense {
  id: string;
  brokerId?: string;
  regulatoryBody: string;
  regulatorCode?: string | null;
  regulatorOther?: string | null;
  licenseNumber: string;
  licenseStatus: string;
  companyAddress?: string | null;
  licensePdfUrl?: string | null;
  proofUrl?: string | null;
  proofLink?: string | null;
  verifiedByAdmin: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerBoardMember {
  id: string;
  brokerId?: string;
  fullName: string;
  position: string;
  photoUrl?: string | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerAccountGroup {
  id: string;
  brokerId?: string;
  name: string;
  demoAvailable: boolean;
  currency: string;
  currencyCode?: string | null;
  currencyOther?: string | null;
  spreadTypesLabel?: string | null;
  spreadFrom?: string | null;
  minDeposit?: number | null;
  depositBonusPctUpTo?: number | null;
  depositBonusCode?: string | null;
  depositBonusNum?: number | null;
  leverageUpTo?: string | null;
  leverageCode?: string | null;
  leverageNum?: number | null;
  minTradeVolume?: number | null;
  hasCommissionPerLot: boolean;
  feesPerLot?: string | null;
  commissionStructureUrl?: string | null;
  spreadType: SpreadType;
  orderTypes: string[];
  swapFree: boolean;
  swapLong?: string | null;
  swapShort?: string | null;
  orderExecution: OrderExecution;
  gtcMode: GtcMode;
  eaAllowed: boolean;
  hedgingAllowed: boolean;
  nettingAllowed: boolean;
  scalpingAllowed: boolean;
  hasSwapCharges: boolean;
  swapStructureUrl?: string | null;
  slippage: boolean;
  slippagePoints?: number | null;
  markups?: string | null;
  forexCommission?: string | null;
  cryptoCommission?: string | null;
  commoditiesCommission?: string | null;
  metalsCommission?: string | null;
  indexCommission?: string | null;
  stocksCommission?: string | null;
  testLogin?: string | null;
  testServer?: string | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerIbPlan {
  id: string;
  brokerId?: string;
  planName: string;
  commissionPerLot?: string | null;
  rebatePercentage?: number | null;
  subIbCommission?: string | null;
  settlementCycle: IbSettlement;
  notes?: string | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerDepositMethod {
  id: string;
  brokerId?: string;
  name: string;
  currency: string;
  feePct?: number | null;
  feeFixed?: number | null;
  minDeposit?: number | null;
  maxDeposit?: number | null;
  processingTime?: string | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerWithdrawalMethod {
  id: string;
  brokerId?: string;
  name: string;
  currency: string;
  feePct?: number | null;
  feeFixed?: number | null;
  minWithdrawal?: number | null;
  maxWithdrawal?: number | null;
  processingTime?: string | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerSymbolSpec {
  id: string;
  brokerId?: string;
  symbol: string;
  category: string;
  contractSize?: string | null;
  spreadAvg?: string | null;
  stopDistance?: string | null;
  precision?: number | null;
  marginPercentage?: number | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerFundingYear {
  id: string;
  brokerId?: string;
  year: number;
  netDepositUsd?: number | null;
  netWithdrawUsd?: number | null;
  netLots?: number | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerClientActivity {
  id?: string;
  brokerId?: string;
  avgNewClientDeposit?: number | null;
  avgExistingClientDeposit?: number | null;
  avgNewClientWithdrawal?: number | null;
  avgExistingClientWithdrawal?: number | null;
  createdAt?: string;
}

export interface BrokerBusinessArea {
  id: string;
  brokerId?: string;
  countryOrRegion: string;
  clientsNote?: string | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerAward {
  id: string;
  brokerId?: string;
  year: number;
  awardFor: string;
  expo?: string | null;
  expoLocation?: string | null;
  expoDate?: string | null;
  sortOrder: number;
  createdAt?: string;
}

export interface BrokerDocument {
  id: string;
  brokerId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  docType: BrokerDocType | string;
  isPrivate?: boolean;
  verifiedByAdmin?: boolean;
  createdAt: string;
}

export interface Broker {
  id: string;
  userId: string;
  companyName: string;
  registeredName?: string | null;
  slug: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  platformDescription?: string | null;
  yearFounded?: number | null;
  headquarters?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  mtRegisteredCountryRegion?: string | null;
  isRegulated?: boolean | null;
  totalTradableSymbols?: number | null;
  accountCurrencies: string[];
  negativeBalanceProtection?: boolean | null;
  availablePlatforms: string[];
  platformLinks?: Record<string, string> | null;
  deviceSupport: string[];
  businessType?: BrokerBusinessType | null;
  officeContactNumber?: string | null;
  officeContactEmail?: string | null;
  countryRestrictions: string[];
  supportPhone?: string | null;
  supportWhatsapp?: string | null;
  supportEmail?: string | null;
  supportAvailability?: string | null;
  languagesSupported: string[];
  availableTimeframes?: string[];
  clientLossPercentage?: number | null;
  fundsSecurity?: string | null;
  liquidityProvider?: string | null;
  personalBookSize?: string | null;
  prosList: string[];
  consList: string[];
  promoVideoUrl?: string | null;
  socialLinks?: Record<string, string> | null;
  countries: string[];
  regulation: string[];
  tradingPlatforms: string[];
  accountTypes: string[];
  minDeposit?: number | null;
  maxLeverage?: string | null;
  spreadsFrom?: string | null;
  commissions?: string | null;
  instruments: string[];
  depositMethods: string[];
  withdrawMethods: string[];
  executionType?: string | null;
  riskDisclaimer?: string | null;
  avgRating: number;
  totalReviews: number;
  totalLeads: number;
  status: ApprovalStatus;
  onboardingStatus: BrokerOnboardingStatus;
  completenessPct: number;
  reviewNote?: string | null;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  verifiedAt?: string | null;
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  licenses?: BrokerLicense[];
  servers?: BrokerServer[];
  boardMembers?: BrokerBoardMember[];
  accountGroups?: BrokerAccountGroup[];
  ibPlans?: BrokerIbPlan[];
  depositMethodItems?: BrokerDepositMethod[];
  withdrawalMethodItems?: BrokerWithdrawalMethod[];
  symbolSpecs?: BrokerSymbolSpec[];
  fundingYears?: BrokerFundingYear[];
  clientActivity?: BrokerClientActivity | null;
  businessAreas?: BrokerBusinessArea[];
  awards?: BrokerAward[];
  reviews?: BrokerReview[];
  documents?: BrokerDocument[];
  user?: { name: string; email: string; phone?: string | null; avatar?: string | null };
}

export interface BrokerReview {
  id: string;
  brokerId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string | null;
  cons?: string | null;
  isVerified: boolean;
  isApproved: boolean;
  brokerResponse?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  user?: { id: string; name: string; avatar?: string | null };
}

export interface AccountManager {
  id: string;
  userId: string;
  fullName: string;
  slug: string;
  photo?: string | null;
  tagline?: string | null;
  bio?: string | null;
  expertise: string[];
  languages: string[];
  country?: string | null;
  city?: string | null;
  yearsExperience?: number | null;
  services: string[];
  availability?: string | null;
  strategy?: string | null;
  minInvestment?: number | null;
  historicalPerformance?: string | null;
  riskInfo?: string | null;
  tradingStyle?: string | null;
  website?: string | null;
  disclaimer?: string | null;
  avgRating: number;
  totalReviews: number;
  status: ApprovalStatus;
  isFeatured: boolean;
  createdAt: string;
  reviews?: AccountManagerReview[];
  documents?: any[];
  user?: { name: string; email: string };
}

export interface AccountManagerReview {
  id: string;
  accountManagerId: string;
  userId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user?: { id: string; name: string; avatar?: string | null };
}

export interface SignalProvider {
  id: string;
  userId: string;
  displayName: string;
  slug: string;
  photo?: string | null;
  bio?: string | null;
  instruments: string[];
  strategy?: string | null;
  riskCategory?: string | null;
  winRate?: number | null;
  totalSignals: number;
  subscriptionPrice?: number | null;
  historicalPerformance?: string | null;
  website?: string | null;
  disclaimer?: string | null;
  avgRating: number;
  totalReviews: number;
  verificationStatus: boolean;
  status: ApprovalStatus;
  isFeatured: boolean;
  createdAt: string;
  signals?: Signal[];
  reviews?: SignalProviderReview[];
  user?: { name: string; email: string };
}

export interface Signal {
  id: string;
  signalProviderId: string;
  title: string;
  instrument: string;
  direction: SignalDirection;
  entryPrice?: number | null;
  takeProfit?: number | null;
  stopLoss?: number | null;
  description?: string | null;
  status: SignalStatus;
  closedAt?: string | null;
  closedPrice?: number | null;
  pipsGained?: number | null;
  createdAt: string;
}

export interface SignalProviderReview {
  id: string;
  signalProviderId: string;
  userId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user?: { id: string; name: string; avatar?: string | null };
}

export interface Tutor {
  id: string;
  userId: string;
  slug: string;
  bio?: string | null;
  photo?: string | null;
  expertise: string[];
  totalEarned: number;
  totalSales: number;
  avgRating: number;
  status: ApprovalStatus;
  bankDetails?: any;
  user?: { id: string; name: string; avatar?: string | null; email?: string };
}

export interface Course {
  id: string;
  tutorId: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  category: string;
  level: string;
  thumbnail?: string | null;
  promoVideo?: string | null;
  price: number;
  discountPrice?: number | null;
  discountUntil?: string | null;
  currency: string;
  prerequisites: string[];
  learningOutcomes: string[];
  language: string;
  totalDuration: number;
  totalLessons: number;
  totalEnrollments: number;
  avgRating: number;
  totalReviews: number;
  status: CourseStatus;
  isFeatured: boolean;
  createdAt: string;
  tutor?: Tutor;
  sections?: CourseSection[];
  reviews?: CourseReview[];
  isEnrolled?: boolean;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  type: LessonType;
  contentUrl?: string | null;
  duration?: number | null;
  description?: string | null;
  order: number;
  isFree: boolean;
  isCompleted?: boolean;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  progress: number;
  certificateIssued: boolean;
  certificateUrl?: string | null;
  enrolledAt: string;
  course?: Course;
  lessonCompletions?: { lessonId: string }[];
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { id: string; name: string; avatar?: string | null };
}

export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  category: string;
  tags: string[];
  featuredImage?: string | null;
  coverImage?: string | null;
  readTime?: number | null;
  status: BlogStatus;
  publishedAt?: string | null;
  viewCount: number;
  views?: number;
  createdAt: string;
  author?: { name: string; avatar?: string | null };
}

export interface Complaint {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  category?: string | null;
  targetType: ComplaintTargetType;
  targetId?: string | null;
  title?: string;
  subject: string;
  description: string;
  attachments: string[];
  declarationConsent?: boolean;
  status: ComplaintStatus;
  adminNotes?: string | null;
  resolution?: string | null;
  createdAt: string;
  user?: { name: string; email: string };
}

export type ContactEnquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  category: string;
  subject: string;
  message: string;
  status: ContactEnquiryStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: AdPlacement;
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type BrokerOptionGroup =
  | 'REGULATOR'
  | 'LANGUAGE'
  | 'CURRENCY'
  | 'LICENSE_STATUS'
  | 'DEPOSIT_BONUS'
  | 'LEVERAGE'
  | 'TIMEFRAME';

export interface BrokerOption {
  id?: string;
  group: BrokerOptionGroup;
  code: string;
  label: string;
  meta?: any;
  sortOrder?: number;
  isActive?: boolean;
}

