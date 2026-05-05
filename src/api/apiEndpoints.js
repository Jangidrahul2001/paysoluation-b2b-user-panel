export const apiEndpoints = {
  // own
  fetchProfile: "/fetch-user-profile",
  changePassword: "/change-user-password",
  fetchWallet: "/user/wallet/get-wallet-balance",
  fetchRoleListForSignUp: "/user/role/get-role-list",
  userRegister: "/user-register",
  userLogin: "/user-login",
  reUploadKyc: "/user/kyc/reupload-kyc",
  fetchKycDetails: "/user/kyc/submitted-kyc",
  verifyUserOtp: "/verify-user-otp",
  onlineKycSubmission: "/user/kyc/online-kyc-submission",
  kycSubmission: "/user/kyc/offline-kyc-submission",
  fetchRole: "/user/role/get-roles",
  fetchDownLineUser: "/user/user/get-downline-users",

  // user
  fetchUser: "/user/user/get-users",
  createUser: "/user/user/create-user",

  // topup
  fetchAdminBankList: "/user/topupBank/get-all-topup-banks",
  fetchTopUpRequest: "/user/offlineTopup/get-all-offline-topup-requests",
  fetchOfflineTopupStats: "/user/offlineTopup/offline-topup-requests-stats",
  createTopUpRequest: "/user/offlineTopup//add-offline-topup-request",

  // aeps bank account
  addAepsBankAccount: "/user/aepsPayoutBank/add-aeps-payout-bank",
  fetchAepsBankAccount: "/user/aepsPayoutBank/aeps-payout-banks",
  fetchApprovedAepsBankAccount: "/user/aepsPayoutBank/approved-aeps-banks",
  deleteAepsBankAccount: "/user/aepsPayoutBank/delete-aeps-payout-bank",
  fetchAepsBankAccountList: "user/payout-bank/bank-list",

  //dashboard
  fetchTopupDetailsStats: "/user/dashboard/topup-stats",

  // service
  fetchServiceWithPipeline: "/user/service/list",
  allServiceList: "/user/service/all-service-list",
  requestService: "/user/serviceRequest/add-service-request",

  // support ticket
  createSupportTicket: "/user/support/create-support-request",
  fetchMySupportTickets: "/user/support/get-my-support-requests",
  fetchTicketStats: "/user/support/get-ticket-stats",
  fetchSupportTicketByID: "/user/support/my-support-request",

  // account whitelist
  accountWhitelist: "/user/accountWhitelist",

  // aeps to main wallet transfer
  aepsToMainWalletTransfer: "/user/wallet/aeps-to-main",
  walletTransferHistory: "/user/walletLedger/wallet-history",

  // ecommerce
  fetchProducts: "/user/shopping/product-list",
  fetchProductById: "/user/shopping/product",
  createOrder: "/user/order/create-order",
  fetchMyOrders: "/user/order/my-orders",
  fetchMyOrderByID: "/user/order/my-order",

  // online aadhar
  sendAdharOtp: "sendAadharOtp",
  verifyAadharOtp: "verifyAadharOtp",

  // offline service
  fetchOfflineServices: "/user/offlineService/all-offline-service",
  fetchOfflineServiceById: "/user/offlineService/offline-service-form",
  createOfflineServiceRequest:
    "/user/offlineServiceRequest/create-offline-service-request",
  fetchOfflineServiceRequest:
    "/user/offlineServiceRequest/fetch-offline-service-request",

  // online Services
  fetchOnlineServices: "user/onlineService/all-online-service",

  // recharge
  mobileRechargeVerify: "/user/recharge/mobile-verify",
  fetchRechargePlans: "/user/recharge/fetch-plan",
  mobileRechargeOperatorList: "/user/recharge/operator-list",
  mobileRechargeCircleList: "/user/recharge/circle-list",
  doRecharge: "/user/recharge/mobile-prepaid-recharge",
  recentRecharges: "/user/rechargeReport/my-recharge-history",

  // bbps
  bbpsCategories: "/user/bbps/fetch-bbps-categories",
  bbpsBillers: "user/bbps/fetch-particular-category-billers",
  bbpsBillerFieldInfo: "user/bbps/fetch-biller-info",
  fetchBbpsBill: "/user/bbps/fetch-bill",
  validateBbpsBill: "/user/bbps/validate-bill",
  payBbpsBill: "/user/bbps/bill-pay",

  onboardByCoupon: "/user/coupon/redeem-coupon",
  onboardByCoupon: "/user/coupon/redeem-coupon",
  onBoardOffline: "user/charge/add-id-charge-request",

  // service wiserequest recharge

  rechargeStats: "/user/rechargeReport/recharge-stats",
  rechargeReports: "/user/rechargeReport/complete-recharge-report",
  rechargeReportById: "/user/rechargeReport/report",

  // service wiserequest aeps1
  aeps1stats: "/user/insAepsReport/aeps-stats",
  aeps1Reports: "/user/insAepsReport/complete-aeps-report",
  aeps1reportById: "/user/insAepsReport/report",

  //  service wise report aeps2
  aeps2stats: "/user/aepsReport/aeps-stats",
  aeps2Reports: "/user/aepsReport/complete-aeps-report",
  aeps2reportById: "/user/aepsReport/report",

  // service wise request dmt
  dmtStats: "/user/dmtReport/dmt-stats",
  dmtReports: "/user/dmtReport/complete-dmt-report",
  dmtReportById: "/user/dmtReport/report",

  // service wise request xpress-payout
  xpressPayoutStats: "/user/xpressPayoutReport/payout-stats",
  xpressPayoutReports: "/user/xpressPayoutReport/complete-payout-report",
  xpressPayoutReportById: "/user/xpressPayoutReport/report",

  // service wise request aeps payout
  aepsPayoutStats: "/user/aepsPayoutReport/payout-stats",
  aepsPayoutReports: "/user/aepsPayoutReport/complete-payout-report",
  aepsPayoutReportById: "/user/aepsPayoutReport/report",

  // smart transaction
  transactionSearch: "/user/search/transaction-search",

  bbpsStats: "/user/bbpsReport/bbps-stats",
  bbpsReports: "/user/bbpsReport/complete-bbps-report",

  //  commision plan
  myCommissionPlan: "/user/commissionPlan/my-commission-plan",

  // wallet refill
  walletRefillHistory: "/user/userWalletRefill/wallet-refill-history",
  fetchUserProfileForWalletRefill: "/user/userWalletRefill/user-profile",
  createWalletRefill: "/user/userWalletRefill/refill-user-wallet ",

  // wallet ledger
  walletLedgerStats: "user/walletLedger/wallet-stats",
  fetchWalletLedger: "/user/walletLedger/wallet-report",

  // notification
  allNotifications: "/user/notification/all-notifications",

  // states bank and city
  fetchAllStates: "/user/stateCity/all-state-list",
  // for aeps statelist
  fetchStateList: "/user/state/state-list",
  fetchCity: "/user/stateCity/state-wise-city-list",
  fetchAllBanks: "/user/globalBank/global-banks-list",

  // policy
  fetchPolicy: "/user/policy/policy-by-type",

  // aeps
  aepsInstantRegisterOutlet: "/user/aepsInstant/registerOutlet",
  aepsInstantGetBioMetricStatus: "/user/aepsInstant/biometric-kyc-status",
  aepsInstantBiometricKyc: "/user/aepsInstant/biometric-kyc",
  apesInstantdailyLogin: "/user/aepsInstant/daily-login",
  aepsBankList: "/user/aepsbank/list-banks",
  aepsBalanceInquiry: "/user/aepsInstant/balance-enquiry",
  aepsMiniStatement: "/user/aepsInstant/mini-statement",
  aepsCashWithdrawal: "/user/aepsInstant/cash-withdraw",
  aepsStatusForDailyLogin: "/user/aepsInstant/aeps-status",

  // aeps 2
  aeps2OnboardUser: "/user/aeps/onboard-user",
  aeps2RequestActivation: "/user/aeps/activate",
  aeps2BankList: "/user/ebank/bank-list",
  aeps2GetEkycOtp: "/user/aeps/generate-ekyc-otp",
  aeps2VerifyEkycOtp: "/user/aeps/verify-ekyc-otp",
  aeps2BiometricKyc: "/user/aeps/ekyc-biometric",
  aeps2DailyLogin: "/user/aeps/daily-login",
  aeps2InitiateTransaction: "/user/aeps/initiate-transaction",

  // dmt
  dmtGetCustomer: "/user/dmt/get-customer",
  dmtCustomerEkyc: "/user/dmt/customer-ekyc",
  dmtGetBeneficiary: "/user/dmt-ben/get-beneficiary",
  dmtAddBeneficiary: "/user/dmt-ben/add-beneficiary",
  dmtCheckLimit: "/user/dmt/check-limit",
  dmtGenerateOtpForRegistration: "/user/dmt/generate-reg-otp",
  dmtVerifyOtpForRegistration: "/user/dmt/register-customer",
  dmtGenerateOtpForTransfer: "/user/dmt/generate-totp",
  dmtTransferAmount: "/user/dmt/transfer-fund",

  // aeps Payout
  aepsPayoutInitiateTransaction: "/user/aepsPayout/initiate-payout-transfer",
  aepsPayoutCheckStatus: "/user/aepsPayout/check-payout-status",
  aepspayouList: "/user/aepsPayoutReport/list-all",

  // xpress payout
  fetchXpressAddedBankAccount: "/user/xpressPayoutBank/bank-list",
  xpresspayoutAddBankAccount: "/user/xpressPayoutBank/add-payout-bank",
  xpresspayoutInitiateTransaction:
    "/user/xpressPayout/initiate-payout-transfer",
  xpressPayoutBankDelete: "/user/xpressPayoutBank/delete-payout-bank",
  xpressPayoutList: "/user/xpressPayoutReport/list-all",
};
