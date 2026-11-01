import { CategoryFormDefinition } from './types';

export const CATEGORY_01_DEFINITION: CategoryFormDefinition = {
  "number": 1,
  "slug": "trading-technology-liquidity-bridges-risk",
  "name": "Trading Technology, Liquidity Bridges & Risk Management",
  "shortDescription": "Bridges, aggregation, order routing, dealing desk, risk and execution analytics",
  "mainServices": "Bridges, aggregation, order routing, dealing desk, risk and execution analytics",
  "sortOrder": 1,
  "hasProductForm": false,
  "subcategories": [
    {
      "key": "BRIDGE_ENGINE",
      "label": "Bridge Engine",
      "sortOrder": 1
    },
    {
      "key": "LIQUIDITY_AGGREGATOR",
      "label": "Liquidity Aggregator",
      "sortOrder": 2
    },
    {
      "key": "ORDER_ROUTING",
      "label": "Order Routing",
      "sortOrder": 3
    },
    {
      "key": "RISK_ENGINE",
      "label": "Risk Engine",
      "sortOrder": 4
    },
    {
      "key": "DEALING_DESK",
      "label": "Dealing Desk",
      "sortOrder": 5
    },
    {
      "key": "EXECUTION_ANALYTICS",
      "label": "Execution Analytics",
      "sortOrder": 6
    }
  ],
  "sections": [
    {
      "key": "A",
      "title": "Service types",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 1,
      "fields": [
        {
          "key": "serviceTypes",
          "label": "Service types",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "LIQUIDITY_BRIDGE",
              "label": "Liquidity bridge"
            },
            {
              "value": "LIQUIDITY_AGGREGATOR",
              "label": "Liquidity aggregator"
            },
            {
              "value": "BRIDGE_ENGINE",
              "label": "Bridge engine"
            },
            {
              "value": "GATEWAY",
              "label": "Gateway"
            },
            {
              "value": "ORDER_ROUTING_ENGINE",
              "label": "Order routing engine"
            },
            {
              "value": "EXECUTION_MANAGEMENT_SYSTEM",
              "label": "Execution management system"
            },
            {
              "value": "RISK_MANAGEMENT_SOFTWARE",
              "label": "Risk management software"
            },
            {
              "value": "DEALING_DESK_SYSTEM",
              "label": "Dealing desk system"
            },
            {
              "value": "EXPOSURE_MONITORING",
              "label": "Exposure monitoring"
            },
            {
              "value": "AUTOMATED_HEDGING",
              "label": "Automated hedging"
            },
            {
              "value": "A_B_BOOK_MANAGEMENT",
              "label": "A/B book management"
            },
            {
              "value": "TOXIC_FLOW_DETECTION",
              "label": "Toxic-flow detection"
            },
            {
              "value": "EXECUTION_ANALYTICS",
              "label": "Execution analytics"
            },
            {
              "value": "SLIPPAGE_MONITORING",
              "label": "Slippage monitoring"
            },
            {
              "value": "TRADE_SURVEILLANCE",
              "label": "Trade surveillance"
            },
            {
              "value": "REPORTING_AND_ANALYTICS",
              "label": "Reporting and analytics"
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
      "title": "Product architecture",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "productArchitecture",
          "label": "Product architecture",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "BRIDGE",
              "label": "Bridge"
            },
            {
              "value": "GATEWAY",
              "label": "Gateway"
            },
            {
              "value": "AGGREGATOR",
              "label": "Aggregator"
            },
            {
              "value": "EXECUTION_ENGINE",
              "label": "Execution engine"
            },
            {
              "value": "RISK_ENGINE",
              "label": "Risk engine"
            },
            {
              "value": "ANALYTICS_PLATFORM",
              "label": "Analytics platform"
            },
            {
              "value": "DEALING_DESK_DASHBOARD",
              "label": "Dealing desk dashboard"
            },
            {
              "value": "API_SERVICE",
              "label": "API service"
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
          "allowOther": true,
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 1
        }
      ]
    },
    {
      "key": "C",
      "title": "Supported trading platforms",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 3,
      "fields": [
        {
          "key": "supportedTradingPlatforms",
          "label": "Supported trading platforms",
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
              "value": "TRADINGVIEW",
              "label": "TradingView"
            },
            {
              "value": "PROPRIETARY_PLATFORM",
              "label": "Proprietary platform"
            },
            {
              "value": "FIX_API_CLIENTS",
              "label": "FIX API clients"
            },
            {
              "value": "OTHER",
              "label": "Other"
            },
            {
              "value": "NOT_APPLICABLE",
              "label": "Not applicable"
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
      "title": "Connectivity protocols",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 4,
      "fields": [
        {
          "key": "connectivityProtocols",
          "label": "Connectivity protocols",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "FIX_4_0",
              "label": "FIX 4.0"
            },
            {
              "value": "FIX_4_2",
              "label": "FIX 4.2"
            },
            {
              "value": "FIX_4_3",
              "label": "FIX 4.3"
            },
            {
              "value": "FIX_4_4",
              "label": "FIX 4.4"
            },
            {
              "value": "FIX_5_0",
              "label": "FIX 5.0"
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
              "value": "WEB_API",
              "label": "Web API"
            },
            {
              "value": "SDK",
              "label": "SDK"
            },
            {
              "value": "CUSTOM_API",
              "label": "Custom API"
            },
            {
              "value": "PLUGIN",
              "label": "Plugin"
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
      "title": "Liquidity connectivity",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 5,
      "fields": [
        {
          "key": "connectedLiquidityProviderNames",
          "label": "Connected liquidity provider names",
          "type": "REPEATABLE_GROUP",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "numberOfConnectedLiquidityVenues",
          "label": "Number of connected liquidity venues",
          "type": "NUMBER",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "directConnectivityAvailable",
          "label": "Direct connectivity available",
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
              "value": "ON_REQUEST",
              "label": "On request"
            }
          ]
        },
        {
          "key": "multiLpAggregation",
          "label": "Multi-LP aggregation",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "customLpIntegration",
          "label": "Custom LP integration",
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
              "value": "ON_REQUEST",
              "label": "On request"
            }
          ]
        },
        {
          "key": "depthOfMarket",
          "label": "Depth of market",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        },
        {
          "key": "priceAggregation",
          "label": "Price aggregation",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "symbolMapping",
          "label": "Symbol mapping",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8
        },
        {
          "key": "backupLiquiditySource",
          "label": "Backup liquidity source",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9
        }
      ]
    },
    {
      "key": "F",
      "title": "Execution capabilities",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 6,
      "fields": [
        {
          "key": "executionCapabilities",
          "label": "Execution capabilities",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "SMART_ORDER_ROUTING",
              "label": "Smart order routing"
            },
            {
              "value": "MANUAL_ORDER_ROUTING",
              "label": "Manual order routing"
            },
            {
              "value": "AUTOMATIC_ORDER_ROUTING",
              "label": "Automatic order routing"
            },
            {
              "value": "BEST_EXECUTION_RULES",
              "label": "Best execution rules"
            },
            {
              "value": "ORDER_SPLITTING",
              "label": "Order splitting"
            },
            {
              "value": "EXECUTION_MONITORING",
              "label": "Execution monitoring"
            },
            {
              "value": "LATENCY_MONITORING",
              "label": "Latency monitoring"
            },
            {
              "value": "SLIPPAGE_ANALYSIS",
              "label": "Slippage analysis"
            },
            {
              "value": "REQUOTES_MONITORING",
              "label": "Requotes monitoring"
            },
            {
              "value": "EXECUTION_REPORTING",
              "label": "Execution reporting"
            },
            {
              "value": "MARKET_IMPACT_ANALYSIS",
              "label": "Market impact analysis"
            },
            {
              "value": "CUSTOM_ROUTING_RULES",
              "label": "Custom routing rules"
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
      "title": "Risk capabilities",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 7,
      "fields": [
        {
          "key": "riskCapabilities",
          "label": "Risk capabilities",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "REAL_TIME_EXPOSURE_MONITORING",
              "label": "Real-time exposure monitoring"
            },
            {
              "value": "OPEN_POSITION_MONITORING",
              "label": "Open position monitoring"
            },
            {
              "value": "P_L_MONITORING",
              "label": "P&L monitoring"
            },
            {
              "value": "MARGIN_MONITORING",
              "label": "Margin monitoring"
            },
            {
              "value": "A_B_BOOK_CONFIGURATION",
              "label": "A/B book configuration"
            },
            {
              "value": "INTERNALISATION",
              "label": "Internalisation"
            },
            {
              "value": "AUTOMATED_HEDGING",
              "label": "Automated hedging"
            },
            {
              "value": "MANUAL_HEDGING",
              "label": "Manual hedging"
            },
            {
              "value": "EXPOSURE_LIMITS",
              "label": "Exposure limits"
            },
            {
              "value": "ACCOUNT_LEVEL_RISK_LIMITS",
              "label": "Account-level risk limits"
            },
            {
              "value": "GROUP_LEVEL_RISK_LIMITS",
              "label": "Group-level risk limits"
            },
            {
              "value": "INSTRUMENT_LEVEL_RISK_LIMITS",
              "label": "Instrument-level risk limits"
            },
            {
              "value": "TOXIC_FLOW_DETECTION",
              "label": "Toxic-flow detection"
            },
            {
              "value": "ARBITRAGE_DETECTION",
              "label": "Arbitrage detection"
            },
            {
              "value": "LATENCY_ABUSE_DETECTION",
              "label": "Latency-abuse detection"
            },
            {
              "value": "AUTOMATED_ALERTS",
              "label": "Automated alerts"
            },
            {
              "value": "RISK_REPORTING",
              "label": "Risk reporting"
            },
            {
              "value": "HISTORICAL_ANALYSIS",
              "label": "Historical analysis"
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
      "title": "Deployment model",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 8,
      "fields": [
        {
          "key": "deploymentModel",
          "label": "Deployment model",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "PROVIDER_HOSTED_SAAS",
              "label": "Provider-hosted SaaS"
            },
            {
              "value": "DEDICATED_CLOUD_INSTANCE",
              "label": "Dedicated cloud instance"
            },
            {
              "value": "CUSTOMER_HOSTED",
              "label": "Customer-hosted"
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
              "value": "HYBRID_DEPLOYMENT",
              "label": "Hybrid deployment"
            },
            {
              "value": "MANAGED_DEPLOYMENT",
              "label": "Managed deployment"
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
      "title": "Infrastructure and performance",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 9,
      "fields": [
        {
          "key": "primaryServerLocation",
          "label": "Primary server location",
          "type": "LOCATION",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "disasterRecoveryLocation",
          "label": "Disaster recovery location",
          "type": "LOCATION",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "redundancy",
          "label": "Redundancy",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3
        },
        {
          "key": "failover",
          "label": "Failover",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "uptimeSla",
          "label": "Uptime SLA",
          "type": "STATUS_OR_VALUE",
          "required": false,
          "scope": "PROVIDER",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 5,
          "statuses": [
            "NOT_PUBLISHED"
          ]
        },
        {
          "key": "orderThroughput",
          "label": "Order throughput",
          "type": "STATUS_OR_VALUE",
          "required": false,
          "scope": "PROVIDER",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 6,
          "statuses": [
            "NOT_DISCLOSED"
          ]
        },
        {
          "key": "latency",
          "label": "Latency",
          "type": "STATUS_OR_VALUE",
          "required": false,
          "scope": "PROVIDER",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 7,
          "statuses": [
            "NOT_DISCLOSED"
          ]
        },
        {
          "key": "measurementMethodology",
          "label": "Measurement methodology",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 8
        },
        {
          "key": "dataRetention",
          "label": "Data retention",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9,
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
          "key": "securityControls",
          "label": "Security controls",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 10,
          "options": [
            {
              "value": "ENCRYPTION",
              "label": "Encryption"
            },
            {
              "value": "ACCESS_CONTROL",
              "label": "Access control"
            },
            {
              "value": "IP_RESTRICTION",
              "label": "IP restriction"
            },
            {
              "value": "MFA",
              "label": "MFA"
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
          "allowOther": true
        }
      ]
    }
  ]
};
