import { CategoryFormDefinition } from './types';

export const CATEGORY_03_DEFINITION: CategoryFormDefinition = {
  "number": 3,
  "slug": "crm-back-office-client-management",
  "name": "CRM, Back Office & Client Management",
  "shortDescription": "CRM, client portals, IB management, onboarding and back office",
  "mainServices": "CRM, client portals, IB management, onboarding and back office",
  "sortOrder": 3,
  "hasProductForm": false,
  "subcategories": [
    {
      "key": "FOREX_CRM",
      "label": "Forex CRM",
      "sortOrder": 1
    },
    {
      "key": "CLIENT_PORTAL",
      "label": "Client Portal",
      "sortOrder": 2
    },
    {
      "key": "BACK_OFFICE",
      "label": "Back Office",
      "sortOrder": 3
    },
    {
      "key": "IB_MANAGEMENT",
      "label": "IB Management",
      "sortOrder": 4
    },
    {
      "key": "PAMM_MAM",
      "label": "PAMM / MAM",
      "sortOrder": 5
    },
    {
      "key": "COPY_TRADING",
      "label": "Copy Trading",
      "sortOrder": 6
    },
    {
      "key": "REPORTING",
      "label": "Reporting",
      "sortOrder": 7
    }
  ],
  "sections": [
    {
      "key": "A",
      "title": "Product type",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 1,
      "fields": [
        {
          "key": "productType",
          "label": "Product type",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "FOREX_CRM",
              "label": "Forex CRM"
            },
            {
              "value": "BROKER_CRM",
              "label": "Broker CRM"
            },
            {
              "value": "CLIENT_PORTAL",
              "label": "Client portal"
            },
            {
              "value": "BACK_OFFICE_SYSTEM",
              "label": "Back-office system"
            },
            {
              "value": "IB_MANAGEMENT_SYSTEM",
              "label": "IB management system"
            },
            {
              "value": "AFFILIATE_MANAGEMENT",
              "label": "Affiliate management"
            },
            {
              "value": "PAMM_SYSTEM",
              "label": "PAMM system"
            },
            {
              "value": "MAM_SYSTEM",
              "label": "MAM system"
            },
            {
              "value": "COPY_TRADING_MANAGEMENT",
              "label": "Copy trading management"
            },
            {
              "value": "PROP_FIRM_CRM",
              "label": "Prop-firm CRM"
            },
            {
              "value": "MULTI_ENTITY_CRM",
              "label": "Multi-entity CRM"
            },
            {
              "value": "REPORTING_DASHBOARD",
              "label": "Reporting dashboard"
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
      "title": "CRM modules",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "crmModules",
          "label": "CRM modules",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "LEAD_MANAGEMENT",
              "label": "Lead management"
            },
            {
              "value": "SALES_PIPELINE",
              "label": "Sales pipeline"
            },
            {
              "value": "CLIENT_REGISTRATION",
              "label": "Client registration"
            },
            {
              "value": "CLIENT_ONBOARDING",
              "label": "Client onboarding"
            },
            {
              "value": "KYC_DOCUMENT_MANAGEMENT",
              "label": "KYC document management"
            },
            {
              "value": "ACCOUNT_MANAGEMENT",
              "label": "Account management"
            },
            {
              "value": "CLIENT_SEGMENTATION",
              "label": "Client segmentation"
            },
            {
              "value": "MARKETING_AUTOMATION",
              "label": "Marketing automation"
            },
            {
              "value": "EMAIL_NOTIFICATIONS",
              "label": "Email notifications"
            },
            {
              "value": "SMS_NOTIFICATIONS",
              "label": "SMS notifications"
            },
            {
              "value": "PUSH_NOTIFICATIONS",
              "label": "Push notifications"
            },
            {
              "value": "CLIENT_RETENTION",
              "label": "Client retention"
            },
            {
              "value": "REPORTING_AND_ANALYTICS",
              "label": "Reporting and analytics"
            },
            {
              "value": "USER_MANAGEMENT",
              "label": "User management"
            },
            {
              "value": "MULTI_LANGUAGE_SUPPORT",
              "label": "Multi-language support"
            },
            {
              "value": "MULTI_BRAND_SUPPORT",
              "label": "Multi-brand support"
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
      "title": "Back",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 3,
      "fields": [
        {
          "key": "back",
          "label": "Back",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "DEPOSIT_MANAGEMENT",
              "label": "Deposit management"
            },
            {
              "value": "WITHDRAWAL_MANAGEMENT",
              "label": "Withdrawal management"
            },
            {
              "value": "PAYMENT_RECONCILIATION",
              "label": "Payment reconciliation"
            },
            {
              "value": "TRADING_ACCOUNT_MANAGEMENT",
              "label": "Trading account management"
            },
            {
              "value": "ACCOUNT_GROUPS",
              "label": "Account groups"
            },
            {
              "value": "ACCOUNT_PERMISSIONS",
              "label": "Account permissions"
            },
            {
              "value": "BONUS_MANAGEMENT",
              "label": "Bonus management"
            },
            {
              "value": "COMMISSION_MANAGEMENT",
              "label": "Commission management"
            },
            {
              "value": "REBATE_MANAGEMENT",
              "label": "Rebate management"
            },
            {
              "value": "IB_HIERARCHY",
              "label": "IB hierarchy"
            },
            {
              "value": "MULTI_LEVEL_IB",
              "label": "Multi-level IB"
            },
            {
              "value": "AFFILIATE_TRACKING",
              "label": "Affiliate tracking"
            },
            {
              "value": "CLIENT_REPORTING",
              "label": "Client reporting"
            },
            {
              "value": "FINANCIAL_REPORTING",
              "label": "Financial reporting"
            },
            {
              "value": "AUDIT_LOGS",
              "label": "Audit logs"
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
      "title": "Platform and service integrations",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 4,
      "fields": [
        {
          "key": "platformAndServiceIntegrations",
          "label": "Platform and service integrations",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "MT4",
              "label": "MT4"
            },
            {
              "value": "MT5",
              "label": "MT5"
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
              "value": "PAYMENT_GATEWAYS",
              "label": "Payment gateways"
            },
            {
              "value": "KYC_PROVIDERS",
              "label": "KYC providers"
            },
            {
              "value": "LIQUIDITY_BRIDGES",
              "label": "Liquidity bridges"
            },
            {
              "value": "EMAIL_SYSTEMS",
              "label": "Email systems"
            },
            {
              "value": "SMS_SYSTEMS",
              "label": "SMS systems"
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
      "title": "Deployment",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 5,
      "fields": [
        {
          "key": "deployment",
          "label": "Deployment",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "CLOUD_SAAS",
              "label": "Cloud SaaS"
            },
            {
              "value": "DEDICATED_INSTANCE",
              "label": "Dedicated instance"
            },
            {
              "value": "ON_PREMISES",
              "label": "On-premises"
            },
            {
              "value": "PRIVATE_CLOUD",
              "label": "Private cloud"
            },
            {
              "value": "HYBRID",
              "label": "Hybrid"
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
      "key": "F",
      "title": "Technical capabilities",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 6,
      "fields": [
        {
          "key": "restApi",
          "label": "REST API",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "webhooks",
          "label": "Webhooks",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "fixIntegration",
          "label": "FIX integration",
          "type": "TRI_STATE",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3,
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
          "key": "multi",
          "label": "Multi",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4,
          "options": [
            {
              "value": "TENANT_YES",
              "label": "tenant \u2014 Yes"
            },
            {
              "value": "NO",
              "label": "No"
            }
          ],
          "allowOther": false
        },
        {
          "key": "multi",
          "label": "Multi",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5,
          "options": [
            {
              "value": "BRAND_YES",
              "label": "brand \u2014 Yes"
            },
            {
              "value": "NO",
              "label": "No"
            }
          ],
          "allowOther": false
        },
        {
          "key": "multi",
          "label": "Multi",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6,
          "options": [
            {
              "value": "LANGUAGE_YES",
              "label": "language \u2014 Yes"
            },
            {
              "value": "NO",
              "label": "No"
            }
          ],
          "allowOther": false
        },
        {
          "key": "customWorkflow",
          "label": "Custom workflow",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "role",
          "label": "Role",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8,
          "options": [
            {
              "value": "BASED_PERMISSIONS_YES",
              "label": "based permissions \u2014 Yes"
            },
            {
              "value": "NO",
              "label": "No"
            }
          ],
          "allowOther": false
        },
        {
          "key": "auditLogs",
          "label": "Audit logs",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9
        },
        {
          "key": "dataExport",
          "label": "Data export",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 10,
          "options": [
            {
              "value": "CSV",
              "label": "CSV"
            },
            {
              "value": "EXCEL",
              "label": "Excel"
            },
            {
              "value": "PDF",
              "label": "PDF"
            },
            {
              "value": "API",
              "label": "API"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true
        }
      ]
    },
    {
      "key": "G",
      "title": "Commercial model",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 7,
      "fields": [
        {
          "key": "commercialModel",
          "label": "Commercial model",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "PER_ACTIVE_ACCOUNT",
              "label": "Per active account"
            },
            {
              "value": "PER_REGISTERED_CLIENT",
              "label": "Per registered client"
            },
            {
              "value": "PER_USER",
              "label": "Per user"
            },
            {
              "value": "MONTHLY_SUBSCRIPTION",
              "label": "Monthly subscription"
            },
            {
              "value": "ANNUAL_SUBSCRIPTION",
              "label": "Annual subscription"
            },
            {
              "value": "ONE_TIME_LICENCE",
              "label": "One-time licence"
            },
            {
              "value": "PER_MODULE",
              "label": "Per module"
            },
            {
              "value": "CUSTOM_ENTERPRISE_PRICING",
              "label": "Custom enterprise pricing"
            }
          ],
          "allowOther": false,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    }
  ]
};
