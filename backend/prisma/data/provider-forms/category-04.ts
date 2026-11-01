import { CategoryFormDefinition } from './types';

export const CATEGORY_04_DEFINITION: CategoryFormDefinition = {
  "number": 4,
  "slug": "trading-platforms-administrator-solutions",
  "name": "Trading Platforms & Administrator Solutions",
  "shortDescription": "MT4/MT5, other platforms, white labels and platform administration",
  "mainServices": "MT4/MT5, other platforms, white labels and platform administration",
  "sortOrder": 4,
  "hasProductForm": false,
  "subcategories": [
    {
      "key": "MT4_MT5",
      "label": "MT4 / MT5",
      "sortOrder": 1
    },
    {
      "key": "CTRADER",
      "label": "cTrader",
      "sortOrder": 2
    },
    {
      "key": "WHITE_LABEL",
      "label": "White Label",
      "sortOrder": 3
    },
    {
      "key": "PLATFORM_ADMINISTRATION",
      "label": "Platform Administration",
      "sortOrder": 4
    },
    {
      "key": "SERVER_MANAGEMENT",
      "label": "Server Management",
      "sortOrder": 5
    }
  ],
  "sections": [
    {
      "key": "A",
      "title": "Provider role",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 1,
      "fields": [
        {
          "key": "providerRole",
          "label": "Provider role",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "PLATFORM_OWNER",
              "label": "Platform owner"
            },
            {
              "value": "AUTHORISED_PLATFORM_DISTRIBUTOR",
              "label": "Authorised platform distributor"
            },
            {
              "value": "WHITE_LABEL_PROVIDER",
              "label": "White-label provider"
            },
            {
              "value": "PLATFORM_ADMINISTRATOR",
              "label": "Platform administrator"
            },
            {
              "value": "SERVER_ADMINISTRATOR",
              "label": "Server administrator"
            },
            {
              "value": "PLATFORM_TECHNOLOGY_INTEGRATOR",
              "label": "Platform technology integrator"
            },
            {
              "value": "MANAGED_PLATFORM_SERVICE_PROVIDER",
              "label": "Managed platform service provider"
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
      "title": "Platform type",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "platformType",
          "label": "Platform type",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
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
              "value": "PROPRIETARY_PLATFORM",
              "label": "Proprietary platform"
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
      "key": "C",
      "title": "Service type",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 3,
      "fields": [
        {
          "key": "serviceType",
          "label": "Service type",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "FULL_TRADING_PLATFORM",
              "label": "Full trading platform"
            },
            {
              "value": "WHITE_LABEL_PLATFORM",
              "label": "White-label platform"
            },
            {
              "value": "PLATFORM_LICENSING",
              "label": "Platform licensing"
            },
            {
              "value": "PLATFORM_SERVER_ADMINISTRATION",
              "label": "Platform server administration"
            },
            {
              "value": "SERVER_SETUP",
              "label": "Server setup"
            },
            {
              "value": "PLATFORM_MIGRATION",
              "label": "Platform migration"
            },
            {
              "value": "PLATFORM_CONFIGURATION",
              "label": "Platform configuration"
            },
            {
              "value": "ADMINISTRATOR_TOOLS",
              "label": "Administrator tools"
            },
            {
              "value": "PLUGIN_INTEGRATION",
              "label": "Plugin integration"
            },
            {
              "value": "MOBILE_APPLICATION",
              "label": "Mobile application"
            },
            {
              "value": "WEB_TRADING_PLATFORM",
              "label": "Web trading platform"
            },
            {
              "value": "DESKTOP_TRADING_PLATFORM",
              "label": "Desktop trading platform"
            },
            {
              "value": "PLATFORM_MAINTENANCE",
              "label": "Platform maintenance"
            },
            {
              "value": "TECHNICAL_SUPPORT",
              "label": "Technical support"
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
      "title": "Platform features",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 4,
      "fields": [
        {
          "key": "platformFeatures",
          "label": "Platform features",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "DESKTOP_APPLICATION",
              "label": "Desktop application"
            },
            {
              "value": "WEB_TERMINAL",
              "label": "Web terminal"
            },
            {
              "value": "IOS_APPLICATION",
              "label": "iOS application"
            },
            {
              "value": "ANDROID_APPLICATION",
              "label": "Android application"
            },
            {
              "value": "MARKET_EXECUTION",
              "label": "Market execution"
            },
            {
              "value": "PENDING_ORDERS",
              "label": "Pending orders"
            },
            {
              "value": "ADVANCED_CHARTING",
              "label": "Advanced charting"
            },
            {
              "value": "TECHNICAL_INDICATORS",
              "label": "Technical indicators"
            },
            {
              "value": "EXPERT_ADVISORS",
              "label": "Expert Advisors"
            },
            {
              "value": "COPY_TRADING",
              "label": "Copy trading"
            },
            {
              "value": "MULTI_ASSET_TRADING",
              "label": "Multi-asset trading"
            },
            {
              "value": "ACCOUNT_MANAGEMENT",
              "label": "Account management"
            },
            {
              "value": "RISK_MANAGEMENT",
              "label": "Risk management"
            },
            {
              "value": "REPORTING",
              "label": "Reporting"
            },
            {
              "value": "API_CONNECTIVITY",
              "label": "API connectivity"
            },
            {
              "value": "MULTI_LANGUAGE_SUPPORT",
              "label": "Multi-language support"
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
      "title": "Administrator features",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 5,
      "fields": [
        {
          "key": "administratorFeatures",
          "label": "Administrator features",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "SERVER_MANAGEMENT",
              "label": "Server management"
            },
            {
              "value": "USER_MANAGEMENT",
              "label": "User management"
            },
            {
              "value": "ACCOUNT_GROUP_MANAGEMENT",
              "label": "Account group management"
            },
            {
              "value": "SYMBOL_MANAGEMENT",
              "label": "Symbol management"
            },
            {
              "value": "TRADING_CONDITIONS_MANAGEMENT",
              "label": "Trading conditions management"
            },
            {
              "value": "PERMISSIONS_MANAGEMENT",
              "label": "Permissions management"
            },
            {
              "value": "PLUGIN_MANAGEMENT",
              "label": "Plugin management"
            },
            {
              "value": "REPORTING_AND_MONITORING",
              "label": "Reporting and monitoring"
            },
            {
              "value": "BACKUP_AND_RECOVERY",
              "label": "Backup and recovery"
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
      "title": "Licensing and implementation",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 6,
      "fields": [
        {
          "key": "licensingArrangement",
          "label": "Licensing arrangement",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1,
          "options": [
            {
              "value": "DIRECT",
              "label": "Direct"
            },
            {
              "value": "AUTHORISED_RESELLER",
              "label": "Authorised reseller"
            },
            {
              "value": "WHITE_LABEL_AGREEMENT",
              "label": "White-label agreement"
            },
            {
              "value": "MANAGED_SERVICE",
              "label": "Managed service"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true
        },
        {
          "key": "brandingCustomisation",
          "label": "Branding customisation",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2,
          "options": [
            {
              "value": "FULL",
              "label": "Full"
            },
            {
              "value": "PARTIAL",
              "label": "Partial"
            },
            {
              "value": "NOT_AVAILABLE",
              "label": "Not available"
            }
          ],
          "allowOther": false
        },
        {
          "key": "third",
          "label": "Third",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3,
          "options": [
            {
              "value": "PARTY_DEPENDENCIES_YES",
              "label": "party dependencies \u2014 Yes"
            },
            {
              "value": "NO_DETAILS",
              "label": "No + details"
            }
          ],
          "allowOther": false
        },
        {
          "key": "setupSupport",
          "label": "Setup support",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "dataMigration",
          "label": "Data migration",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5
        },
        {
          "key": "serverMigration",
          "label": "Server migration",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        },
        {
          "key": "implementationTime",
          "label": "Implementation time",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7,
          "options": [
            {
              "value": "1_3_DAYS",
              "label": "1\u20133 days"
            },
            {
              "value": "4_7_DAYS",
              "label": "4\u20137 days"
            },
            {
              "value": "1_2_WEEKS",
              "label": "1\u20132 weeks"
            },
            {
              "value": "3_4_WEEKS",
              "label": "3\u20134 weeks"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        }
      ]
    }
  ]
};
