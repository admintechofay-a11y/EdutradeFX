import { CategoryFormDefinition } from './types';

export const CATEGORY_05_DEFINITION: CategoryFormDefinition = {
  "number": 5,
  "slug": "payments-banking-infrastructure",
  "name": "Payments & Banking Infrastructure",
  "shortDescription": "Payment gateways, banking, deposits, withdrawals and settlement",
  "mainServices": "Payment gateways, banking, deposits, withdrawals and settlement",
  "sortOrder": 5,
  "hasProductForm": false,
  "subcategories": [
    {
      "key": "PAYMENT_GATEWAY",
      "label": "Payment Gateway",
      "sortOrder": 1
    },
    {
      "key": "CARD_PROCESSING",
      "label": "Card Processing",
      "sortOrder": 2
    },
    {
      "key": "BANK_TRANSFER",
      "label": "Bank Transfer",
      "sortOrder": 3
    },
    {
      "key": "PAYMENT_ORCHESTRATION",
      "label": "Payment Orchestration",
      "sortOrder": 4
    },
    {
      "key": "BANKING_API",
      "label": "Banking API",
      "sortOrder": 5
    },
    {
      "key": "CRYPTO_PAYMENTS",
      "label": "Crypto Payments",
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
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "PAYMENT_GATEWAY",
              "label": "Payment gateway"
            },
            {
              "value": "PAYMENT_SERVICE_PROVIDER",
              "label": "Payment service provider"
            },
            {
              "value": "PAYMENT_ORCHESTRATION_PLATFORM",
              "label": "Payment orchestration platform"
            },
            {
              "value": "BANKING_INFRASTRUCTURE_PROVIDER",
              "label": "Banking infrastructure provider"
            },
            {
              "value": "MERCHANT_ACCOUNT_PROVIDER",
              "label": "Merchant account provider"
            },
            {
              "value": "CARD_PROCESSING_PROVIDER",
              "label": "Card processing provider"
            },
            {
              "value": "LOCAL_PAYMENT_PROVIDER",
              "label": "Local payment provider"
            },
            {
              "value": "E_WALLET_PROVIDER",
              "label": "E-wallet provider"
            },
            {
              "value": "CRYPTO_PAYMENT_PROCESSOR",
              "label": "Crypto payment processor"
            },
            {
              "value": "BANK_TRANSFER_PROVIDER",
              "label": "Bank transfer provider"
            },
            {
              "value": "SETTLEMENT_PROVIDER",
              "label": "Settlement provider"
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
      "title": "Payment methods",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 2,
      "fields": [
        {
          "key": "paymentMethods",
          "label": "Payment methods",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "VISA",
              "label": "Visa"
            },
            {
              "value": "MASTERCARD",
              "label": "Mastercard"
            },
            {
              "value": "BANK_TRANSFER",
              "label": "Bank transfer"
            },
            {
              "value": "SEPA",
              "label": "SEPA"
            },
            {
              "value": "SWIFT",
              "label": "SWIFT"
            },
            {
              "value": "FASTER_PAYMENTS",
              "label": "Faster Payments"
            },
            {
              "value": "LOCAL_BANK_TRANSFER",
              "label": "Local bank transfer"
            },
            {
              "value": "UPI",
              "label": "UPI"
            },
            {
              "value": "NET_BANKING",
              "label": "Net banking"
            },
            {
              "value": "DIGITAL_WALLETS",
              "label": "Digital wallets"
            },
            {
              "value": "E_WALLETS",
              "label": "E-wallets"
            },
            {
              "value": "QR_PAYMENTS",
              "label": "QR payments"
            },
            {
              "value": "MOBILE_PAYMENTS",
              "label": "Mobile payments"
            },
            {
              "value": "STABLECOIN_PAYMENTS",
              "label": "Stablecoin payments"
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
      "title": "Supported currencies",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 3,
      "fields": [
        {
          "key": "supportedCurrencies",
          "label": "Supported currencies",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
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
              "value": "CNY",
              "label": "CNY"
            },
            {
              "value": "HKD",
              "label": "HKD"
            },
            {
              "value": "ZAR",
              "label": "ZAR"
            },
            {
              "value": "USDT",
              "label": "USDT"
            },
            {
              "value": "USDC",
              "label": "USDC"
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
      "title": "Transaction capabilities",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 4,
      "fields": [
        {
          "key": "deposits",
          "label": "Deposits",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 1
        },
        {
          "key": "withdrawals",
          "label": "Withdrawals",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2
        },
        {
          "key": "refunds",
          "label": "Refunds",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3
        },
        {
          "key": "recurringPayments",
          "label": "Recurring payments",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "batchPayments",
          "label": "Batch payments",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 5
        },
        {
          "key": "payouts",
          "label": "Payouts",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 6
        },
        {
          "key": "fxConversion",
          "label": "FX conversion",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 7
        },
        {
          "key": "automatedReconciliation",
          "label": "Automated reconciliation",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 8
        },
        {
          "key": "paymentRouting",
          "label": "Payment routing",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 9
        },
        {
          "key": "chargebackManagement",
          "label": "Chargeback management",
          "type": "YES_NO",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 10
        }
      ]
    },
    {
      "key": "E",
      "title": "Integration methods",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 5,
      "fields": [
        {
          "key": "integrationMethods",
          "label": "Integration methods",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "REST_API",
              "label": "REST API"
            },
            {
              "value": "HOSTED_CHECKOUT",
              "label": "Hosted checkout"
            },
            {
              "value": "PAYMENT_PLUGIN",
              "label": "Payment plugin"
            },
            {
              "value": "SDK",
              "label": "SDK"
            },
            {
              "value": "PAYMENT_LINKS",
              "label": "Payment links"
            },
            {
              "value": "DIRECT_BANK_INTEGRATION",
              "label": "Direct bank integration"
            },
            {
              "value": "WEBHOOKS",
              "label": "Webhooks"
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
      "key": "F",
      "title": "Settlement timing",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 6,
      "fields": [
        {
          "key": "settlementTiming",
          "label": "Settlement timing",
          "type": "SINGLE_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "REAL_TIME",
              "label": "Real time"
            },
            {
              "value": "SAME_BUSINESS_DAY",
              "label": "Same business day"
            },
            {
              "value": "T_1",
              "label": "T+1"
            },
            {
              "value": "T_2",
              "label": "T+2"
            },
            {
              "value": "T_3",
              "label": "T+3"
            },
            {
              "value": "3_5_BUSINESS_DAYS",
              "label": "3\u20135 business days"
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
      "title": "Merchant eligibility",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 7,
      "fields": [
        {
          "key": "merchantEligibility",
          "label": "Merchant eligibility",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "options": [
            {
              "value": "REGISTERED_COMPANIES",
              "label": "Registered companies"
            },
            {
              "value": "LICENSED_FINANCIAL_BUSINESSES",
              "label": "Licensed financial businesses"
            },
            {
              "value": "FOREX_BROKERS",
              "label": "Forex brokers"
            },
            {
              "value": "PROP_TRADING_FIRMS",
              "label": "Prop trading firms"
            },
            {
              "value": "FINTECH_COMPANIES",
              "label": "Fintech companies"
            },
            {
              "value": "OTHER_ELIGIBLE_MERCHANTS",
              "label": "Other eligible merchants"
            },
            {
              "value": "SUBJECT_TO_APPROVAL",
              "label": "Subject to approval"
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
      "key": "H",
      "title": "Geographic availability",
      "description": null,
      "scope": "PROVIDER",
      "sortOrder": 8,
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
          "disjointWith": "restrictedCountries"
        },
        {
          "key": "restrictedCountries",
          "label": "Restricted countries",
          "type": "COUNTRY_MULTI",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 2,
          "disjointWith": "supportedCountries"
        },
        {
          "key": "settlementRegions",
          "label": "Settlement regions",
          "type": "MULTI_SELECT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 3,
          "optionSource": "LIST:OPERATING_REGIONS"
        },
        {
          "key": "merchantOnboardingRequirements",
          "label": "Merchant onboarding requirements",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "DECLARED",
          "visibility": "PUBLIC",
          "sortOrder": 4
        },
        {
          "key": "licenceRegistrationDetails",
          "label": "Licence / registration details",
          "type": "TEXT",
          "required": false,
          "scope": "PROVIDER",
          "claim": "VERIFIABLE",
          "visibility": "PUBLIC",
          "sortOrder": 5
        },
        {
          "key": "officialRegisterUrl",
          "label": "Official register URL",
          "type": "URL",
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
