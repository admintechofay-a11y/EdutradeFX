import { CategoryFormDefinition } from './types';

export const CATEGORY_07_DEFINITION: CategoryFormDefinition = {
  "number": 7,
  "slug": "market-data-apis-connectivity",
  "name": "Market Data, APIs & Connectivity",
  "shortDescription": "Market data, FIX, REST, WebSocket, SDK and connectivity",
  "mainServices": "Market data, FIX, REST, WebSocket, SDK and connectivity",
  "sortOrder": 7,
  "hasProductForm": false,
  "subcategories": [
    {
      "key": "REAL_TIME_MARKET_DATA",
      "label": "Real-Time Market Data",
      "sortOrder": 1
    },
    {
      "key": "HISTORICAL_DATA",
      "label": "Historical Data",
      "sortOrder": 2
    },
    {
      "key": "FIX_API",
      "label": "FIX API",
      "sortOrder": 3
    },
    {
      "key": "REST_API",
      "label": "REST API",
      "sortOrder": 4
    },
    {
      "key": "WEBSOCKET",
      "label": "WebSocket",
      "sortOrder": 5
    },
    {
      "key": "DATA_FEEDS",
      "label": "Data Feeds",
      "sortOrder": 6
    }
  ],
  "sections": [
    {
      "key": "A",
      "title": "Service type",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 1,
      "fields": [
        {
          "key": "serviceType",
          "label": "Service type",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "FOREX_MARKET_DATA",
              "label": "Forex market data"
            },
            {
              "value": "REAL_TIME_MARKET_DATA",
              "label": "Real-time market data"
            },
            {
              "value": "HISTORICAL_MARKET_DATA",
              "label": "Historical market data"
            },
            {
              "value": "MARKET_DATA_FEEDS",
              "label": "Market data feeds"
            },
            {
              "value": "FIX_CONNECTIVITY",
              "label": "FIX connectivity"
            },
            {
              "value": "REST_API",
              "label": "REST API"
            },
            {
              "value": "WEBSOCKET_API",
              "label": "WebSocket API"
            },
            {
              "value": "FINANCIAL_DATA_API",
              "label": "Financial data API"
            },
            {
              "value": "ECONOMIC_DATA",
              "label": "Economic data"
            },
            {
              "value": "CHARTING_DATA",
              "label": "Charting data"
            },
            {
              "value": "PRICING_FEEDS",
              "label": "Pricing feeds"
            },
            {
              "value": "REFERENCE_DATA",
              "label": "Reference data"
            },
            {
              "value": "DATA_AGGREGATION",
              "label": "Data aggregation"
            },
            {
              "value": "CONNECTIVITY_SERVICES",
              "label": "Connectivity services"
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
      "title": "Asset coverage",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "assetCoverage",
          "label": "Asset coverage",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "FOREX",
              "label": "Forex"
            },
            {
              "value": "METALS",
              "label": "Metals"
            },
            {
              "value": "ENERGY",
              "label": "Energy"
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
              "value": "ETFS",
              "label": "ETFs"
            },
            {
              "value": "BONDS",
              "label": "Bonds"
            },
            {
              "value": "FUTURES",
              "label": "Futures"
            },
            {
              "value": "OPTIONS",
              "label": "Options"
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
      "key": "C",
      "title": "API protocol",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 3,
      "fields": [
        {
          "key": "apiProtocol",
          "label": "API protocol",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "REST",
              "label": "REST"
            },
            {
              "value": "WEBSOCKET",
              "label": "WebSocket"
            },
            {
              "value": "FIX",
              "label": "FIX"
            },
            {
              "value": "SOAP",
              "label": "SOAP"
            },
            {
              "value": "GRAPHQL",
              "label": "GraphQL"
            },
            {
              "value": "SDK",
              "label": "SDK"
            },
            {
              "value": "WEBHOOKS",
              "label": "Webhooks"
            },
            {
              "value": "CUSTOM_PROTOCOL",
              "label": "Custom protocol"
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
      "title": "Data frequency",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 4,
      "fields": [
        {
          "key": "dataFrequency",
          "label": "Data frequency",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "REAL_TIME_STREAMING",
              "label": "Real-time streaming"
            },
            {
              "value": "TICK_BY_TICK",
              "label": "Tick-by-tick"
            },
            {
              "value": "SUB_SECOND",
              "label": "Sub-second"
            },
            {
              "value": "1_SECOND",
              "label": "1-second"
            },
            {
              "value": "5_SECOND",
              "label": "5-second"
            },
            {
              "value": "1_MINUTE",
              "label": "1-minute"
            },
            {
              "value": "5_MINUTE",
              "label": "5-minute"
            },
            {
              "value": "15_MINUTE",
              "label": "15-minute"
            },
            {
              "value": "END_OF_DAY",
              "label": "End-of-day"
            },
            {
              "value": "HISTORICAL_ONLY",
              "label": "Historical only"
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
      "key": "E",
      "title": "Historical data coverage",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 5,
      "fields": [
        {
          "key": "historicalDataCoverage",
          "label": "Historical data coverage",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "LESS_THAN_1_YEAR",
              "label": "Less than 1 year"
            },
            {
              "value": "1_3_YEARS",
              "label": "1\u20133 years"
            },
            {
              "value": "3_5_YEARS",
              "label": "3\u20135 years"
            },
            {
              "value": "5_10_YEARS",
              "label": "5\u201310 years"
            },
            {
              "value": "10_YEARS",
              "label": "10+ years"
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
      "title": "Developer support",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 6,
      "fields": [
        {
          "key": "developerSupport",
          "label": "Developer support",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "PUBLIC_DOCUMENTATION",
              "label": "Public documentation"
            },
            {
              "value": "PRIVATE_DOCUMENTATION",
              "label": "Private documentation"
            },
            {
              "value": "SANDBOX",
              "label": "Sandbox"
            },
            {
              "value": "TEST_CREDENTIALS",
              "label": "Test credentials"
            },
            {
              "value": "SDK",
              "label": "SDK"
            },
            {
              "value": "CODE_EXAMPLES",
              "label": "Code examples"
            },
            {
              "value": "DEVELOPER_SUPPORT",
              "label": "Developer support"
            },
            {
              "value": "INTEGRATION_ASSISTANCE",
              "label": "Integration assistance"
            },
            {
              "value": "WEBHOOKS",
              "label": "Webhooks"
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
      "title": "Usage limits",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 7,
      "fields": [
        {
          "key": "apiRateLimit",
          "label": "API rate limit",
          "type": "NUMBER",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "streamingConnectionLimit",
          "label": "Streaming connection limit",
          "type": "NUMBER",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "concurrentUsers",
          "label": "Concurrent users",
          "type": "NUMBER",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3
        },
        {
          "key": "dataRetention",
          "label": "Data retention",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4,
          "options": [
            {
              "value": "30_DAYS",
              "label": "30 days"
            },
            {
              "value": "90_DAYS",
              "label": "90 days"
            },
            {
              "value": "180_DAYS",
              "label": "180 days"
            },
            {
              "value": "1_YEAR",
              "label": "1 year"
            },
            {
              "value": "3_YEARS",
              "label": "3+ years"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        },
        {
          "key": "redistributionPermitted",
          "label": "Redistribution permitted",
          "type": "TRI_STATE",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5,
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
              "value": "LICENCE_DEPENDENT",
              "label": "Licence dependent"
            }
          ]
        },
        {
          "key": "usagePricing",
          "label": "Usage pricing",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        }
      ]
    }
  ]
};
