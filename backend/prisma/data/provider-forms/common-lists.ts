export interface OptionItem {
  value: string;
  label: string;
  description?: string;
}

export interface OptionListDef {
  key: string;
  label: string;
  items: OptionItem[];
}

export const COMMON_OPTION_LISTS: Record<string, OptionListDef> = {
  "REGISTRATION_AUTHORITIES": {
    "key": "REGISTRATION_AUTHORITIES",
    "label": "Registration Authorities",
    "items": [
      {
        "value": "COMPANIES_HOUSE_UK",
        "label": "Companies House \u2014 United Kingdom"
      },
      {
        "value": "ROC_INDIA",
        "label": "Registrar of Companies \u2014 India"
      },
      {
        "value": "ASIC_AUSTRALIA",
        "label": "ASIC \u2014 Australia"
      },
      {
        "value": "FCA_UK",
        "label": "FCA \u2014 United Kingdom"
      },
      {
        "value": "CYSEC_CYPRUS",
        "label": "CySEC \u2014 Cyprus"
      },
      {
        "value": "DUBAI_DET",
        "label": "Dubai Department of Economy and Tourism"
      },
      {
        "value": "ABU_DHABI_ADDED",
        "label": "Abu Dhabi Department of Economic Development"
      },
      {
        "value": "DIFC_ROC",
        "label": "DIFC Registrar of Companies"
      },
      {
        "value": "ADGM_RA",
        "label": "ADGM Registration Authority"
      },
      {
        "value": "SEC_US",
        "label": "SEC \u2014 United States"
      },
      {
        "value": "FINRA_US",
        "label": "FINRA \u2014 United States"
      },
      {
        "value": "OTHER",
        "label": "Other"
      },
      {
        "value": "NOT_APPLICABLE",
        "label": "Not applicable"
      }
    ]
  },
  "OPERATING_REGIONS": {
    "key": "OPERATING_REGIONS",
    "label": "Operating Regions",
    "items": [
      {
        "value": "UK_EUROPE_EEA",
        "label": "United Kingdom & Europe (EEA)"
      },
      {
        "value": "REST_OF_EUROPE",
        "label": "Rest of Europe"
      },
      {
        "value": "MIDDLE_EAST",
        "label": "Middle East"
      },
      {
        "value": "NORTH_AFRICA",
        "label": "North Africa"
      },
      {
        "value": "SUB_SAHARAN_AFRICA",
        "label": "Sub-Saharan Africa"
      },
      {
        "value": "SOUTH_ASIA",
        "label": "South Asia"
      },
      {
        "value": "SOUTHEAST_ASIA",
        "label": "Southeast Asia"
      },
      {
        "value": "EAST_ASIA",
        "label": "East Asia"
      },
      {
        "value": "CENTRAL_ASIA",
        "label": "Central Asia"
      },
      {
        "value": "AUSTRALIA_NZ",
        "label": "Australia & New Zealand"
      },
      {
        "value": "NORTH_AMERICA",
        "label": "North America"
      },
      {
        "value": "CENTRAL_AMERICA",
        "label": "Central America"
      },
      {
        "value": "SOUTH_AMERICA",
        "label": "South America"
      },
      {
        "value": "CARIBBEAN",
        "label": "Caribbean"
      },
      {
        "value": "GLOBAL",
        "label": "Global"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "COMPANY_SIZES": {
    "key": "COMPANY_SIZES",
    "label": "Company Sizes",
    "items": [
      {
        "value": "1_10",
        "label": "1\u201310 employees"
      },
      {
        "value": "11_50",
        "label": "11\u201350 employees"
      },
      {
        "value": "51_200",
        "label": "51\u2013200 employees"
      },
      {
        "value": "201_500",
        "label": "201\u2013500 employees"
      },
      {
        "value": "501_1000",
        "label": "501\u20131,000 employees"
      },
      {
        "value": "1001_5000",
        "label": "1,001\u20135,000 employees"
      },
      {
        "value": "5000_PLUS",
        "label": "5,000+ employees"
      },
      {
        "value": "PREFER_NOT_TO_DISCLOSE",
        "label": "Prefer not to disclose"
      }
    ]
  },
  "CUSTOMER_TYPES": {
    "key": "CUSTOMER_TYPES",
    "label": "Primary Customer Types",
    "items": [
      {
        "value": "RETAIL_FOREX_BROKERS",
        "label": "Retail forex brokers"
      },
      {
        "value": "INSTITUTIONAL_BROKERS",
        "label": "Institutional brokers"
      },
      {
        "value": "NEW_BROKERAGES",
        "label": "New brokerages"
      },
      {
        "value": "ESTABLISHED_BROKERAGES",
        "label": "Established brokerages"
      },
      {
        "value": "PROP_TRADING_FIRMS",
        "label": "Prop trading firms"
      },
      {
        "value": "HEDGE_FUNDS",
        "label": "Hedge funds"
      },
      {
        "value": "ASSET_MANAGERS",
        "label": "Asset managers"
      },
      {
        "value": "BANKS_FINANCIAL_INSTITUTIONS",
        "label": "Banks and financial institutions"
      },
      {
        "value": "INTRODUCING_BROKERS",
        "label": "Introducing brokers"
      },
      {
        "value": "FINTECH_COMPANIES",
        "label": "Fintech companies"
      },
      {
        "value": "TRADING_EDUCATORS",
        "label": "Trading educators"
      },
      {
        "value": "TECHNOLOGY_PARTNERS",
        "label": "Technology partners"
      },
      {
        "value": "INDIVIDUAL_TRADERS",
        "label": "Individual traders"
      },
      {
        "value": "DEVELOPERS",
        "label": "Developers"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "LANGUAGES": {
    "key": "LANGUAGES",
    "label": "Supported Languages",
    "items": [
      {
        "value": "en",
        "label": "English"
      },
      {
        "value": "ar",
        "label": "Arabic"
      },
      {
        "value": "hi",
        "label": "Hindi"
      },
      {
        "value": "mr",
        "label": "Marathi"
      },
      {
        "value": "fr",
        "label": "French"
      },
      {
        "value": "de",
        "label": "German"
      },
      {
        "value": "es",
        "label": "Spanish"
      },
      {
        "value": "pt",
        "label": "Portuguese"
      },
      {
        "value": "it",
        "label": "Italian"
      },
      {
        "value": "ru",
        "label": "Russian"
      },
      {
        "value": "tr",
        "label": "Turkish"
      },
      {
        "value": "zh_CN",
        "label": "Chinese (Simplified)"
      },
      {
        "value": "zh_TW",
        "label": "Chinese (Traditional)"
      },
      {
        "value": "ja",
        "label": "Japanese"
      },
      {
        "value": "ko",
        "label": "Korean"
      },
      {
        "value": "th",
        "label": "Thai"
      },
      {
        "value": "id",
        "label": "Indonesian"
      },
      {
        "value": "ms",
        "label": "Malay"
      },
      {
        "value": "vi",
        "label": "Vietnamese"
      },
      {
        "value": "bn",
        "label": "Bengali"
      },
      {
        "value": "ur",
        "label": "Urdu"
      },
      {
        "value": "other",
        "label": "Other"
      }
    ]
  },
  "SUPPORT_AVAILABILITY": {
    "key": "SUPPORT_AVAILABILITY",
    "label": "Customer Support Availability",
    "items": [
      {
        "value": "24_7",
        "label": "24/7"
      },
      {
        "value": "24_5",
        "label": "24/5"
      },
      {
        "value": "BUSINESS_HOURS",
        "label": "Business hours only"
      },
      {
        "value": "EXTENDED_BUSINESS_HOURS",
        "label": "Extended business hours"
      },
      {
        "value": "BY_APPOINTMENT",
        "label": "By appointment"
      },
      {
        "value": "CUSTOM_SCHEDULE",
        "label": "Custom schedule"
      }
    ]
  },
  "SUPPORT_CHANNELS": {
    "key": "SUPPORT_CHANNELS",
    "label": "Support Channels",
    "items": [
      {
        "value": "BUSINESS_EMAIL",
        "label": "Business email"
      },
      {
        "value": "SUPPORT_TICKET",
        "label": "Support ticket"
      },
      {
        "value": "LIVE_CHAT",
        "label": "Live chat"
      },
      {
        "value": "TELEPHONE",
        "label": "Telephone"
      },
      {
        "value": "CLIENT_PORTAL",
        "label": "Client portal"
      },
      {
        "value": "TELEGRAM",
        "label": "Telegram"
      },
      {
        "value": "WHATSAPP_BUSINESS",
        "label": "WhatsApp Business"
      },
      {
        "value": "MS_TEAMS",
        "label": "Microsoft Teams"
      },
      {
        "value": "VIDEO_CONFERENCE",
        "label": "Video conference"
      },
      {
        "value": "DEDICATED_AM",
        "label": "Dedicated account manager"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "PUBLIC_CONTACT_PREFERENCES": {
    "key": "PUBLIC_CONTACT_PREFERENCES",
    "label": "Public Contact Preferences",
    "items": [
      {
        "value": "EDUTRADEFX_FORM_ONLY",
        "label": "EduTradeFX enquiry form only"
      },
      {
        "value": "PUBLIC_EMAIL",
        "label": "Public business email"
      },
      {
        "value": "PUBLIC_PHONE",
        "label": "Public business telephone"
      },
      {
        "value": "WEBSITE_CONTACT_PAGE",
        "label": "Official website contact page"
      },
      {
        "value": "MULTIPLE_METHODS",
        "label": "Multiple contact methods"
      },
      {
        "value": "NO_PUBLIC_DIRECT_CONTACT",
        "label": "No public direct contact"
      }
    ]
  },
  "SUPPORT_DAYS": {
    "key": "SUPPORT_DAYS",
    "label": "Support Days",
    "items": [
      {
        "value": "MONDAY",
        "label": "Monday"
      },
      {
        "value": "TUESDAY",
        "label": "Tuesday"
      },
      {
        "value": "WEDNESDAY",
        "label": "Wednesday"
      },
      {
        "value": "THURSDAY",
        "label": "Thursday"
      },
      {
        "value": "FRIDAY",
        "label": "Friday"
      },
      {
        "value": "SATURDAY",
        "label": "Saturday"
      },
      {
        "value": "SUNDAY",
        "label": "Sunday"
      },
      {
        "value": "PUBLIC_HOLIDAYS",
        "label": "Public holidays"
      }
    ]
  },
  "PRODUCT_TYPES": {
    "key": "PRODUCT_TYPES",
    "label": "Product Types",
    "items": [
      {
        "value": "SOFTWARE",
        "label": "Software"
      },
      {
        "value": "WEB_APPLICATION",
        "label": "Web application"
      },
      {
        "value": "DESKTOP_APPLICATION",
        "label": "Desktop application"
      },
      {
        "value": "MOBILE_APPLICATION",
        "label": "Mobile application"
      },
      {
        "value": "TRADING_PLATFORM",
        "label": "Trading platform"
      },
      {
        "value": "TRADING_PLUGIN",
        "label": "Trading plugin"
      },
      {
        "value": "API_SDK",
        "label": "API / SDK"
      },
      {
        "value": "BRIDGE_GATEWAY",
        "label": "Bridge / Gateway"
      },
      {
        "value": "LIQUIDITY_SERVICE",
        "label": "Liquidity service"
      },
      {
        "value": "HOSTING_SERVICE",
        "label": "Hosting service"
      },
      {
        "value": "MANAGED_INFRASTRUCTURE",
        "label": "Managed infrastructure"
      },
      {
        "value": "PAYMENT_SOLUTION",
        "label": "Payment solution"
      },
      {
        "value": "FINANCIAL_DATA_SERVICE",
        "label": "Financial data service"
      },
      {
        "value": "COMPLIANCE_SOLUTION",
        "label": "Compliance solution"
      },
      {
        "value": "CONSULTING_SERVICE",
        "label": "Consulting service"
      },
      {
        "value": "BROKERAGE_SETUP_SERVICE",
        "label": "Brokerage setup service"
      },
      {
        "value": "TRADING_INDICATOR",
        "label": "Trading indicator"
      },
      {
        "value": "TRADING_SIGNAL",
        "label": "Trading signal"
      },
      {
        "value": "EXPERT_ADVISOR",
        "label": "Expert Advisor"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "PRODUCT_STATUS": {
    "key": "PRODUCT_STATUS",
    "label": "Product Status",
    "items": [
      {
        "value": "AVAILABLE",
        "label": "Available"
      },
      {
        "value": "LIMITED_AVAILABILITY",
        "label": "Limited availability"
      },
      {
        "value": "BETA",
        "label": "Beta"
      },
      {
        "value": "UNDER_DEVELOPMENT",
        "label": "Under development"
      },
      {
        "value": "DISCONTINUED",
        "label": "Discontinued"
      }
    ]
  },
  "MAIN_PURPOSES": {
    "key": "MAIN_PURPOSES",
    "label": "Main Product Purposes",
    "items": [
      {
        "value": "BROKERAGE_OPERATIONS",
        "label": "Brokerage operations"
      },
      {
        "value": "TRADING_EXECUTION",
        "label": "Trading execution"
      },
      {
        "value": "LIQUIDITY_MANAGEMENT",
        "label": "Liquidity management"
      },
      {
        "value": "RISK_MANAGEMENT",
        "label": "Risk management"
      },
      {
        "value": "CLIENT_ONBOARDING",
        "label": "Client onboarding"
      },
      {
        "value": "CLIENT_MANAGEMENT",
        "label": "Client management"
      },
      {
        "value": "PAYMENT_PROCESSING",
        "label": "Payment processing"
      },
      {
        "value": "MARKET_DATA_DELIVERY",
        "label": "Market data delivery"
      },
      {
        "value": "PLATFORM_ADMINISTRATION",
        "label": "Platform administration"
      },
      {
        "value": "INFRASTRUCTURE_MANAGEMENT",
        "label": "Infrastructure management"
      },
      {
        "value": "COMPLIANCE_VERIFICATION",
        "label": "Compliance and verification"
      },
      {
        "value": "TRADING_ANALYSIS",
        "label": "Trading analysis"
      },
      {
        "value": "TRADING_SIGNALS",
        "label": "Trading signals"
      },
      {
        "value": "AUTOMATED_TRADING",
        "label": "Automated trading"
      },
      {
        "value": "REPORTING_ANALYTICS",
        "label": "Reporting and analytics"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "TARGET_CUSTOMERS": {
    "key": "TARGET_CUSTOMERS",
    "label": "Target Customers",
    "items": [
      {
        "value": "RETAIL_BROKERS",
        "label": "Retail brokers"
      },
      {
        "value": "INSTITUTIONAL_BROKERS",
        "label": "Institutional brokers"
      },
      {
        "value": "NEW_BROKERAGES",
        "label": "New brokerages"
      },
      {
        "value": "ESTABLISHED_BROKERS",
        "label": "Established brokers"
      },
      {
        "value": "PROP_FIRMS",
        "label": "Prop firms"
      },
      {
        "value": "HEDGE_FUNDS",
        "label": "Hedge funds"
      },
      {
        "value": "ASSET_MANAGERS",
        "label": "Asset managers"
      },
      {
        "value": "BANKS",
        "label": "Banks"
      },
      {
        "value": "INTRODUCING_BROKERS",
        "label": "Introducing brokers"
      },
      {
        "value": "FINTECH_COMPANIES",
        "label": "Fintech companies"
      },
      {
        "value": "INDIVIDUAL_TRADERS",
        "label": "Individual traders"
      },
      {
        "value": "DEVELOPERS",
        "label": "Developers"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "PLATFORMS": {
    "key": "PLATFORMS",
    "label": "Trading Platforms",
    "items": [
      {
        "value": "METATRADER_4",
        "label": "MetaTrader 4"
      },
      {
        "value": "METATRADER_5",
        "label": "MetaTrader 5"
      },
      {
        "value": "CTRADER",
        "label": "cTrader"
      },
      {
        "value": "MATCH_TRADER",
        "label": "Match-Trader"
      },
      {
        "value": "DXTRADE",
        "label": "DXtrade"
      },
      {
        "value": "TRADELOCKER",
        "label": "TradeLocker"
      },
      {
        "value": "TRADINGVIEW",
        "label": "TradingView"
      },
      {
        "value": "NINJATRADER",
        "label": "NinjaTrader"
      },
      {
        "value": "THINKORSWIM",
        "label": "Thinkorswim"
      },
      {
        "value": "PROPRIETARY",
        "label": "Proprietary platform"
      },
      {
        "value": "OTHER",
        "label": "Other"
      },
      {
        "value": "NOT_APPLICABLE",
        "label": "Not applicable"
      }
    ]
  },
  "INTEGRATION_METHODS": {
    "key": "INTEGRATION_METHODS",
    "label": "Integration Methods",
    "items": [
      {
        "value": "FIX",
        "label": "FIX"
      },
      {
        "value": "REST_API",
        "label": "REST API"
      },
      {
        "value": "WEBSOCKET",
        "label": "WebSocket"
      },
      {
        "value": "SDK",
        "label": "SDK"
      },
      {
        "value": "PLUGIN",
        "label": "Plugin"
      },
      {
        "value": "WEBHOOK",
        "label": "Webhook"
      },
      {
        "value": "DIRECT_SERVER",
        "label": "Direct server integration"
      },
      {
        "value": "DATABASE",
        "label": "Database integration"
      },
      {
        "value": "CUSTOM",
        "label": "Custom integration"
      },
      {
        "value": "NOT_APPLICABLE",
        "label": "Not applicable"
      }
    ]
  },
  "INTEGRATION_CAPABILITIES": {
    "key": "INTEGRATION_CAPABILITIES",
    "label": "Integration Capabilities",
    "items": [
      {
        "value": "CRM",
        "label": "CRM integration"
      },
      {
        "value": "LIQUIDITY_PROVIDER",
        "label": "Liquidity provider integration"
      },
      {
        "value": "PAYMENT_GATEWAY",
        "label": "Payment gateway integration"
      },
      {
        "value": "TRADING_PLATFORM",
        "label": "Trading platform integration"
      },
      {
        "value": "KYC_PROVIDER",
        "label": "KYC provider integration"
      },
      {
        "value": "RISK_MANAGEMENT",
        "label": "Risk management integration"
      },
      {
        "value": "REPORTING",
        "label": "Reporting integration"
      },
      {
        "value": "CLIENT_PORTAL",
        "label": "Client portal integration"
      },
      {
        "value": "THIRD_PARTY_SOFTWARE",
        "label": "Third-party software integration"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "INTEGRATION_AVAILABILITY": {
    "key": "INTEGRATION_AVAILABILITY",
    "label": "Integration Availability",
    "items": [
      {
        "value": "READY_TO_USE",
        "label": "Ready to use"
      },
      {
        "value": "REQUIRES_CONFIGURATION",
        "label": "Requires configuration"
      },
      {
        "value": "CUSTOM_DEVELOPMENT",
        "label": "Custom development"
      },
      {
        "value": "NOT_AVAILABLE",
        "label": "Not available"
      },
      {
        "value": "ON_REQUEST",
        "label": "On request"
      }
    ]
  },
  "IMAGE_TYPES": {
    "key": "IMAGE_TYPES",
    "label": "Product Image Types",
    "items": [
      {
        "value": "MAIN_PRODUCT_IMAGE",
        "label": "Main product image"
      },
      {
        "value": "DASHBOARD_SCREENSHOT",
        "label": "Dashboard screenshot"
      },
      {
        "value": "SOFTWARE_INTERFACE",
        "label": "Software interface"
      },
      {
        "value": "TECHNICAL_ARCHITECTURE",
        "label": "Technical architecture"
      },
      {
        "value": "PRODUCT_FEATURES",
        "label": "Product features"
      },
      {
        "value": "INTEGRATION_DIAGRAM",
        "label": "Integration diagram"
      },
      {
        "value": "TRADING_SCREENSHOT",
        "label": "Trading screenshot"
      },
      {
        "value": "SETTINGS_CONFIGURATION",
        "label": "Settings / configuration"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "VIDEO_TYPES": {
    "key": "VIDEO_TYPES",
    "label": "Product Video Types",
    "items": [
      {
        "value": "PRODUCT_DEMONSTRATION",
        "label": "Product demonstration"
      },
      {
        "value": "PLATFORM_WALKTHROUGH",
        "label": "Platform walkthrough"
      },
      {
        "value": "INSTALLATION_TUTORIAL",
        "label": "Installation tutorial"
      },
      {
        "value": "FEATURE_EXPLANATION",
        "label": "Feature explanation"
      },
      {
        "value": "WEBINAR",
        "label": "Webinar"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "DOCUMENT_TYPES": {
    "key": "DOCUMENT_TYPES",
    "label": "Product Document Types",
    "items": [
      {
        "value": "PRODUCT_BROCHURE",
        "label": "Product brochure"
      },
      {
        "value": "TECHNICAL_SPECIFICATION",
        "label": "Technical specification"
      },
      {
        "value": "API_DOCUMENTATION",
        "label": "API documentation"
      },
      {
        "value": "INSTALLATION_GUIDE",
        "label": "Installation guide"
      },
      {
        "value": "USER_MANUAL",
        "label": "User manual"
      },
      {
        "value": "INTEGRATION_GUIDE",
        "label": "Integration guide"
      },
      {
        "value": "TERMS_AND_CONDITIONS",
        "label": "Terms and conditions"
      },
      {
        "value": "LICENCE_AGREEMENT",
        "label": "Licence agreement"
      },
      {
        "value": "SECURITY_DOCUMENTATION",
        "label": "Security documentation"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "PRICING_VISIBILITY": {
    "key": "PRICING_VISIBILITY",
    "label": "Pricing Visibility",
    "items": [
      {
        "value": "PUBLIC",
        "label": "Public pricing"
      },
      {
        "value": "STARTING_PRICE",
        "label": "Starting price"
      },
      {
        "value": "INDICATIVE",
        "label": "Indicative pricing"
      },
      {
        "value": "CUSTOM_QUOTE",
        "label": "Custom quotation only"
      },
      {
        "value": "CONFIDENTIAL",
        "label": "Confidential"
      },
      {
        "value": "FREE",
        "label": "Free"
      }
    ]
  },
  "PRICING_MODELS": {
    "key": "PRICING_MODELS",
    "label": "Pricing Models",
    "items": [
      {
        "value": "FREE",
        "label": "Free"
      },
      {
        "value": "ONE_TIME_LICENCE",
        "label": "One-time licence"
      },
      {
        "value": "MONTHLY_SUBSCRIPTION",
        "label": "Monthly subscription"
      },
      {
        "value": "QUARTERLY_SUBSCRIPTION",
        "label": "Quarterly subscription"
      },
      {
        "value": "ANNUAL_SUBSCRIPTION",
        "label": "Annual subscription"
      },
      {
        "value": "PER_ACCOUNT",
        "label": "Per account"
      },
      {
        "value": "PER_ACTIVE_CLIENT",
        "label": "Per active client"
      },
      {
        "value": "PER_USER",
        "label": "Per user"
      },
      {
        "value": "PER_LOT",
        "label": "Per lot"
      },
      {
        "value": "PER_MILLION_VOLUME",
        "label": "Per million trading volume"
      },
      {
        "value": "PER_TRANSACTION",
        "label": "Per transaction"
      },
      {
        "value": "PERCENTAGE_BASED",
        "label": "Percentage based"
      },
      {
        "value": "USAGE_BASED",
        "label": "Usage based"
      },
      {
        "value": "PROJECT_BASED",
        "label": "Project based"
      },
      {
        "value": "HOURLY_CONSULTING",
        "label": "Hourly consulting"
      },
      {
        "value": "DAILY_CONSULTING",
        "label": "Daily consulting"
      },
      {
        "value": "MONTHLY_RETAINER",
        "label": "Monthly retainer"
      },
      {
        "value": "ENTERPRISE_CONTRACT",
        "label": "Enterprise contract"
      },
      {
        "value": "CUSTOM",
        "label": "Custom"
      }
    ]
  },
  "CURRENCIES": {
    "key": "CURRENCIES",
    "label": "Currencies Shortlist",
    "items": [
      {
        "value": "USD",
        "label": "USD"
      },
      {
        "value": "EUR",
        "label": "EUR"
      },
      {
        "value": "GBP",
        "label": "GBP"
      },
      {
        "value": "AED",
        "label": "AED"
      },
      {
        "value": "INR",
        "label": "INR"
      },
      {
        "value": "SGD",
        "label": "SGD"
      },
      {
        "value": "AUD",
        "label": "AUD"
      },
      {
        "value": "CAD",
        "label": "CAD"
      },
      {
        "value": "CHF",
        "label": "CHF"
      },
      {
        "value": "JPY",
        "label": "JPY"
      },
      {
        "value": "ZAR",
        "label": "ZAR"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "CONTRACT_DURATIONS": {
    "key": "CONTRACT_DURATIONS",
    "label": "Contract Durations",
    "items": [
      {
        "value": "NO_MINIMUM",
        "label": "No minimum"
      },
      {
        "value": "1_MONTH",
        "label": "1 month"
      },
      {
        "value": "3_MONTHS",
        "label": "3 months"
      },
      {
        "value": "6_MONTHS",
        "label": "6 months"
      },
      {
        "value": "12_MONTHS",
        "label": "12 months"
      },
      {
        "value": "24_MONTHS",
        "label": "24 months"
      },
      {
        "value": "36_MONTHS",
        "label": "36 months"
      },
      {
        "value": "CUSTOM",
        "label": "Custom"
      }
    ]
  },
  "TEAM_DEPARTMENTS": {
    "key": "TEAM_DEPARTMENTS",
    "label": "Team Departments",
    "items": [
      {
        "value": "FOUNDER_LEADERSHIP",
        "label": "Founder / Leadership"
      },
      {
        "value": "EXECUTIVE_MANAGEMENT",
        "label": "Executive Management"
      },
      {
        "value": "TECHNOLOGY",
        "label": "Technology"
      },
      {
        "value": "PRODUCT",
        "label": "Product"
      },
      {
        "value": "ENGINEERING",
        "label": "Engineering"
      },
      {
        "value": "SALES",
        "label": "Sales"
      },
      {
        "value": "BUSINESS_DEVELOPMENT",
        "label": "Business Development"
      },
      {
        "value": "MARKETING",
        "label": "Marketing"
      },
      {
        "value": "OPERATIONS",
        "label": "Operations"
      },
      {
        "value": "RISK_MANAGEMENT",
        "label": "Risk Management"
      },
      {
        "value": "COMPLIANCE",
        "label": "Compliance"
      },
      {
        "value": "FINANCE",
        "label": "Finance"
      },
      {
        "value": "CUSTOMER_SUPPORT",
        "label": "Customer Support"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "EMPLOYMENT_STATUS": {
    "key": "EMPLOYMENT_STATUS",
    "label": "Employment Status",
    "items": [
      {
        "value": "CURRENT_EMPLOYEE",
        "label": "Current employee"
      },
      {
        "value": "FORMER_EMPLOYEE",
        "label": "Former employee"
      },
      {
        "value": "CONSULTANT",
        "label": "Consultant"
      },
      {
        "value": "CONTRACTOR",
        "label": "Contractor"
      },
      {
        "value": "BOARD_MEMBER",
        "label": "Board member"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "COMPANY_DOCUMENT_TYPES": {
    "key": "COMPANY_DOCUMENT_TYPES",
    "label": "Company Document Types",
    "items": [
      {
        "value": "REGISTRATION_CERTIFICATE",
        "label": "Company registration certificate"
      },
      {
        "value": "BUSINESS_LICENCE",
        "label": "Business licence"
      },
      {
        "value": "FINANCIAL_SERVICES_LICENCE",
        "label": "Financial services licence"
      },
      {
        "value": "REGULATORY_REGISTRATION",
        "label": "Regulatory registration"
      },
      {
        "value": "REGISTERED_ADDRESS_PROOF",
        "label": "Registered address proof"
      },
      {
        "value": "TAX_REGISTRATION",
        "label": "Tax registration"
      },
      {
        "value": "OWNERSHIP_DIRECTOR_DOC",
        "label": "Ownership / director document"
      },
      {
        "value": "SECURITY_CERTIFICATE",
        "label": "Security certificate"
      },
      {
        "value": "ISO_CERTIFICATE",
        "label": "ISO certificate"
      },
      {
        "value": "SOC_REPORT",
        "label": "SOC report"
      },
      {
        "value": "INDUSTRY_MEMBERSHIP",
        "label": "Industry membership"
      },
      {
        "value": "PRODUCT_AUTHORISATION",
        "label": "Product authorisation"
      },
      {
        "value": "OTHER",
        "label": "Other"
      }
    ]
  },
  "COMPANY_EVIDENCE_TYPES": {
    "key": "COMPANY_EVIDENCE_TYPES",
    "label": "Company Evidence Links & Files",
    "items": [
      {
        "value": "WEBSITE",
        "label": "Official company website"
      },
      {
        "value": "REGULATOR_LINK",
        "label": "Official regulator / registration link"
      },
      {
        "value": "SOCIAL_PROFILE",
        "label": "Company social profile"
      },
      {
        "value": "PRODUCT_DOC",
        "label": "Product documentation"
      },
      {
        "value": "INTEGRATION_EVIDENCE",
        "label": "Integration partner evidence"
      },
      {
        "value": "CLIENT_REFERENCES",
        "label": "Client references (with permission)"
      },
      {
        "value": "CASE_STUDIES",
        "label": "Case studies"
      },
      {
        "value": "SUPPORT_DOC",
        "label": "Support documentation"
      },
      {
        "value": "TERMS_OF_SERVICE",
        "label": "Terms of service"
      },
      {
        "value": "PRIVACY_POLICY",
        "label": "Privacy policy"
      },
      {
        "value": "VERIFICATION_CONSENT",
        "label": "Verification consent"
      },
      {
        "value": "DECLARATION_ACCURACY",
        "label": "Declaration of information accuracy"
      }
    ]
  }
};
