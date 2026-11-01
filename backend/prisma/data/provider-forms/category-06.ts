import { CategoryFormDefinition } from './types';

export const CATEGORY_06_DEFINITION: CategoryFormDefinition = {
  "number": 6,
  "slug": "hosting-vps-trading-infrastructure",
  "name": "Hosting, VPS & Trading Infrastructure",
  "shortDescription": "VPS, dedicated servers, cloud, colocation and disaster recovery",
  "mainServices": "VPS, dedicated servers, cloud, colocation and disaster recovery",
  "sortOrder": 6,
  "hasProductForm": false,
  "subcategories": [
    {
      "key": "VPS",
      "label": "VPS",
      "sortOrder": 1
    },
    {
      "key": "DEDICATED_SERVER",
      "label": "Dedicated Server",
      "sortOrder": 2
    },
    {
      "key": "CLOUD_HOSTING",
      "label": "Cloud Hosting",
      "sortOrder": 3
    },
    {
      "key": "COLOCATION",
      "label": "Colocation",
      "sortOrder": 4
    },
    {
      "key": "MANAGED_HOSTING",
      "label": "Managed Hosting",
      "sortOrder": 5
    },
    {
      "key": "DISASTER_RECOVERY",
      "label": "Disaster Recovery",
      "sortOrder": 6
    }
  ],
  "sections": [
    {
      "key": "A",
      "title": "Hosting type",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 1,
      "fields": [
        {
          "key": "hostingType",
          "label": "Hosting type",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "FOREX_VPS",
              "label": "Forex VPS"
            },
            {
              "value": "TRADING_VPS",
              "label": "Trading VPS"
            },
            {
              "value": "DEDICATED_SERVER",
              "label": "Dedicated server"
            },
            {
              "value": "CLOUD_HOSTING",
              "label": "Cloud hosting"
            },
            {
              "value": "PRIVATE_CLOUD",
              "label": "Private cloud"
            },
            {
              "value": "COLOCATION",
              "label": "Colocation"
            },
            {
              "value": "MANAGED_SERVER",
              "label": "Managed server"
            },
            {
              "value": "DISASTER_RECOVERY_INFRASTRUCTURE",
              "label": "Disaster recovery infrastructure"
            },
            {
              "value": "BACKUP_HOSTING",
              "label": "Backup hosting"
            },
            {
              "value": "NETWORK_CONNECTIVITY",
              "label": "Network connectivity"
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
      "title": "Hosting deployment",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "hostingDeployment",
          "label": "Hosting deployment",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "SHARED_VPS",
              "label": "Shared VPS"
            },
            {
              "value": "DEDICATED_VPS",
              "label": "Dedicated VPS"
            },
            {
              "value": "DEDICATED_PHYSICAL_SERVER",
              "label": "Dedicated physical server"
            },
            {
              "value": "PUBLIC_CLOUD",
              "label": "Public cloud"
            },
            {
              "value": "PRIVATE_CLOUD",
              "label": "Private cloud"
            },
            {
              "value": "HYBRID_INFRASTRUCTURE",
              "label": "Hybrid infrastructure"
            },
            {
              "value": "COLOCATION",
              "label": "Colocation"
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
      "key": "C",
      "title": "Data centre locations",
      "description": "Confirm exact facility",
      "scope": "PROVIDER",
      "sortOrder": 3,
      "fields": [
        {
          "key": "dataCentreLocations",
          "label": "Data centre locations",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "LONDON_LD4",
              "label": "London LD4"
            },
            {
              "value": "NEW_YORK_NY4",
              "label": "New York NY4"
            },
            {
              "value": "TOKYO_TY3",
              "label": "Tokyo TY3"
            },
            {
              "value": "SINGAPORE_SG3",
              "label": "Singapore SG3"
            },
            {
              "value": "AMSTERDAM",
              "label": "Amsterdam"
            },
            {
              "value": "FRANKFURT",
              "label": "Frankfurt"
            },
            {
              "value": "PARIS",
              "label": "Paris"
            },
            {
              "value": "ZURICH",
              "label": "Zurich"
            },
            {
              "value": "DUBAI",
              "label": "Dubai"
            },
            {
              "value": "MUMBAI",
              "label": "Mumbai"
            },
            {
              "value": "HONG_KONG",
              "label": "Hong Kong"
            },
            {
              "value": "SYDNEY",
              "label": "Sydney"
            },
            {
              "value": "OTHER",
              "label": "Other"
            },
            {
              "value": "THE_PROVIDER_MUST_CONFIRM_THE_EXACT_FACILITY_AND_LOCATION_BEFORE_PUBLICATION",
              "label": "The provider must confirm the exact facility and location before publication."
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
      "title": "Operating systems",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 4,
      "fields": [
        {
          "key": "operatingSystems",
          "label": "Operating systems",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "WINDOWS_SERVER",
              "label": "Windows Server"
            },
            {
              "value": "WINDOWS_DESKTOP",
              "label": "Windows Desktop"
            },
            {
              "value": "UBUNTU_LINUX",
              "label": "Ubuntu Linux"
            },
            {
              "value": "DEBIAN",
              "label": "Debian"
            },
            {
              "value": "CENTOS_COMPATIBLE_DISTRIBUTIONS",
              "label": "CentOS / compatible distributions"
            },
            {
              "value": "RED_HAT_ENTERPRISE_LINUX",
              "label": "Red Hat Enterprise Linux"
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
      "title": "Hardware specifications",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 5,
      "fields": [
        {
          "key": "cpuModel",
          "label": "CPU model",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "cpuCores",
          "label": "CPU cores",
          "type": "NUMBER",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "ram",
          "label": "RAM",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3,
          "options": [
            {
              "value": "2",
              "label": "2"
            },
            {
              "value": "4",
              "label": "4"
            },
            {
              "value": "8",
              "label": "8"
            },
            {
              "value": "16",
              "label": "16"
            },
            {
              "value": "32",
              "label": "32"
            },
            {
              "value": "64",
              "label": "64"
            },
            {
              "value": "128_GB",
              "label": "128 GB"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        },
        {
          "key": "storage",
          "label": "Storage",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4,
          "options": [
            {
              "value": "40",
              "label": "40"
            },
            {
              "value": "80",
              "label": "80"
            },
            {
              "value": "100",
              "label": "100"
            },
            {
              "value": "200",
              "label": "200"
            },
            {
              "value": "500_GB",
              "label": "500 GB"
            },
            {
              "value": "1",
              "label": "1"
            },
            {
              "value": "2_TB",
              "label": "2 TB"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        },
        {
          "key": "storageType",
          "label": "Storage type",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5,
          "options": [
            {
              "value": "SSD",
              "label": "SSD"
            },
            {
              "value": "NVME",
              "label": "NVMe"
            },
            {
              "value": "HDD",
              "label": "HDD"
            },
            {
              "value": "OTHER",
              "label": "Other"
            }
          ],
          "allowOther": true
        },
        {
          "key": "bandwidth",
          "label": "Bandwidth",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6,
          "options": [
            {
              "value": "100_MBPS",
              "label": "100 Mbps"
            },
            {
              "value": "1_GBPS",
              "label": "1 Gbps"
            },
            {
              "value": "10_GBPS",
              "label": "10 Gbps"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        },
        {
          "key": "dedicatedIp",
          "label": "Dedicated IP",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "ipVersion",
          "label": "IP version",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8,
          "options": [
            {
              "value": "IPV4",
              "label": "IPv4"
            },
            {
              "value": "IPV6",
              "label": "IPv6"
            },
            {
              "value": "BOTH",
              "label": "Both"
            }
          ],
          "allowOther": false
        }
      ]
    },
    {
      "key": "F",
      "title": "Platform compatibility",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 6,
      "fields": [
        {
          "key": "platformCompatibility",
          "label": "Platform compatibility",
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
      "title": "Performance and security",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 7,
      "fields": [
        {
          "key": "latencyMeasurementLocation",
          "label": "Latency measurement location",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 1,
          "options": [
            {
              "value": "DROPDOWN",
              "label": "dropdown"
            },
            {
              "value": "TEXT",
              "label": "text"
            }
          ],
          "allowOther": false
        },
        {
          "key": "measurementMethodology",
          "label": "Measurement methodology",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "uptimeSla",
          "label": "Uptime SLA",
          "type": "STATUS_OR_VALUE",
          "required": false,
          "scope": "PROVIDER",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 3,
          "statuses": [
            "NOT_PUBLISHED"
          ]
        },
        {
          "key": "ddosProtection",
          "label": "DDoS protection",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "firewall",
          "label": "Firewall",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5
        },
        {
          "key": "backup",
          "label": "Backup",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6,
          "options": [
            {
              "value": "DAILY",
              "label": "Daily"
            },
            {
              "value": "WEEKLY",
              "label": "Weekly"
            },
            {
              "value": "REAL_TIME",
              "label": "Real time"
            },
            {
              "value": "CUSTOM",
              "label": "Custom"
            }
          ],
          "allowOther": false
        },
        {
          "key": "disasterRecovery",
          "label": "Disaster recovery",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "monitoring",
          "label": "Monitoring",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8,
          "options": [
            {
              "value": "24",
              "label": "24"
            },
            {
              "value": "7",
              "label": "7"
            },
            {
              "value": "BUSINESS_HOURS",
              "label": "Business hours"
            },
            {
              "value": "ON_REQUEST",
              "label": "On request"
            }
          ],
          "allowOther": false
        },
        {
          "key": "support",
          "label": "Support",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9,
          "options": [
            {
              "value": "24",
              "label": "24"
            },
            {
              "value": "7",
              "label": "7"
            },
            {
              "value": "24",
              "label": "24"
            },
            {
              "value": "5",
              "label": "5"
            },
            {
              "value": "BUSINESS_HOURS",
              "label": "Business hours"
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
