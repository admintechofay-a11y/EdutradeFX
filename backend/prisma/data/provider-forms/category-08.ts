import { CategoryFormDefinition } from './types';

export const CATEGORY_08_DEFINITION: CategoryFormDefinition = {
  "number": 8,
  "slug": "compliance-kyc-fraud-prevention",
  "name": "Compliance, KYC & Fraud Prevention",
  "shortDescription": "KYC, KYB, AML, identity checks and fraud monitoring",
  "mainServices": "KYC, KYB, AML, identity checks and fraud monitoring",
  "sortOrder": 8,
  "hasProductForm": false,
  "subcategories": [
    {
      "key": "KYC",
      "label": "KYC",
      "sortOrder": 1
    },
    {
      "key": "KYB",
      "label": "KYB",
      "sortOrder": 2
    },
    {
      "key": "AML",
      "label": "AML",
      "sortOrder": 3
    },
    {
      "key": "IDENTITY_VERIFICATION",
      "label": "Identity Verification",
      "sortOrder": 4
    },
    {
      "key": "FRAUD_DETECTION",
      "label": "Fraud Detection",
      "sortOrder": 5
    },
    {
      "key": "TRANSACTION_MONITORING",
      "label": "Transaction Monitoring",
      "sortOrder": 6
    }
  ],
  "sections": [
    {
      "key": "A",
      "title": "Solution type",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 1,
      "fields": [
        {
          "key": "solutionType",
          "label": "Solution type",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "KYC_VERIFICATION",
              "label": "KYC verification"
            },
            {
              "value": "KYB_VERIFICATION",
              "label": "KYB verification"
            },
            {
              "value": "AML_SCREENING",
              "label": "AML screening"
            },
            {
              "value": "SANCTIONS_SCREENING",
              "label": "Sanctions screening"
            },
            {
              "value": "PEP_SCREENING",
              "label": "PEP screening"
            },
            {
              "value": "IDENTITY_VERIFICATION",
              "label": "Identity verification"
            },
            {
              "value": "DOCUMENT_VERIFICATION",
              "label": "Document verification"
            },
            {
              "value": "FACE_VERIFICATION",
              "label": "Face verification"
            },
            {
              "value": "LIVENESS_DETECTION",
              "label": "Liveness detection"
            },
            {
              "value": "FRAUD_DETECTION",
              "label": "Fraud detection"
            },
            {
              "value": "TRANSACTION_MONITORING",
              "label": "Transaction monitoring"
            },
            {
              "value": "RISK_SCORING",
              "label": "Risk scoring"
            },
            {
              "value": "DEVICE_FINGERPRINTING",
              "label": "Device fingerprinting"
            },
            {
              "value": "BEHAVIOURAL_ANALYSIS",
              "label": "Behavioural analysis"
            },
            {
              "value": "ADVERSE_MEDIA_SCREENING",
              "label": "Adverse media screening"
            },
            {
              "value": "ONGOING_MONITORING",
              "label": "Ongoing monitoring"
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
      "title": "Verification methods",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "verificationMethods",
          "label": "Verification methods",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "PASSPORT_VERIFICATION",
              "label": "Passport verification"
            },
            {
              "value": "NATIONAL_ID_VERIFICATION",
              "label": "National ID verification"
            },
            {
              "value": "DRIVING_LICENCE_VERIFICATION",
              "label": "Driving licence verification"
            },
            {
              "value": "PROOF_OF_ADDRESS",
              "label": "Proof of address"
            },
            {
              "value": "SELFIE_VERIFICATION",
              "label": "Selfie verification"
            },
            {
              "value": "FACIAL_MATCHING",
              "label": "Facial matching"
            },
            {
              "value": "LIVENESS_CHECK",
              "label": "Liveness check"
            },
            {
              "value": "BUSINESS_REGISTRATION_VERIFICATION",
              "label": "Business registration verification"
            },
            {
              "value": "BENEFICIAL_OWNERSHIP_VERIFICATION",
              "label": "Beneficial ownership verification"
            },
            {
              "value": "DATABASE_SCREENING",
              "label": "Database screening"
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
      "title": "Geographic coverage",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 3,
      "fields": [
        {
          "key": "supportedCountries",
          "label": "Supported countries",
          "type": "COUNTRY_MULTI",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1,
          "disjointWith": "restrictedJurisdictions"
        },
        {
          "key": "supportedDocumentCountries",
          "label": "Supported document countries",
          "type": "COUNTRY_MULTI",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "restrictedJurisdictions",
          "label": "Restricted jurisdictions",
          "type": "COUNTRY_MULTI",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3,
          "disjointWith": "supportedCountries"
        },
        {
          "key": "dataResidencyLocations",
          "label": "Data residency locations",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4,
          "optionSource": "LIST:OPERATING_REGIONS"
        }
      ]
    },
    {
      "key": "D",
      "title": "Technical integration",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 4,
      "fields": [
        {
          "key": "technicalIntegration",
          "label": "Technical integration",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "REST_API",
              "label": "REST API"
            },
            {
              "value": "WEBHOOKS",
              "label": "Webhooks"
            },
            {
              "value": "SDK",
              "label": "SDK"
            },
            {
              "value": "HOSTED_VERIFICATION_PAGE",
              "label": "Hosted verification page"
            },
            {
              "value": "DASHBOARD",
              "label": "Dashboard"
            },
            {
              "value": "CRM_INTEGRATION",
              "label": "CRM integration"
            },
            {
              "value": "CLIENT_PORTAL_INTEGRATION",
              "label": "Client portal integration"
            },
            {
              "value": "CUSTOM_INTEGRATION",
              "label": "Custom integration"
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
      "title": "Monitoring features",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 5,
      "fields": [
        {
          "key": "monitoringFeatures",
          "label": "Monitoring features",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "REAL_TIME_ALERTS",
              "label": "Real-time alerts"
            },
            {
              "value": "MANUAL_REVIEW",
              "label": "Manual review"
            },
            {
              "value": "ESCALATION_WORKFLOW",
              "label": "Escalation workflow"
            },
            {
              "value": "CASE_MANAGEMENT",
              "label": "Case management"
            },
            {
              "value": "AUDIT_TRAIL",
              "label": "Audit trail"
            },
            {
              "value": "RISK_SCORING",
              "label": "Risk scoring"
            },
            {
              "value": "AUTOMATED_DECISION_RULES",
              "label": "Automated decision rules"
            },
            {
              "value": "ONGOING_MONITORING",
              "label": "Ongoing monitoring"
            },
            {
              "value": "REPORTING",
              "label": "Reporting"
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
      "title": "Security and privacy",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 6,
      "fields": [
        {
          "key": "dataEncryption",
          "label": "Data encryption",
          "type": "YES_NO_DETAILS",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "dataRetentionPolicy",
          "label": "Data retention policy",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "dataResidency",
          "label": "Data residency",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3,
          "options": [
            {
              "value": "COUNTRY",
              "label": "country"
            },
            {
              "value": "REGION_DROPDOWN",
              "label": "region dropdown"
            }
          ],
          "allowOther": false
        },
        {
          "key": "isoCertification",
          "label": "ISO certification",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
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
              "value": "NOT_APPLICABLE_EVIDENCE",
              "label": "Not applicable + evidence"
            }
          ],
          "allowOther": false
        },
        {
          "key": "socReport",
          "label": "SOC report",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "VERIFIABLE",
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
              "value": "NOT_APPLICABLE_EVIDENCE",
              "label": "Not applicable + evidence"
            }
          ],
          "allowOther": false
        },
        {
          "key": "otherSecurityAttestations",
          "label": "Other security attestations",
          "type": "REPEATABLE_GROUP",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        },
        {
          "key": "privacyPolicyUrl",
          "label": "Privacy policy URL",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 7
        },
        {
          "key": "securityDocumentationUrl",
          "label": "Security documentation URL",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "visibility": "PUBLIC",
          "claim": "DECLARED",
          "sortOrder": 8
        }
      ]
    }
  ]
};
