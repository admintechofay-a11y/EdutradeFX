import { CategoryFormDefinition } from './types';

export const CATEGORY_09_DEFINITION: CategoryFormDefinition = {
  "number": 9,
  "slug": "brokerage-setup-consulting-other",
  "name": "Brokerage Setup, Consulting & Other Services",
  "shortDescription": "Brokerage launch, consulting, integrations, migration and training",
  "mainServices": "Brokerage launch, consulting, integrations, migration and training",
  "sortOrder": 9,
  "hasProductForm": false,
  "subcategories": [
    {
      "key": "BROKERAGE_SETUP",
      "label": "Brokerage Setup",
      "sortOrder": 1
    },
    {
      "key": "LICENSING_GUIDANCE",
      "label": "Licensing Guidance",
      "sortOrder": 2
    },
    {
      "key": "TECHNOLOGY_CONSULTING",
      "label": "Technology Consulting",
      "sortOrder": 3
    },
    {
      "key": "INTEGRATION",
      "label": "Integration",
      "sortOrder": 4
    },
    {
      "key": "MIGRATION",
      "label": "Migration",
      "sortOrder": 5
    },
    {
      "key": "TRAINING",
      "label": "Training",
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
              "value": "FOREX_BROKERAGE_SETUP",
              "label": "Forex brokerage setup"
            },
            {
              "value": "BROKER_BUSINESS_CONSULTING",
              "label": "Broker business consulting"
            },
            {
              "value": "BUSINESS_PLANNING",
              "label": "Business planning"
            },
            {
              "value": "BROKERAGE_TECHNOLOGY_SELECTION",
              "label": "Brokerage technology selection"
            },
            {
              "value": "MT4_MT5_SETUP_ASSISTANCE",
              "label": "MT4 / MT5 setup assistance"
            },
            {
              "value": "WHITE_LABEL_SETUP",
              "label": "White-label setup"
            },
            {
              "value": "PLATFORM_ADMINISTRATION",
              "label": "Platform administration"
            },
            {
              "value": "LIQUIDITY_PROVIDER_SELECTION",
              "label": "Liquidity provider selection"
            },
            {
              "value": "LIQUIDITY_BRIDGE_INTEGRATION",
              "label": "Liquidity bridge integration"
            },
            {
              "value": "CRM_IMPLEMENTATION",
              "label": "CRM implementation"
            },
            {
              "value": "BACK_OFFICE_IMPLEMENTATION",
              "label": "Back-office implementation"
            },
            {
              "value": "PAYMENT_GATEWAY_INTEGRATION",
              "label": "Payment gateway integration"
            },
            {
              "value": "RISK_MANAGEMENT_IMPLEMENTATION",
              "label": "Risk management implementation"
            },
            {
              "value": "IB_NETWORK_INFRASTRUCTURE",
              "label": "IB network infrastructure"
            },
            {
              "value": "IB_AND_REBATE_SETUP",
              "label": "IB and rebate setup"
            },
            {
              "value": "PAMM_MAM_IMPLEMENTATION",
              "label": "PAMM / MAM implementation"
            },
            {
              "value": "COPY_TRADING_IMPLEMENTATION",
              "label": "Copy trading implementation"
            },
            {
              "value": "PROP_FIRM_SETUP",
              "label": "Prop-firm setup"
            },
            {
              "value": "WEBSITE_DEVELOPMENT",
              "label": "Website development"
            },
            {
              "value": "BRANDING_AND_MARKETING",
              "label": "Branding and marketing"
            },
            {
              "value": "STAFF_TRAINING",
              "label": "Staff training"
            },
            {
              "value": "OPERATIONAL_CONSULTING",
              "label": "Operational consulting"
            },
            {
              "value": "MIGRATION_SERVICES",
              "label": "Migration services"
            },
            {
              "value": "ONGOING_TECHNICAL_SUPPORT",
              "label": "Ongoing technical support"
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
      "title": "Customer business stage",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "customerBusinessStage",
          "label": "Customer business stage",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "IDEA_PLANNING_STAGE",
              "label": "Idea / planning stage"
            },
            {
              "value": "PRE_LAUNCH",
              "label": "Pre-launch"
            },
            {
              "value": "NEW_BROKERAGE",
              "label": "New brokerage"
            },
            {
              "value": "RECENTLY_LAUNCHED",
              "label": "Recently launched"
            },
            {
              "value": "ESTABLISHED_BROKERAGE",
              "label": "Established brokerage"
            },
            {
              "value": "EXPANSION",
              "label": "Expansion"
            },
            {
              "value": "TECHNOLOGY_MIGRATION",
              "label": "Technology migration"
            },
            {
              "value": "OPERATIONAL_RESTRUCTURING",
              "label": "Operational restructuring"
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
      "title": "Consulting areas",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 3,
      "fields": [
        {
          "key": "consultingAreas",
          "label": "Consulting areas",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "BUSINESS_MODEL_PLANNING",
              "label": "Business model planning"
            },
            {
              "value": "TECHNOLOGY_ARCHITECTURE",
              "label": "Technology architecture"
            },
            {
              "value": "PLATFORM_SELECTION",
              "label": "Platform selection"
            },
            {
              "value": "LIQUIDITY_PLANNING",
              "label": "Liquidity planning"
            },
            {
              "value": "RISK_MANAGEMENT",
              "label": "Risk management"
            },
            {
              "value": "PAYMENT_INFRASTRUCTURE",
              "label": "Payment infrastructure"
            },
            {
              "value": "CRM_AND_BACK_OFFICE",
              "label": "CRM and back office"
            },
            {
              "value": "COMPLIANCE_COORDINATION",
              "label": "Compliance coordination"
            },
            {
              "value": "OPERATIONAL_WORKFLOW",
              "label": "Operational workflow"
            },
            {
              "value": "MARKETING_AND_CLIENT_ACQUISITION",
              "label": "Marketing and client acquisition"
            },
            {
              "value": "IB_NETWORK_GROWTH",
              "label": "IB network growth"
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
      "title": "Jurisdictions covered",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 4,
      "fields": [
        {
          "key": "countries",
          "label": "Countries",
          "type": "COUNTRY_MULTI",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "regions",
          "label": "Regions",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2,
          "optionSource": "LIST:OPERATING_REGIONS"
        },
        {
          "key": "localPartnerAvailable",
          "label": "Local partner available",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3
        },
        {
          "key": "remoteServices",
          "label": "Remote services",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "on",
          "label": "On",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5,
          "options": [
            {
              "value": "SITE_CONSULTING_YES",
              "label": "site consulting \u2014 Yes"
            },
            {
              "value": "NO",
              "label": "No"
            }
          ],
          "allowOther": false
        }
      ]
    },
    {
      "key": "E",
      "title": "Project delivery model",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 5,
      "fields": [
        {
          "key": "projectDeliveryModel",
          "label": "Project delivery model",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "FIXED_PROJECT",
              "label": "Fixed project"
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
              "value": "ANNUAL_CONTRACT",
              "label": "Annual contract"
            },
            {
              "value": "MILESTONE_BASED",
              "label": "Milestone-based"
            },
            {
              "value": "CUSTOM_PROPOSAL",
              "label": "Custom proposal"
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
      "title": "Project timeline",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 6,
      "fields": [
        {
          "key": "projectTimeline",
          "label": "Project timeline",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "LESS_THAN_1_WEEK",
              "label": "Less than 1 week"
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
              "value": "1_2_MONTHS",
              "label": "1\u20132 months"
            },
            {
              "value": "3_6_MONTHS",
              "label": "3\u20136 months"
            },
            {
              "value": "6_12_MONTHS",
              "label": "6\u201312 months"
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
      "key": "G",
      "title": "Deliverables and responsibilities",
      "description": "Licensing, legal and regulatory services must be described within the provider's actual authority and qualifications. A consultant must not be presented as a regulator or licence issuer.",
      "scope": "PROVIDER",
      "sortOrder": 7,
      "fields": [
        {
          "key": "projectDeliverables",
          "label": "Project deliverables",
          "type": "RICH_TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "exclusionsLimitations",
          "label": "Exclusions / limitations",
          "type": "RICH_TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "clientResponsibilities",
          "label": "Client responsibilities",
          "type": "RICH_TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3
        },
        {
          "key": "requiredClientDocuments",
          "label": "Required client documents",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "projectPhases",
          "label": "Project phases",
          "type": "REPEATABLE_GROUP",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5
        },
        {
          "key": "implementationTimeline",
          "label": "Implementation timeline",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        },
        {
          "key": "consultantQualifications",
          "label": "Consultant qualifications",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "caseStudies",
          "label": "Case studies",
          "type": "URL",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8
        },
        {
          "key": "ongoingSupport",
          "label": "Ongoing support",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9
        },
        {
          "key": "change",
          "label": "Change",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 10
        }
      ]
    }
  ]
};
