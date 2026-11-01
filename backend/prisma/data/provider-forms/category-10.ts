import { CategoryFormDefinition } from './types';

export const CATEGORY_10_DEFINITION: CategoryFormDefinition = {
  "number": 10,
  "slug": "trading-indicators-tools-providers",
  "name": "Trading Indicators & Trading Tools Providers",
  "shortDescription": "Indicators, signals, scanners, dashboards, EAs and trading tools",
  "mainServices": "Indicators, signals, scanners, dashboards, EAs and trading tools",
  "sortOrder": 10,
  "hasProductForm": true,
  "subcategories": [
    {
      "key": "TECHNICAL_INDICATOR",
      "label": "Technical Indicator",
      "sortOrder": 1
    },
    {
      "key": "BUY_SELL_SIGNAL",
      "label": "Buy-Sell Signal",
      "sortOrder": 2
    },
    {
      "key": "EXPERT_ADVISOR",
      "label": "EA",
      "sortOrder": 3
    },
    {
      "key": "MARKET_SCANNER",
      "label": "Market Scanner",
      "sortOrder": 4
    },
    {
      "key": "TRADING_DASHBOARD",
      "label": "Trading Dashboard",
      "sortOrder": 5
    },
    {
      "key": "TRADE_MANAGEMENT_TOOL",
      "label": "Trade Management Tool",
      "sortOrder": 6
    }
  ],
  "sections": [
    {
      "key": "A",
      "title": "Provider type",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 1,
      "fields": [
        {
          "key": "providerType",
          "label": "Provider type",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "REGISTERED_COMPANY",
              "label": "Registered company"
            },
            {
              "value": "INDIVIDUAL_DEVELOPER",
              "label": "Individual developer"
            },
            {
              "value": "DEVELOPMENT_TEAM",
              "label": "Development team"
            },
            {
              "value": "TRADING_EDUCATOR",
              "label": "Trading educator"
            },
            {
              "value": "TECHNOLOGY_VENDOR",
              "label": "Technology vendor"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "B",
      "title": "Developer information",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "providerDeveloperName",
          "label": "Provider / developer name",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "logoOrDeveloperPhoto",
          "label": "Logo or developer photo",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "shortIntroduction",
          "label": "Short introduction",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3
        },
        {
          "key": "fullBiography",
          "label": "Full biography",
          "type": "RICH_TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "website",
          "label": "Website",
          "type": "URL",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5
        },
        {
          "key": "linkedinProfile",
          "label": "LinkedIn profile",
          "type": "URL",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        },
        {
          "key": "tradingviewProfile",
          "label": "TradingView profile",
          "type": "URL",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "mql5Profile",
          "label": "MQL5 profile",
          "type": "URL",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8
        },
        {
          "key": "country",
          "label": "Country",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9
        },
        {
          "key": "city",
          "label": "City",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 10
        },
        {
          "key": "businessEmail",
          "label": "Business email",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 11
        },
        {
          "key": "publicContactPreference",
          "label": "Public contact preference",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 12
        },
        {
          "key": "developmentExperience",
          "label": "Development experience",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 13
        },
        {
          "key": "supportedLanguages",
          "label": "Supported languages",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 14
        },
        {
          "key": "verificationDocuments",
          "label": "Verification documents",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 15
        },
        {
          "key": "lessThan1Year",
          "label": "Less than 1 year",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 16
        },
        {
          "key": "1",
          "label": "1",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 17
        },
        {
          "key": "3",
          "label": "3",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 18
        },
        {
          "key": "6",
          "label": "6",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 19
        },
        {
          "key": "10Years",
          "label": "10+ years",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 20
        },
        {
          "key": "preferNotToDisclose",
          "label": "Prefer not to disclose",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 21
        },
        {
          "key": "publicContactPreference",
          "label": "Public contact preference:",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 22,
          "options": [
            {
              "value": "EDUTRADEFX_CONTACT_FORM",
              "label": "EduTradeFX contact form"
            },
            {
              "value": "BUSINESS_EMAIL",
              "label": "Business email"
            },
            {
              "value": "OFFICIAL_WEBSITE",
              "label": "Official website"
            },
            {
              "value": "PUBLIC_BUSINESS_PHONE",
              "label": "Public business phone"
            },
            {
              "value": "NO_DIRECT_CONTACT",
              "label": "No direct contact"
            }
          ]
        }
      ]
    },
    {
      "key": "C",
      "title": "Individual indicator / trading tool type",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 3,
      "fields": [
        {
          "key": "individualIndicatorTradingToolType",
          "label": "Individual indicator / trading tool type",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "options": [
            {
              "value": "TECHNICAL_INDICATOR",
              "label": "Technical indicator"
            },
            {
              "value": "BUY_SELL_SIGNAL_INDICATOR",
              "label": "Buy / sell signal indicator"
            },
            {
              "value": "SMART_MONEY_CONCEPTS_INDICATOR",
              "label": "Smart Money Concepts indicator"
            },
            {
              "value": "PRICE_ACTION_INDICATOR",
              "label": "Price action indicator"
            },
            {
              "value": "TREND_INDICATOR",
              "label": "Trend indicator"
            },
            {
              "value": "SUPPORT_AND_RESISTANCE_TOOL",
              "label": "Support and resistance tool"
            },
            {
              "value": "VOLUME_AND_ORDER_FLOW_TOOL",
              "label": "Volume and order-flow tool"
            },
            {
              "value": "MARKET_SCANNER",
              "label": "Market scanner"
            },
            {
              "value": "TRADING_DASHBOARD",
              "label": "Trading dashboard"
            },
            {
              "value": "RISK_MANAGEMENT_TOOL",
              "label": "Risk management tool"
            },
            {
              "value": "TRADE_MANAGEMENT_PANEL",
              "label": "Trade management panel"
            },
            {
              "value": "CHARTING_DRAWING_PLUGIN",
              "label": "Charting / drawing plugin"
            },
            {
              "value": "INDICATOR_BUNDLE",
              "label": "Indicator bundle"
            },
            {
              "value": "EXPERT_ADVISOR_AUTOMATED_TRADING_TOOL",
              "label": "Expert Advisor / automated trading tool"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "D",
      "title": "Main purpose",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 4,
      "fields": [
        {
          "key": "mainPurpose",
          "label": "Main purpose",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "options": [
            {
              "value": "TREND_IDENTIFICATION",
              "label": "Trend identification"
            },
            {
              "value": "ENTRY_SIGNALS",
              "label": "Entry signals"
            },
            {
              "value": "EXIT_SIGNALS",
              "label": "Exit signals"
            },
            {
              "value": "SUPPORT_AND_RESISTANCE",
              "label": "Support and resistance"
            },
            {
              "value": "MARKET_STRUCTURE",
              "label": "Market structure"
            },
            {
              "value": "VOLATILITY_ANALYSIS",
              "label": "Volatility analysis"
            },
            {
              "value": "VOLUME_ANALYSIS",
              "label": "Volume analysis"
            },
            {
              "value": "RISK_MANAGEMENT",
              "label": "Risk management"
            },
            {
              "value": "TRADE_MANAGEMENT",
              "label": "Trade management"
            },
            {
              "value": "ALERTS",
              "label": "Alerts"
            },
            {
              "value": "MARKET_SCANNING",
              "label": "Market scanning"
            },
            {
              "value": "BACKTESTING",
              "label": "Backtesting"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "E",
      "title": "Platform compatibility",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 5,
      "fields": [
        {
          "key": "platformCompatibility",
          "label": "Platform compatibility",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "options": [
            {
              "value": "METATRADER_4",
              "label": "MetaTrader 4"
            },
            {
              "value": "METATRADER_5",
              "label": "MetaTrader 5"
            },
            {
              "value": "TRADINGVIEW",
              "label": "TradingView"
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
              "value": "NINJATRADER",
              "label": "NinjaTrader"
            },
            {
              "value": "THINKORSWIM",
              "label": "Thinkorswim"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "F",
      "title": "File format",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 6,
      "fields": [
        {
          "key": "fileFormat",
          "label": "File format",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "options": [
            {
              "value": "EX4",
              "label": "EX4"
            },
            {
              "value": "EX5",
              "label": "EX5"
            },
            {
              "value": "PINE_SCRIPT",
              "label": "Pine Script"
            },
            {
              "value": "SOURCE_CODE",
              "label": "Source code"
            },
            {
              "value": "DLL",
              "label": "DLL"
            },
            {
              "value": "PLUGIN",
              "label": "Plugin"
            },
            {
              "value": "WEB_APPLICATION",
              "label": "Web application"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "G",
      "title": "Operating system",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 7,
      "fields": [
        {
          "key": "operatingSystem",
          "label": "Operating system",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "options": [
            {
              "value": "WINDOWS",
              "label": "Windows"
            },
            {
              "value": "MACOS",
              "label": "macOS"
            },
            {
              "value": "LINUX",
              "label": "Linux"
            },
            {
              "value": "WEB",
              "label": "Web"
            },
            {
              "value": "ANDROID",
              "label": "Android"
            },
            {
              "value": "IOS",
              "label": "iOS"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "H",
      "title": "Supported timeframes",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 8,
      "fields": [
        {
          "key": "supportedTimeframes",
          "label": "Supported timeframes",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "options": [
            {
              "value": "M1",
              "label": "M1"
            },
            {
              "value": "M5",
              "label": "M5"
            },
            {
              "value": "M15",
              "label": "M15"
            },
            {
              "value": "M30",
              "label": "M30"
            },
            {
              "value": "H1",
              "label": "H1"
            },
            {
              "value": "H4",
              "label": "H4"
            },
            {
              "value": "D1",
              "label": "D1"
            },
            {
              "value": "W1",
              "label": "W1"
            },
            {
              "value": "MN",
              "label": "MN"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "I",
      "title": "Supported instruments",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 9,
      "fields": [
        {
          "key": "supportedInstruments",
          "label": "Supported instruments",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "options": [
            {
              "value": "FOREX",
              "label": "Forex"
            },
            {
              "value": "GOLD",
              "label": "Gold"
            },
            {
              "value": "SILVER",
              "label": "Silver"
            },
            {
              "value": "COMMODITIES",
              "label": "Commodities"
            },
            {
              "value": "INDICES",
              "label": "Indices"
            },
            {
              "value": "EQUITIES",
              "label": "Equities"
            },
            {
              "value": "CRYPTO",
              "label": "Crypto"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "J",
      "title": "Indicator methodology",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 10,
      "fields": [
        {
          "key": "indicatorMethodology",
          "label": "Indicator methodology",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "options": [
            {
              "value": "TREND_FOLLOWING",
              "label": "Trend following"
            },
            {
              "value": "SCALPING",
              "label": "Scalping"
            },
            {
              "value": "MOMENTUM",
              "label": "Momentum"
            },
            {
              "value": "BREAKOUT",
              "label": "Breakout"
            },
            {
              "value": "REVERSAL",
              "label": "Reversal"
            },
            {
              "value": "PRICE_ACTION",
              "label": "Price action"
            },
            {
              "value": "SMART_MONEY_CONCEPTS",
              "label": "Smart Money Concepts"
            },
            {
              "value": "SUPPORT_AND_RESISTANCE",
              "label": "Support and resistance"
            },
            {
              "value": "VOLUME_ORDER_FLOW",
              "label": "Volume / order flow"
            },
            {
              "value": "VOLATILITY",
              "label": "Volatility"
            },
            {
              "value": "MULTI_TIMEFRAME",
              "label": "Multi-timeframe"
            },
            {
              "value": "STATISTICAL_QUANTITATIVE",
              "label": "Statistical / quantitative"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "K",
      "title": "Features",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 11,
      "fields": [
        {
          "key": "features",
          "label": "Features",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "options": [
            {
              "value": "BUY_SELL_SIGNALS",
              "label": "Buy / sell signals"
            },
            {
              "value": "TREND_IDENTIFICATION",
              "label": "Trend identification"
            },
            {
              "value": "SUPPORT_RESISTANCE_DETECTION",
              "label": "Support / resistance detection"
            },
            {
              "value": "MARKET_STRUCTURE_ANALYSIS",
              "label": "Market structure analysis"
            },
            {
              "value": "ENTRY_AND_EXIT_LEVELS",
              "label": "Entry and exit levels"
            },
            {
              "value": "STOP_LOSS_LEVELS",
              "label": "Stop-loss levels"
            },
            {
              "value": "TAKE_PROFIT_LEVELS",
              "label": "Take-profit levels"
            },
            {
              "value": "RISK_REWARD_DISPLAY",
              "label": "Risk-reward display"
            },
            {
              "value": "MULTI_TIMEFRAME_ANALYSIS",
              "label": "Multi-timeframe analysis"
            },
            {
              "value": "CUSTOM_ALERTS",
              "label": "Custom alerts"
            },
            {
              "value": "HISTORICAL_SIGNALS",
              "label": "Historical signals"
            },
            {
              "value": "DASHBOARD",
              "label": "Dashboard"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "L",
      "title": "Technical disclosures",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 12,
      "fields": [
        {
          "key": "productVersion",
          "label": "Product version",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "releaseDate",
          "label": "Release date",
          "type": "DATE",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "lastUpdate",
          "label": "Last update",
          "type": "DATE",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3
        },
        {
          "key": "sourceCodeIncluded",
          "label": "Source code included",
          "type": "TRI_STATE",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4,
          "options": [
            {
              "value": "YES",
              "label": "Yes"
            },
            {
              "value": "NO",
              "label": "No"
            },
            {
              "value": "SEPARATE_LICENCE",
              "label": "Separate licence"
            }
          ]
        },
        {
          "key": "eaIntegration",
          "label": "EA integration",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5,
          "options": [
            {
              "value": "SUPPORTED",
              "label": "Supported"
            },
            {
              "value": "NOT_SUPPORTED",
              "label": "Not supported"
            },
            {
              "value": "REQUIRES_CONFIGURATION",
              "label": "Requires configuration"
            }
          ],
          "allowOther": false
        },
        {
          "key": "multi",
          "label": "Multi",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6,
          "options": [
            {
              "value": "TIMEFRAME_SUPPORT_YES",
              "label": "timeframe support \u2014 Yes"
            },
            {
              "value": "NO",
              "label": "No"
            }
          ],
          "allowOther": false
        },
        {
          "key": "customisableParameters",
          "label": "Customisable parameters",
          "type": "YES_NO",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "alertTypes",
          "label": "Alert types",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8,
          "options": [
            {
              "value": "POPUP",
              "label": "Popup"
            },
            {
              "value": "SOUND",
              "label": "Sound"
            },
            {
              "value": "EMAIL",
              "label": "Email"
            },
            {
              "value": "PUSH",
              "label": "Push"
            },
            {
              "value": "WEBHOOK",
              "label": "Webhook"
            },
            {
              "value": "NONE",
              "label": "None"
            }
          ],
          "allowOther": false
        },
        {
          "key": "trialDuration",
          "label": "Trial duration",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9
        },
        {
          "key": "calculationMethodology",
          "label": "Calculation methodology",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 10
        },
        {
          "key": "repaintingBehaviour",
          "label": "Repainting behaviour",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 11,
          "options": [
            {
              "value": "DOES_NOT_REPAINT_SUPPORTED_BY_DISCLOSED_TESTING",
              "label": "Does not repaint, supported by disclosed testing"
            },
            {
              "value": "MAY_REPAINT_UNDER_SPECIFIED_CONDITIONS",
              "label": "May repaint under specified conditions"
            },
            {
              "value": "NOT_ESTABLISHED",
              "label": "Not established"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true
        },
        {
          "key": "backtestEvidence",
          "label": "Backtest evidence",
          "type": "URL",
          "required": false,
          "scope": "PRODUCT",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 12
        },
        {
          "key": "testingMethodology",
          "label": "Testing methodology",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 13
        },
        {
          "key": "testingPeriod",
          "label": "Testing period",
          "type": "DATE_RANGE",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 14
        },
        {
          "key": "transactionCostsIncluded",
          "label": "Transaction costs included",
          "type": "TRI_STATE",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 15,
          "options": [
            {
              "value": "YES",
              "label": "Yes"
            },
            {
              "value": "NO",
              "label": "No"
            },
            {
              "value": "NOT_APPLICABLE",
              "label": "Not applicable"
            }
          ]
        },
        {
          "key": "knownLimitations",
          "label": "Known limitations",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 16
        }
      ]
    },
    {
      "key": "M",
      "title": "Product screenshots and gallery",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 13,
      "fields": [
        {
          "key": "forEachImage",
          "label": "For each image:",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        },
        {
          "key": "imageUpload",
          "label": "Image upload",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 2
        },
        {
          "key": "imageTitle",
          "label": "Image title",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 3
        },
        {
          "key": "description",
          "label": "Description",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 4
        },
        {
          "key": "platform",
          "label": "Platform",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 5
        },
        {
          "key": "timeframe",
          "label": "Timeframe",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 6
        },
        {
          "key": "instrumentSymbol",
          "label": "Instrument / symbol",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 7
        },
        {
          "key": "screenshotType",
          "label": "Screenshot type",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8,
          "options": [
            {
              "value": "MAIN_CHART",
              "label": "Main chart"
            },
            {
              "value": "BUY_SIGNAL",
              "label": "Buy signal"
            },
            {
              "value": "SELL_SIGNAL",
              "label": "Sell signal"
            },
            {
              "value": "SETTINGS",
              "label": "Settings"
            },
            {
              "value": "DASHBOARD",
              "label": "Dashboard"
            },
            {
              "value": "BACKTEST",
              "label": "Backtest"
            },
            {
              "value": "MULTI_TIMEFRAME",
              "label": "Multi-timeframe"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true
        },
        {
          "key": "coverImage",
          "label": "Cover image",
          "type": "YES_NO",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9
        },
        {
          "key": "displayOrder",
          "label": "Display order",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 10
        },
        {
          "key": "rightsConfirmation",
          "label": "Rights confirmation",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 11
        }
      ]
    },
    {
      "key": "N",
      "title": "Trading tool licence and pricing",
      "description": null,
      "scope": "PRODUCT",
      "sortOrder": 14,
      "fields": [
        {
          "key": "accessType",
          "label": "Access type",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1,
          "options": [
            {
              "value": "FREE",
              "label": "Free"
            },
            {
              "value": "PAID",
              "label": "Paid"
            },
            {
              "value": "FREEMIUM",
              "label": "Freemium"
            },
            {
              "value": "SUBSCRIPTION",
              "label": "Subscription"
            },
            {
              "value": "CUSTOM_LICENCE",
              "label": "Custom licence"
            }
          ],
          "allowOther": false
        },
        {
          "key": "currency",
          "label": "Currency",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2,
          "options": [
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
              "value": "INR",
              "label": "INR"
            },
            {
              "value": "AED",
              "label": "AED"
            },
            {
              "value": "SGD",
              "label": "SGD"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true
        },
        {
          "key": "paymentFrequency",
          "label": "Payment frequency",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3,
          "options": [
            {
              "value": "ONE_TIME",
              "label": "One-time"
            },
            {
              "value": "MONTHLY",
              "label": "Monthly"
            },
            {
              "value": "QUARTERLY",
              "label": "Quarterly"
            },
            {
              "value": "ANNUAL",
              "label": "Annual"
            },
            {
              "value": "LIFETIME",
              "label": "Lifetime"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        },
        {
          "key": "licenceType",
          "label": "Licence type",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4,
          "options": [
            {
              "value": "PERSONAL",
              "label": "Personal"
            },
            {
              "value": "COMMERCIAL",
              "label": "Commercial"
            },
            {
              "value": "MULTI_USER",
              "label": "Multi-user"
            },
            {
              "value": "BROKER",
              "label": "Broker"
            },
            {
              "value": "PROP_FIRM",
              "label": "Prop-firm"
            },
            {
              "value": "DEVELOPER",
              "label": "Developer"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true
        },
        {
          "key": "price",
          "label": "Price",
          "type": "MONEY",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5
        },
        {
          "key": "freeTrial",
          "label": "Free trial",
          "type": "YES_NO",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        },
        {
          "key": "trialDuration",
          "label": "Trial duration",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "demoAvailable",
          "label": "Demo available",
          "type": "YES_NO",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8
        },
        {
          "key": "permittedDevices",
          "label": "Permitted devices",
          "type": "NUMBER",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9
        },
        {
          "key": "updatesIncluded",
          "label": "Updates included",
          "type": "YES_NO",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 10
        },
        {
          "key": "supportIncluded",
          "label": "Support included",
          "type": "YES_NO",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 11
        },
        {
          "key": "refundPolicy",
          "label": "Refund policy",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 12
        },
        {
          "key": "purchaseLink",
          "label": "Purchase link",
          "type": "URL",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 13
        },
        {
          "key": "termsAndConditions",
          "label": "Terms and conditions",
          "type": "URL",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 14
        },
        {
          "key": "7Form5",
          "label": "7. Form 5",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PRODUCT",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 15,
          "options": [
            {
              "value": "PRODUCT",
              "label": "Product"
            },
            {
              "value": "SERVICE_REGISTRATION",
              "label": "Service registration"
            }
          ],
          "allowOther": false
        },
        {
          "key": "completedSeparatelyForEveryProduct",
          "label": "Completed separately for every product",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 16
        },
        {
          "key": "thisIsASeparateFormFromCompanyRegistrationAndCategoryOnboardingEveryProviderCanAddAsManyProductsAndServicesAsRequired",
          "label": "This is a separate form from company registration and category onboarding. Every provider can add as many products and services as required.",
          "type": "TEXT",
          "required": false,
          "scope": "PRODUCT",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 17
        }
      ]
    },
    {
      "key": "A",
      "title": "Basic product information",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 15,
      "fields": [
        {
          "key": "productServiceName",
          "label": "Product / service name",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "productLogo",
          "label": "Product logo",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "productThumbnail",
          "label": "Product thumbnail",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3
        },
        {
          "key": "shortDescription",
          "label": "Short description",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "fullDescription",
          "label": "Full description",
          "type": "RICH_TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5
        },
        {
          "key": "productType",
          "label": "Product type",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        },
        {
          "key": "productVersion",
          "label": "Product version",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "initialReleaseDate",
          "label": "Initial release date",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8
        },
        {
          "key": "latestUpdateDate",
          "label": "Latest update date",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9
        }
      ]
    }
  ]
};
