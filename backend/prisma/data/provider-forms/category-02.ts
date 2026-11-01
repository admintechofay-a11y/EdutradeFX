import { CategoryFormDefinition } from './types';

export const CATEGORY_02_DEFINITION: CategoryFormDefinition = {
  "number": 2,
  "slug": "liquidity-providers-prime-of-prime",
  "name": "Liquidity Providers & Prime-of-Prime",
  "shortDescription": "Institutional liquidity, market access, prime-of-prime",
  "mainServices": "Institutional liquidity, market access, prime-of-prime",
  "sortOrder": 2,
  "hasProductForm": false,
  "subcategories": [
    {
      "key": "FOREX_LIQUIDITY",
      "label": "Forex Liquidity",
      "sortOrder": 1
    },
    {
      "key": "MULTI_ASSET_LIQUIDITY",
      "label": "Multi-Asset Liquidity",
      "sortOrder": 2
    },
    {
      "key": "PRIME_OF_PRIME",
      "label": "Prime-of-Prime",
      "sortOrder": 3
    },
    {
      "key": "INSTITUTIONAL_LIQUIDITY",
      "label": "Institutional Liquidity",
      "sortOrder": 4
    },
    {
      "key": "MARKET_ACCESS",
      "label": "Market Access",
      "sortOrder": 5
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
              "value": "TIER_1_LIQUIDITY_PROVIDER",
              "label": "Tier-1 liquidity provider"
            },
            {
              "value": "PRIME_OF_PRIME",
              "label": "Prime-of-Prime"
            },
            {
              "value": "PRIME_BROKER",
              "label": "Prime broker"
            },
            {
              "value": "NON_BANK_LIQUIDITY_PROVIDER",
              "label": "Non-bank liquidity provider"
            },
            {
              "value": "BANK_LIQUIDITY_PROVIDER",
              "label": "Bank liquidity provider"
            },
            {
              "value": "MULTI_ASSET_LIQUIDITY_PROVIDER",
              "label": "Multi-asset liquidity provider"
            },
            {
              "value": "REGIONAL_LIQUIDITY_PROVIDER",
              "label": "Regional liquidity provider"
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
      "title": "Liquidity model",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "liquidityModel",
          "label": "Liquidity model",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "SINGLE_SOURCE_LIQUIDITY",
              "label": "Single-source liquidity"
            },
            {
              "value": "AGGREGATED_LIQUIDITY",
              "label": "Aggregated liquidity"
            },
            {
              "value": "DISCLOSED_LIQUIDITY",
              "label": "Disclosed liquidity"
            },
            {
              "value": "ANONYMOUS_LIQUIDITY",
              "label": "Anonymous liquidity"
            },
            {
              "value": "DIRECT_MARKET_ACCESS",
              "label": "Direct market access"
            },
            {
              "value": "PRIME_OF_PRIME_ARRANGEMENT",
              "label": "Prime-of-Prime arrangement"
            },
            {
              "value": "CUSTOM_ARRANGEMENT",
              "label": "Custom arrangement"
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
      "title": "Asset classes",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 3,
      "fields": [
        {
          "key": "assetClasses",
          "label": "Asset classes",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "FOREX",
              "label": "Forex"
            },
            {
              "value": "PRECIOUS_METALS",
              "label": "Precious metals"
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
              "value": "GLOBAL_INDICES",
              "label": "Global indices"
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
              "value": "DIGITAL_ASSETS_CRYPTO",
              "label": "Digital assets / crypto"
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
      "title": "Instruments offered",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 4,
      "fields": [
        {
          "key": "instrumentsOffered",
          "label": "Instruments offered",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "MAJOR_FX_PAIRS",
              "label": "Major FX pairs"
            },
            {
              "value": "MINOR_FX_PAIRS",
              "label": "Minor FX pairs"
            },
            {
              "value": "EXOTIC_FX_PAIRS",
              "label": "Exotic FX pairs"
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
              "value": "PLATINUM",
              "label": "Platinum"
            },
            {
              "value": "OIL",
              "label": "Oil"
            },
            {
              "value": "NATURAL_GAS",
              "label": "Natural gas"
            },
            {
              "value": "GLOBAL_INDICES",
              "label": "Global indices"
            },
            {
              "value": "US_EQUITIES",
              "label": "US equities"
            },
            {
              "value": "EUROPEAN_EQUITIES",
              "label": "European equities"
            },
            {
              "value": "ASIAN_EQUITIES",
              "label": "Asian equities"
            },
            {
              "value": "CRYPTO_PAIRS",
              "label": "Crypto pairs"
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
      "title": "Execution model",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 5,
      "fields": [
        {
          "key": "executionModel",
          "label": "Execution model",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "MARKET_EXECUTION",
              "label": "Market execution"
            },
            {
              "value": "LIMIT_ORDERS",
              "label": "Limit orders"
            },
            {
              "value": "STOP_ORDERS",
              "label": "Stop orders"
            },
            {
              "value": "IOC",
              "label": "IOC"
            },
            {
              "value": "FOK",
              "label": "FOK"
            },
            {
              "value": "GTC",
              "label": "GTC"
            },
            {
              "value": "DMA",
              "label": "DMA"
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
      "title": "Connectivity",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 6,
      "fields": [
        {
          "key": "connectivity",
          "label": "Connectivity",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "FIX_API",
              "label": "FIX API"
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
      "key": "G",
      "title": "Trading conditions",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 7,
      "fields": [
        {
          "key": "minimumDepositCollateral",
          "label": "Minimum deposit / collateral",
          "type": "MONEY",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "minimumTradeSize",
          "label": "Minimum trade size",
          "type": "NUMBER",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "maximumTradeSize",
          "label": "Maximum trade size",
          "type": "NUMBER",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3
        },
        {
          "key": "commissionModel",
          "label": "Commission model",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4,
          "options": [
            {
              "value": "PER_MILLION_USD",
              "label": "Per million USD"
            },
            {
              "value": "PER_LOT",
              "label": "Per lot"
            },
            {
              "value": "PER_SIDE",
              "label": "Per side"
            },
            {
              "value": "ROUND_TURN",
              "label": "Round-turn"
            },
            {
              "value": "PERCENTAGE",
              "label": "Percentage"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        },
        {
          "key": "spreadModel",
          "label": "Spread model",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5,
          "options": [
            {
              "value": "RAW",
              "label": "Raw"
            },
            {
              "value": "MARKUP",
              "label": "Markup"
            },
            {
              "value": "FIXED",
              "label": "Fixed"
            },
            {
              "value": "VARIABLE",
              "label": "Variable"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        },
        {
          "key": "financingSwapSchedule",
          "label": "Financing / swap schedule",
          "type": "URL",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        },
        {
          "key": "marginTerms",
          "label": "Margin terms",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "creditFacilities",
          "label": "Credit facilities",
          "type": "TRI_STATE",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8,
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
              "value": "SUBJECT_TO_APPROVAL",
              "label": "Subject to approval"
            }
          ]
        },
        {
          "key": "settlementCurrencies",
          "label": "Settlement currencies",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9,
          "optionSource": "LIST:CURRENCIES"
        },
        {
          "key": "volumeTiers",
          "label": "Volume tiers",
          "type": "REPEATABLE_GROUP",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 10
        }
      ]
    },
    {
      "key": "H",
      "title": "Market coverage",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 8,
      "fields": [
        {
          "key": "tradingSessions",
          "label": "Trading sessions",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1,
          "options": [
            {
              "value": "ASIAN",
              "label": "Asian"
            },
            {
              "value": "EUROPEAN",
              "label": "European"
            },
            {
              "value": "LONDON",
              "label": "London"
            },
            {
              "value": "NEW_YORK",
              "label": "New York"
            },
            {
              "value": "24_HOUR",
              "label": "24-hour"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        },
        {
          "key": "weekendTrading",
          "label": "Weekend trading",
          "type": "TRI_STATE",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2,
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
              "value": "INSTRUMENTS_DEPENDENT",
              "label": "Instruments dependent"
            }
          ]
        },
        {
          "key": "supportedCountries",
          "label": "Supported countries",
          "type": "COUNTRY_MULTI",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3,
          "disjointWith": "restrictedJurisdictions"
        },
        {
          "key": "restrictedJurisdictions",
          "label": "Restricted jurisdictions",
          "type": "COUNTRY_MULTI",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4,
          "disjointWith": "supportedCountries"
        },
        {
          "key": "tradingHours",
          "label": "Trading hours",
          "type": "SCHEDULE",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5
        },
        {
          "key": "onboardingTime",
          "label": "Onboarding time",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6,
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
