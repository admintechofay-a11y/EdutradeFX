import {
  BrokerBusinessType,
  BrokerDocType,
  GtcMode,
  IbSettlement,
  OrderExecution,
  SpreadType,
} from '@/types';

export interface WizardStepMeta {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  {
    id: 'general',
    number: 1,
    title: 'General Information',
    shortTitle: 'General',
    description: 'Company identification, registration, website, and operating presence.',
    iconName: 'Building2',
  },
  {
    id: 'devices-servers',
    number: 2,
    title: 'Devices & Trading Servers',
    shortTitle: 'Servers',
    description: 'Trading platforms, supported hardware, and live server endpoints.',
    iconName: 'Server',
  },
  {
    id: 'regulatory',
    number: 3,
    title: 'Regulatory Licenses',
    shortTitle: 'Regulation',
    description: 'Financial licenses, license numbers, registered addresses, and official proof PDFs.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'board',
    number: 4,
    title: 'Board Members & Head Office',
    shortTitle: 'Board & Office',
    description: 'Key executives, headquarters location, and corporate contact desks.',
    iconName: 'Users',
  },
  {
    id: 'support',
    number: 5,
    title: 'Customer Support & Restrictions',
    shortTitle: 'Support',
    description: 'Support channels, working hours, multi-language coverage, and restricted jurisdictions.',
    iconName: 'Headphones',
  },
  {
    id: 'funds-loss',
    number: 6,
    title: 'Funds Security & Risk Metrics',
    shortTitle: 'Security',
    description: 'Custodian trust, segregated bank accounts, negative balance protection, and retail loss %.',
    iconName: 'Lock',
  },
  {
    id: 'account-groups',
    number: 7,
    title: 'Trading Account Groups',
    shortTitle: 'Accounts',
    description: 'Leverage, spreads, order execution, trading rules, commission schedules, and demo test account.',
    iconName: 'CreditCard',
  },
  {
    id: 'ib-program',
    number: 8,
    title: 'Introducing Broker (IB) Program',
    shortTitle: 'IB Plans',
    description: 'Partnership plans, rebates, multi-tier sub-IB payouts, and settlement cycles.',
    iconName: 'Handshake',
  },
  {
    id: 'deposit-methods',
    number: 9,
    title: 'Deposit Payment Methods',
    shortTitle: 'Deposits',
    description: 'Funding gateways, deposit currencies, transaction fees, and processing speeds.',
    iconName: 'ArrowDownToLine',
  },
  {
    id: 'withdrawal-methods',
    number: 10,
    title: 'Withdrawal Payment Methods',
    shortTitle: 'Withdrawals',
    description: 'Payout rails, cashout limits, withdrawal fees, and SLA timelines.',
    iconName: 'ArrowUpFromLine',
  },
  {
    id: 'symbol-specs',
    number: 11,
    title: 'Tradable Symbol Specs',
    shortTitle: 'Symbols',
    description: 'Contract sizing, benchmark spreads, stop distance, precision, and margin requirements.',
    iconName: 'BarChart3',
  },
  {
    id: 'dealing',
    number: 12,
    title: 'Dealing & Liquidity Setup',
    shortTitle: 'Liquidity',
    description: 'Tier-1 liquidity providers and proprietary dealing desk / book size information.',
    iconName: 'Network',
  },
  {
    id: 'business-areas',
    number: 13,
    title: 'Primary Business Regions',
    shortTitle: 'Regions',
    description: 'Active client density across continents and geographic jurisdictions.',
    iconName: 'Globe',
  },
  {
    id: 'funding',
    number: 14,
    title: 'Annual Funding & Volume',
    shortTitle: 'Financials',
    description: 'Audited historical deposit volumes, withdrawals, and turnover lots (strictly private).',
    iconName: 'TrendingUp',
  },
  {
    id: 'activity',
    number: 15,
    title: 'Average Client Activity',
    shortTitle: 'Activity',
    description: 'Average new vs existing client deposit and withdrawal ticket sizes (strictly private).',
    iconName: 'Activity',
  },
  {
    id: 'pros-cons',
    number: 16,
    title: 'Platform Pros & Cons',
    shortTitle: 'Pros & Cons',
    description: 'Official highlights, platform advantages, and transparent trade-offs for prospective traders.',
    iconName: 'Sparkles',
  },
  {
    id: 'awards',
    number: 17,
    title: 'Industry Awards & Expos',
    shortTitle: 'Awards',
    description: 'Recognitions, fintech expo showcases, and prestigious trading achievements.',
    iconName: 'Trophy',
  },
  {
    id: 'social',
    number: 18,
    title: 'Social Channels & Video Pitch',
    shortTitle: 'Social Media',
    description: 'Official verified social profiles and embedded broker introductory video pitch.',
    iconName: 'Share2',
  },
  {
    id: 'policies',
    number: 19,
    title: 'Policies & Legal Disclosures',
    shortTitle: 'Legal Docs',
    description: 'Terms of service, risk disclosure, AML regulations, order execution policy, and privacy policy PDFs.',
    iconName: 'FileText',
  },
  {
    id: 'review',
    number: 20,
    title: 'Review & Submit Application',
    shortTitle: 'Review & Submit',
    description: 'Compliance verification audit checklist and final submission for administrative review.',
    iconName: 'CheckCircle2',
  },
];

export const REGULATORY_BODIES = [
  'FCA (United Kingdom)',
  'ASIC (Australia)',
  'CySEC (Cyprus)',
  'FSCA (South Africa)',
  'SCB (Bahamas)',
  'DFSA (Dubai, UAE)',
  'BaFin (Germany)',
  'FINMA (Switzerland)',
  'CFTC / NFA (United States)',
  'MAS (Singapore)',
  'FSA (Japan)',
  'FSA (Seychelles)',
  'VFSC (Vanuatu)',
  'BVI FSC (British Virgin Islands)',
  'CIMA (Cayman Islands)',
  'FSC (Mauritius)',
  'IFSC / FSC (Belize)',
  'Other Regulatory Body',
];

export const BUSINESS_TYPES: { value: BrokerBusinessType; label: string; description: string }[] = [
  { value: 'STP', label: 'Straight Through Processing (STP)', description: 'Direct order routing to external liquidity providers.' },
  { value: 'ECN', label: 'Electronic Communication Network (ECN)', description: 'Direct market execution with interbank participants and transparent order book.' },
  { value: 'MARKET_MAKER', label: 'Market Maker (B-Book)', description: 'Internal matching desk acting as counterparty to client trades.' },
  { value: 'DMA', label: 'Direct Market Access (DMA)', description: 'Exchange order flow with Level II market depth.' },
  { value: 'HYBRID', label: 'Hybrid (A-Book / B-Book)', description: 'Combined dynamic risk-managed routing.' },
  { value: 'OTHER', label: 'Other Structure', description: 'Alternative financial brokerage configuration.' },
];

export const TRADING_PLATFORMS = [
  'MetaTrader 4 (MT4)',
  'MetaTrader 5 (MT5)',
  'cTrader',
  'TradingView',
  'WebTrader (Proprietary)',
  'Mobile App (Proprietary)',
  'IRESS',
  'Match-Trader',
  'NinjaTrader',
];

export const SUPPORTED_DEVICES = [
  'Windows PC',
  'macOS Apple Silicon / Intel',
  'Web Browser',
  'iOS (iPhone / iPad)',
  'Android',
  'Linux',
];

export const SPREAD_TYPES: { value: SpreadType; label: string }[] = [
  { value: 'VARIABLE', label: 'Variable / Floating' },
  { value: 'RAW', label: 'Raw Spread (from 0.0 pips + Commission)' },
  { value: 'FIXED', label: 'Fixed Spread' },
  { value: 'ZERO_SPREAD', label: 'Zero Spread Account' },
];

export const ORDER_EXECUTIONS: { value: OrderExecution; label: string }[] = [
  { value: 'MARKET', label: 'Market Execution' },
  { value: 'INSTANT', label: 'Instant Execution' },
  { value: 'EXCHANGE', label: 'Exchange Execution' },
];

export const GTC_MODES: { value: GtcMode; label: string }[] = [
  { value: 'HOLD_WEEKEND', label: 'Hold Open Orders Over Weekend' },
  { value: 'CANCEL', label: 'Cancel Open Orders at Friday Close' },
];

export const IB_SETTLEMENTS: { value: IbSettlement; label: string }[] = [
  { value: 'DAILY', label: 'Daily Settlement' },
  { value: 'WEEKLY', label: 'Weekly Settlement' },
  { value: 'MONTHLY', label: 'Monthly Settlement' },
  { value: 'INSTANT', label: 'Instant Settlement / Real-time' },
];

export const ORDER_TYPES_LIST = [
  'Market Order',
  'Buy Limit',
  'Sell Limit',
  'Buy Stop',
  'Sell Stop',
  'Buy Stop Limit',
  'Sell Stop Limit',
  'Trailing Stop',
  'One-Cancels-the-Other (OCO)',
];

export const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CHF', 'NZD', 'SGD', 'AED', 'USDT', 'BTC', 'ETH'];

export const DEPOSIT_PAYMENT_METHODS = [
  'Bank Wire Transfer',
  'Visa / MasterCard',
  'Skrill',
  'Neteller',
  'Cryptocurrency (USDT TRC20/ERC20)',
  'Bitcoin (BTC)',
  'Ethereum (ETH)',
  'PayPal',
  'Apple Pay',
  'Google Pay',
  'Perfect Money',
  'FasaPay',
  'Local Bank Transfer (P2P / QRIS)',
  'Stripe',
  'Wise',
];

export const WITHDRAWAL_PAYMENT_METHODS = [
  'Bank Wire Transfer',
  'Visa / MasterCard (Original Method)',
  'Skrill',
  'Neteller',
  'Cryptocurrency (USDT TRC20/ERC20)',
  'Bitcoin (BTC)',
  'Ethereum (ETH)',
  'PayPal',
  'Local Bank Transfer',
  'FasaPay',
  'Perfect Money',
];

export const POLICY_DOC_TYPES: { type: BrokerDocType; label: string; isMandatory: boolean; desc: string }[] = [
  {
    type: 'POLICY_TERMS',
    label: 'Terms & Conditions (Client Agreement)',
    isMandatory: true,
    desc: 'Full retail and professional client terms of business.',
  },
  {
    type: 'POLICY_RISK_DISCLOSURE',
    label: 'General Risk Disclosure Notice',
    isMandatory: true,
    desc: 'Statutory disclaimer explaining leverage, CFD, and FX market risks.',
  },
  {
    type: 'POLICY_AML',
    label: 'Anti-Money Laundering (AML) & KYC Policy',
    isMandatory: true,
    desc: 'Procedures for identity verification, PEP checks, and sanctions.',
  },
  {
    type: 'POLICY_PRIVACY',
    label: 'Privacy & Data Protection Policy (GDPR)',
    isMandatory: false,
    desc: 'Information on data storage, cookies, and regulatory retention.',
  },
  {
    type: 'POLICY_ORDER_EXECUTION',
    label: 'Best Execution & Order Handling Policy',
    isMandatory: false,
    desc: 'Details on price feeds, slippage, and execution venues.',
  },
  {
    type: 'POLICY_CONFLICT_INTEREST',
    label: 'Conflicts of Interest Policy',
    isMandatory: false,
    desc: 'Safeguards addressing internal execution and client interests.',
  },
  {
    type: 'COMMISSION_STRUCTURE',
    label: 'Commission & Fee Schedule Document',
    isMandatory: false,
    desc: 'Itemized commission schedule, financing swaps, and rollover fees.',
  },
  {
    type: 'SWAP_STRUCTURE',
    label: 'Overnight Financing / Swap Schedule',
    isMandatory: false,
    desc: 'Interest rate differential and daily holding swap tables.',
  },
  {
    type: 'OTHER',
    label: 'Supplementary Regulatory Disclosure',
    isMandatory: false,
    desc: 'Additional audited statements, license certificates, or disclosures.',
  },
];
