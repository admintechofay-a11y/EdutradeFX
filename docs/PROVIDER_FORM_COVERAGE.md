# EdutradeFX — Solutions Providers Form Coverage Report

> Comprehensive mapping from `docs/Solutions_Providers_NEW.docx` to database form builder schemas.
> Total categories: 10
> Total sections: 79

| Category | Section | Field Key | Field Type | Details |
|---|---|---|---|---|
| Cat 01 | Section A (Service types) | serviceTypes | MULTI_SELECT | 17 options |
| Cat 01 | Section B (Product architecture) | productArchitecture | MULTI_SELECT | 10 options |
| Cat 01 | Section C (Supported trading platforms) | supportedTradingPlatforms | MULTI_SELECT | 11 options |
| Cat 01 | Section D (Connectivity protocols) | connectivityProtocols | MULTI_SELECT | 12 options |
| Cat 01 | Section E (Liquidity connectivity) | connectedLiquidityProviderNames | REPEATABLE_GROUP | Table row |
| Cat 01 | Section E (Liquidity connectivity) | numberOfConnectedLiquidityVenues | NUMBER | Table row |
| Cat 01 | Section E (Liquidity connectivity) | directConnectivityAvailable | TRI_STATE | Table row |
| Cat 01 | Section E (Liquidity connectivity) | multiLpAggregation | YES_NO | Table row |
| Cat 01 | Section E (Liquidity connectivity) | customLpIntegration | TRI_STATE | Table row |
| Cat 01 | Section E (Liquidity connectivity) | depthOfMarket | YES_NO | Table row |
| Cat 01 | Section E (Liquidity connectivity) | priceAggregation | YES_NO | Table row |
| Cat 01 | Section E (Liquidity connectivity) | symbolMapping | YES_NO | Table row |
| Cat 01 | Section E (Liquidity connectivity) | backupLiquiditySource | YES_NO | Table row |
| Cat 01 | Section F (Execution capabilities) | executionCapabilities | MULTI_SELECT | 13 options |
| Cat 01 | Section G (Risk capabilities) | riskCapabilities | MULTI_SELECT | 19 options |
| Cat 01 | Section H (Deployment model) | deploymentModel | SINGLE_SELECT | 8 options |
| Cat 01 | Section I (Infrastructure and performance) | primaryServerLocation | LOCATION | Field |
| Cat 01 | Section I (Infrastructure and performance) | disasterRecoveryLocation | LOCATION | Field |
| Cat 01 | Section I (Infrastructure and performance) | redundancy | YES_NO | Field |
| Cat 01 | Section I (Infrastructure and performance) | failover | YES_NO | Field |
| Cat 01 | Section I (Infrastructure and performance) | uptimeSla | STATUS_OR_VALUE | Field |
| Cat 01 | Section I (Infrastructure and performance) | orderThroughput | STATUS_OR_VALUE | Field |
| Cat 01 | Section I (Infrastructure and performance) | latency | STATUS_OR_VALUE | Field |
| Cat 01 | Section I (Infrastructure and performance) | measurementMethodology | TEXT | Field |
| Cat 01 | Section I (Infrastructure and performance) | dataRetention | SINGLE_SELECT | Field |
| Cat 01 | Section I (Infrastructure and performance) | securityControls | SINGLE_SELECT | Field |
| Cat 02 | Section A (Provider type) | providerType | SINGLE_SELECT | 8 options |
| Cat 02 | Section B (Liquidity model) | liquidityModel | MULTI_SELECT | 8 options |
| Cat 02 | Section C (Asset classes) | assetClasses | MULTI_SELECT | 12 options |
| Cat 02 | Section D (Instruments offered) | instrumentsOffered | MULTI_SELECT | 14 options |
| Cat 02 | Section E (Execution model) | executionModel | MULTI_SELECT | 8 options |
| Cat 02 | Section F (Connectivity) | connectivity | MULTI_SELECT | 8 options |
| Cat 02 | Section G (Trading conditions) | minimumDepositCollateral | MONEY | Table row |
| Cat 02 | Section G (Trading conditions) | minimumTradeSize | NUMBER | Table row |
| Cat 02 | Section G (Trading conditions) | maximumTradeSize | NUMBER | Table row |
| Cat 02 | Section G (Trading conditions) | commissionModel | SINGLE_SELECT | Table row |
| Cat 02 | Section G (Trading conditions) | spreadModel | SINGLE_SELECT | Table row |
| Cat 02 | Section G (Trading conditions) | financingSwapSchedule | URL | Table row |
| Cat 02 | Section G (Trading conditions) | marginTerms | TEXT | Table row |
| Cat 02 | Section G (Trading conditions) | creditFacilities | TRI_STATE | Table row |
| Cat 02 | Section G (Trading conditions) | settlementCurrencies | MULTI_SELECT | Table row |
| Cat 02 | Section G (Trading conditions) | volumeTiers | REPEATABLE_GROUP | Table row |
| Cat 02 | Section H (Market coverage) | tradingSessions | SINGLE_SELECT | Field |
| Cat 02 | Section H (Market coverage) | weekendTrading | TRI_STATE | Field |
| Cat 02 | Section H (Market coverage) | supportedCountries | COUNTRY_MULTI | Field |
| Cat 02 | Section H (Market coverage) | restrictedJurisdictions | COUNTRY_MULTI | Field |
| Cat 02 | Section H (Market coverage) | tradingHours | SCHEDULE | Field |
| Cat 02 | Section H (Market coverage) | onboardingTime | SINGLE_SELECT | Field |
| Cat 03 | Section A (Product type) | productType | MULTI_SELECT | 13 options |
| Cat 03 | Section B (CRM modules) | crmModules | MULTI_SELECT | 17 options |
| Cat 03 | Section C (Back) | back | MULTI_SELECT | 16 options |
| Cat 03 | Section D (Platform and service integrations) | platformAndServiceIntegrations | MULTI_SELECT | 13 options |
| Cat 03 | Section E (Deployment) | deployment | SINGLE_SELECT | 6 options |
| Cat 03 | Section F (Technical capabilities) | restApi | YES_NO | Field |
| Cat 03 | Section F (Technical capabilities) | webhooks | YES_NO | Field |
| Cat 03 | Section F (Technical capabilities) | fixIntegration | TRI_STATE | Field |
| Cat 03 | Section F (Technical capabilities) | multi | SINGLE_SELECT | Field |
| Cat 03 | Section F (Technical capabilities) | multi | SINGLE_SELECT | Field |
| Cat 03 | Section F (Technical capabilities) | multi | SINGLE_SELECT | Field |
| Cat 03 | Section F (Technical capabilities) | customWorkflow | YES_NO | Field |
| Cat 03 | Section F (Technical capabilities) | role | SINGLE_SELECT | Field |
| Cat 03 | Section F (Technical capabilities) | auditLogs | YES_NO | Field |
| Cat 03 | Section F (Technical capabilities) | dataExport | SINGLE_SELECT | Field |
| Cat 03 | Section G (Commercial model) | commercialModel | MULTI_SELECT | 8 options |
| Cat 04 | Section A (Provider role) | providerRole | SINGLE_SELECT | 8 options |
| Cat 04 | Section B (Platform type) | platformType | MULTI_SELECT | 8 options |
| Cat 04 | Section C (Service type) | serviceType | MULTI_SELECT | 15 options |
| Cat 04 | Section D (Platform features) | platformFeatures | MULTI_SELECT | 17 options |
| Cat 04 | Section E (Administrator features) | administratorFeatures | MULTI_SELECT | 10 options |
| Cat 04 | Section F (Licensing and implementation) | licensingArrangement | SINGLE_SELECT | Field |
| Cat 04 | Section F (Licensing and implementation) | brandingCustomisation | SINGLE_SELECT | Field |
| Cat 04 | Section F (Licensing and implementation) | third | SINGLE_SELECT | Field |
| Cat 04 | Section F (Licensing and implementation) | setupSupport | YES_NO | Field |
| Cat 04 | Section F (Licensing and implementation) | dataMigration | YES_NO | Field |
| Cat 04 | Section F (Licensing and implementation) | serverMigration | YES_NO | Field |
| Cat 04 | Section F (Licensing and implementation) | implementationTime | SINGLE_SELECT | Field |
| Cat 05 | Section A (Provider type) | providerType | MULTI_SELECT | 12 options |
| Cat 05 | Section B (Payment methods) | paymentMethods | MULTI_SELECT | 15 options |
| Cat 05 | Section C (Supported currencies) | supportedCurrencies | MULTI_SELECT | 16 options |
| Cat 05 | Section D (Transaction capabilities) | deposits | YES_NO | Field |
| Cat 05 | Section D (Transaction capabilities) | withdrawals | YES_NO | Field |
| Cat 05 | Section D (Transaction capabilities) | refunds | YES_NO | Field |
| Cat 05 | Section D (Transaction capabilities) | recurringPayments | YES_NO | Field |
| Cat 05 | Section D (Transaction capabilities) | batchPayments | YES_NO | Field |
| Cat 05 | Section D (Transaction capabilities) | payouts | YES_NO | Field |
| Cat 05 | Section D (Transaction capabilities) | fxConversion | YES_NO | Field |
| Cat 05 | Section D (Transaction capabilities) | automatedReconciliation | YES_NO | Field |
| Cat 05 | Section D (Transaction capabilities) | paymentRouting | YES_NO | Field |
| Cat 05 | Section D (Transaction capabilities) | chargebackManagement | YES_NO | Field |
| Cat 05 | Section E (Integration methods) | integrationMethods | MULTI_SELECT | 9 options |
| Cat 05 | Section F (Settlement timing) | settlementTiming | SINGLE_SELECT | 7 options |
| Cat 05 | Section G (Merchant eligibility) | merchantEligibility | MULTI_SELECT | 7 options |
| Cat 05 | Section H (Geographic availability) | supportedCountries | COUNTRY_MULTI | Field |
| Cat 05 | Section H (Geographic availability) | restrictedCountries | COUNTRY_MULTI | Field |
| Cat 05 | Section H (Geographic availability) | settlementRegions | MULTI_SELECT | Field |
| Cat 05 | Section H (Geographic availability) | merchantOnboardingRequirements | TEXT | Field |
| Cat 05 | Section H (Geographic availability) | licenceRegistrationDetails | TEXT | Field |
| Cat 05 | Section H (Geographic availability) | officialRegisterUrl | URL | Field |
| Cat 06 | Section A (Hosting type) | hostingType | MULTI_SELECT | 11 options |
| Cat 06 | Section B (Hosting deployment) | hostingDeployment | SINGLE_SELECT | 8 options |
| Cat 06 | Section C (Data centre locations) | dataCentreLocations | MULTI_SELECT | 14 options |
| Cat 06 | Section D (Operating systems) | operatingSystems | MULTI_SELECT | 7 options |
| Cat 06 | Section E (Hardware specifications) | cpuModel | TEXT | Table row |
| Cat 06 | Section E (Hardware specifications) | cpuCores | NUMBER | Table row |
| Cat 06 | Section E (Hardware specifications) | ram | SINGLE_SELECT | Table row |
| Cat 06 | Section E (Hardware specifications) | storage | SINGLE_SELECT | Table row |
| Cat 06 | Section E (Hardware specifications) | storageType | SINGLE_SELECT | Table row |
| Cat 06 | Section E (Hardware specifications) | bandwidth | SINGLE_SELECT | Table row |
| Cat 06 | Section E (Hardware specifications) | dedicatedIp | YES_NO | Table row |
| Cat 06 | Section E (Hardware specifications) | ipVersion | SINGLE_SELECT | Table row |
| Cat 06 | Section F (Platform compatibility) | platformCompatibility | MULTI_SELECT | 8 options |
| Cat 06 | Section G (Performance and security) | latencyMeasurementLocation | SINGLE_SELECT | Field |
| Cat 06 | Section G (Performance and security) | measurementMethodology | TEXT | Field |
| Cat 06 | Section G (Performance and security) | uptimeSla | STATUS_OR_VALUE | Field |
| Cat 06 | Section G (Performance and security) | ddosProtection | YES_NO | Field |
| Cat 06 | Section G (Performance and security) | firewall | YES_NO | Field |
| Cat 06 | Section G (Performance and security) | backup | SINGLE_SELECT | Field |
| Cat 06 | Section G (Performance and security) | disasterRecovery | YES_NO | Field |
| Cat 06 | Section G (Performance and security) | monitoring | SINGLE_SELECT | Field |
| Cat 06 | Section G (Performance and security) | support | SINGLE_SELECT | Field |
| Cat 07 | Section A (Service type) | serviceType | MULTI_SELECT | 15 options |
| Cat 07 | Section B (Asset coverage) | assetCoverage | MULTI_SELECT | 12 options |
| Cat 07 | Section C (API protocol) | apiProtocol | MULTI_SELECT | 9 options |
| Cat 07 | Section D (Data frequency) | dataFrequency | SINGLE_SELECT | 11 options |
| Cat 07 | Section E (Historical data coverage) | historicalDataCoverage | SINGLE_SELECT | 6 options |
| Cat 07 | Section F (Developer support) | developerSupport | MULTI_SELECT | 10 options |
| Cat 07 | Section G (Usage limits) | apiRateLimit | NUMBER | Field |
| Cat 07 | Section G (Usage limits) | streamingConnectionLimit | NUMBER | Field |
| Cat 07 | Section G (Usage limits) | concurrentUsers | NUMBER | Field |
| Cat 07 | Section G (Usage limits) | dataRetention | SINGLE_SELECT | Field |
| Cat 07 | Section G (Usage limits) | redistributionPermitted | TRI_STATE | Field |
| Cat 07 | Section G (Usage limits) | usagePricing | TEXT | Field |
| Cat 08 | Section A (Solution type) | solutionType | MULTI_SELECT | 17 options |
| Cat 08 | Section B (Verification methods) | verificationMethods | MULTI_SELECT | 11 options |
| Cat 08 | Section C (Geographic coverage) | supportedCountries | COUNTRY_MULTI | Field |
| Cat 08 | Section C (Geographic coverage) | supportedDocumentCountries | COUNTRY_MULTI | Field |
| Cat 08 | Section C (Geographic coverage) | restrictedJurisdictions | COUNTRY_MULTI | Field |
| Cat 08 | Section C (Geographic coverage) | dataResidencyLocations | MULTI_SELECT | Field |
| Cat 08 | Section D (Technical integration) | technicalIntegration | MULTI_SELECT | 9 options |
| Cat 08 | Section E (Monitoring features) | monitoringFeatures | MULTI_SELECT | 10 options |
| Cat 08 | Section F (Security and privacy) | dataEncryption | YES_NO_DETAILS | Field |
| Cat 08 | Section F (Security and privacy) | dataRetentionPolicy | TEXT | Field |
| Cat 08 | Section F (Security and privacy) | dataResidency | SINGLE_SELECT | Field |
| Cat 08 | Section F (Security and privacy) | isoCertification | SINGLE_SELECT | Field |
| Cat 08 | Section F (Security and privacy) | socReport | SINGLE_SELECT | Field |
| Cat 08 | Section F (Security and privacy) | otherSecurityAttestations | REPEATABLE_GROUP | Field |
| Cat 08 | Section F (Security and privacy) | privacyPolicyUrl | TEXT | Line field |
| Cat 08 | Section F (Security and privacy) | securityDocumentationUrl | TEXT | Line field |
| Cat 09 | Section A (Service type) | serviceType | MULTI_SELECT | 25 options |
| Cat 09 | Section B (Customer business stage) | customerBusinessStage | MULTI_SELECT | 8 options |
| Cat 09 | Section C (Consulting areas) | consultingAreas | MULTI_SELECT | 12 options |
| Cat 09 | Section D (Jurisdictions covered) | countries | COUNTRY_MULTI | Field |
| Cat 09 | Section D (Jurisdictions covered) | regions | MULTI_SELECT | Field |
| Cat 09 | Section D (Jurisdictions covered) | localPartnerAvailable | YES_NO | Field |
| Cat 09 | Section D (Jurisdictions covered) | remoteServices | YES_NO | Field |
| Cat 09 | Section D (Jurisdictions covered) | on | SINGLE_SELECT | Field |
| Cat 09 | Section E (Project delivery model) | projectDeliveryModel | MULTI_SELECT | 7 options |
| Cat 09 | Section F (Project timeline) | projectTimeline | SINGLE_SELECT | 7 options |
| Cat 09 | Section G (Deliverables and responsibilities) | projectDeliverables | RICH_TEXT | Field |
| Cat 09 | Section G (Deliverables and responsibilities) | exclusionsLimitations | RICH_TEXT | Field |
| Cat 09 | Section G (Deliverables and responsibilities) | clientResponsibilities | RICH_TEXT | Field |
| Cat 09 | Section G (Deliverables and responsibilities) | requiredClientDocuments | MULTI_SELECT | Field |
| Cat 09 | Section G (Deliverables and responsibilities) | projectPhases | REPEATABLE_GROUP | Field |
| Cat 09 | Section G (Deliverables and responsibilities) | implementationTimeline | TEXT | Field |
| Cat 09 | Section G (Deliverables and responsibilities) | consultantQualifications | TEXT | Field |
| Cat 09 | Section G (Deliverables and responsibilities) | caseStudies | URL | Field |
| Cat 09 | Section G (Deliverables and responsibilities) | ongoingSupport | YES_NO | Field |
| Cat 09 | Section G (Deliverables and responsibilities) | change | TEXT | Field |
| Cat 10 | Section A (Provider type) | providerType | SINGLE_SELECT | 6 options |
| Cat 10 | Section B (Developer information) | providerDeveloperName | TEXT | Field |
| Cat 10 | Section B (Developer information) | logoOrDeveloperPhoto | TEXT | Field |
| Cat 10 | Section B (Developer information) | shortIntroduction | TEXT | Field |
| Cat 10 | Section B (Developer information) | fullBiography | RICH_TEXT | Field |
| Cat 10 | Section B (Developer information) | website | URL | Field |
| Cat 10 | Section B (Developer information) | linkedinProfile | URL | Field |
| Cat 10 | Section B (Developer information) | tradingviewProfile | URL | Field |
| Cat 10 | Section B (Developer information) | mql5Profile | URL | Field |
| Cat 10 | Section B (Developer information) | country | SINGLE_SELECT | Field |
| Cat 10 | Section B (Developer information) | city | TEXT | Field |
| Cat 10 | Section B (Developer information) | businessEmail | TEXT | Field |
| Cat 10 | Section B (Developer information) | publicContactPreference | SINGLE_SELECT | Field |
| Cat 10 | Section B (Developer information) | developmentExperience | SINGLE_SELECT | Field |
| Cat 10 | Section B (Developer information) | supportedLanguages | MULTI_SELECT | Field |
| Cat 10 | Section B (Developer information) | verificationDocuments | TEXT | Field |
| Cat 10 | Section B (Developer information) | lessThan1Year | TEXT | Line field |
| Cat 10 | Section B (Developer information) | 1 | TEXT | Field |
| Cat 10 | Section B (Developer information) | 3 | TEXT | Field |
| Cat 10 | Section B (Developer information) | 6 | TEXT | Field |
| Cat 10 | Section B (Developer information) | 10Years | TEXT | Line field |
| Cat 10 | Section B (Developer information) | preferNotToDisclose | TEXT | Line field |
| Cat 10 | Section B (Developer information) | publicContactPreference | TEXT | Line field |
| Cat 10 | Section C (Individual indicator / trading tool type) | individualIndicatorTradingToolType | SINGLE_SELECT | 15 options |
| Cat 10 | Section D (Main purpose) | mainPurpose | MULTI_SELECT | 13 options |
| Cat 10 | Section E (Platform compatibility) | platformCompatibility | MULTI_SELECT | 8 options |
| Cat 10 | Section F (File format) | fileFormat | MULTI_SELECT | 8 options |
| Cat 10 | Section G (Operating system) | operatingSystem | MULTI_SELECT | 7 options |
| Cat 10 | Section H (Supported timeframes) | supportedTimeframes | MULTI_SELECT | 10 options |
| Cat 10 | Section I (Supported instruments) | supportedInstruments | MULTI_SELECT | 8 options |
| Cat 10 | Section J (Indicator methodology) | indicatorMethodology | SINGLE_SELECT | 13 options |
| Cat 10 | Section K (Features) | features | MULTI_SELECT | 13 options |
| Cat 10 | Section L (Technical disclosures) | productVersion | TEXT | Field |
| Cat 10 | Section L (Technical disclosures) | releaseDate | DATE | Field |
| Cat 10 | Section L (Technical disclosures) | lastUpdate | DATE | Field |
| Cat 10 | Section L (Technical disclosures) | sourceCodeIncluded | TRI_STATE | Field |
| Cat 10 | Section L (Technical disclosures) | eaIntegration | SINGLE_SELECT | Field |
| Cat 10 | Section L (Technical disclosures) | multi | SINGLE_SELECT | Field |
| Cat 10 | Section L (Technical disclosures) | customisableParameters | YES_NO | Field |
| Cat 10 | Section L (Technical disclosures) | alertTypes | SINGLE_SELECT | Field |
| Cat 10 | Section L (Technical disclosures) | trialDuration | TEXT | Field |
| Cat 10 | Section L (Technical disclosures) | calculationMethodology | TEXT | Field |
| Cat 10 | Section L (Technical disclosures) | repaintingBehaviour | SINGLE_SELECT | Field |
| Cat 10 | Section L (Technical disclosures) | backtestEvidence | URL | Field |
| Cat 10 | Section L (Technical disclosures) | testingMethodology | TEXT | Field |
| Cat 10 | Section L (Technical disclosures) | testingPeriod | DATE_RANGE | Field |
| Cat 10 | Section L (Technical disclosures) | transactionCostsIncluded | TRI_STATE | Field |
| Cat 10 | Section L (Technical disclosures) | knownLimitations | TEXT | Field |
| Cat 10 | Section M (Product screenshots and gallery) | forEachImage | TEXT | Line field |
| Cat 10 | Section M (Product screenshots and gallery) | imageUpload | TEXT | Line field |
| Cat 10 | Section M (Product screenshots and gallery) | imageTitle | TEXT | Line field |
| Cat 10 | Section M (Product screenshots and gallery) | description | TEXT | Line field |
| Cat 10 | Section M (Product screenshots and gallery) | platform | TEXT | Line field |
| Cat 10 | Section M (Product screenshots and gallery) | timeframe | TEXT | Line field |
| Cat 10 | Section M (Product screenshots and gallery) | instrumentSymbol | TEXT | Line field |
| Cat 10 | Section M (Product screenshots and gallery) | screenshotType | SINGLE_SELECT | Field |
| Cat 10 | Section M (Product screenshots and gallery) | coverImage | YES_NO | Field |
| Cat 10 | Section M (Product screenshots and gallery) | displayOrder | TEXT | Line field |
| Cat 10 | Section M (Product screenshots and gallery) | rightsConfirmation | TEXT | Line field |
| Cat 10 | Section N (Trading tool licence and pricing) | accessType | SINGLE_SELECT | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | currency | SINGLE_SELECT | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | paymentFrequency | SINGLE_SELECT | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | licenceType | SINGLE_SELECT | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | price | MONEY | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | freeTrial | YES_NO | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | trialDuration | TEXT | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | demoAvailable | YES_NO | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | permittedDevices | NUMBER | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | updatesIncluded | YES_NO | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | supportIncluded | YES_NO | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | refundPolicy | TEXT | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | purchaseLink | URL | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | termsAndConditions | URL | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | 7Form5 | SINGLE_SELECT | Field |
| Cat 10 | Section N (Trading tool licence and pricing) | completedSeparatelyForEveryProduct | TEXT | Line field |
| Cat 10 | Section N (Trading tool licence and pricing) | thisIsASeparateFormFromCompanyRegistrationAndCategoryOnboardingEveryProviderCanAddAsManyProductsAndServicesAsRequired | TEXT | Line field |
| Cat 10 | Section A (Basic product information) | productServiceName | TEXT | Table row |
| Cat 10 | Section A (Basic product information) | productLogo | TEXT | Table row |
| Cat 10 | Section A (Basic product information) | productThumbnail | TEXT | Table row |
| Cat 10 | Section A (Basic product information) | shortDescription | TEXT | Table row |
| Cat 10 | Section A (Basic product information) | fullDescription | RICH_TEXT | Table row |
| Cat 10 | Section A (Basic product information) | productType | TEXT | Table row |
| Cat 10 | Section A (Basic product information) | productVersion | TEXT | Table row |
| Cat 10 | Section A (Basic product information) | initialReleaseDate | TEXT | Table row |
| Cat 10 | Section A (Basic product information) | latestUpdateDate | TEXT | Table row |
