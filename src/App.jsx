import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { LazyMotion, domMax, AnimatePresence } from "framer-motion";
import { GlobalToaster } from "./components/ui/Global-toast";
import { AuthWrapper } from "./components/layout/AuthWrapper";
import "./App.css";

// Lazy Load Pages
import Dashboard from "./pages/Dashboard";
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));
const KYCSubmission = React.lazy(() => import("./pages/KYC/KYCSubmission"));
const OnlineKYCSubmission = React.lazy(
  () => import("./pages/KYC/OnlineKYCSubmission"),
);
const PendingApproval = React.lazy(() => import("./pages/KYC/PendingApproval"));
const Users = React.lazy(() => import("./pages/Users"));
const AddUser = React.lazy(() => import("./pages/AddUser"));
const Recharge = React.lazy(() => import("./pages/Recharge"));
const AEPS = React.lazy(() => import("./pages/Aeps1/AEPS"));
const AepsServiceDashboard = React.lazy(() => import("./pages/Aeps1/AepsDashboard"));
const Aeps2 = React.lazy(() => import("./pages/Aeps2/Aeps2"));
const Aeps2Pending = React.lazy(() => import("./pages/Aeps2/Aeps2Pending"));
const AepsOtp = React.lazy(() => import("./pages/Aeps2/AepsOtp"));
const Aeps2DailyLogin = React.lazy(() => import("./pages/Aeps2/Aeps2DailyLogin"));
const Aeps2Dashboard = React.lazy(() => import("./pages/Aeps2/Aeps2Dashboard"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const MoneyTransfer = React.lazy(() => import("./pages/DMT/MoneyTransfer"));
const MoneyTransferKyc = React.lazy(() => import("./pages/DMT/MoneyTransferKyc"));
const MoneyTransferDashboard = React.lazy(() => import("./pages/DMT/MoneyTransferDashboard"));
const AddBeneficiary = React.lazy(
  () => import("./pages/DMT/AddBeneficiary"),
);
const BillPayment = React.lazy(() => import("./pages/BillPayment"));
const AEPSPayout = React.lazy(() => import("./pages/AEPSPayout"));
const XpressTransfer = React.lazy(() => import("./pages/XpressTransfer"));
const WalletTransfer = React.lazy(() => import("./pages/WalletTransfer"));
const OfflineService = React.lazy(() => import("./pages/OfflineService"));
const OnlineService = React.lazy(() => import("./pages/OnlineService"));
const ShoppingStore = React.lazy(() => import("./pages/ShoppingStore"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const ViewOrder = React.lazy(() => import("./pages/ViewOrder"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const CommissionPlan = React.lazy(() => import("./pages/CommissionPlan"));
const UserWalletRefill = React.lazy(() => import("./pages/UserWalletRefill"));
const WalletLedger = React.lazy(() => import("./pages/WalletLedger"));
const WalletTransactionDetails = React.lazy(
  () => import("./pages/WalletTransactionDetails"),
);
const TransactionReport = React.lazy(() => import("./pages/TransactionReport"));
const CommissionReport = React.lazy(() => import("./pages/CommissionReport"));
const OfflineTopup = React.lazy(() => import("./pages/Topup/OfflineTopup"));
const OfflineHistory = React.lazy(() => import("./pages/Topup/OfflineHistory"));
const OnlineTopup = React.lazy(() => import("./pages/Topup/OnlineTopup"));
const SupportTicket = React.lazy(() => import("./pages/SupportTicket"));
const OnboardingCharges = React.lazy(
  () => import("./pages/Onboarding/OnboardingCharges"),
);
const OnboardingPendingApproval = React.lazy(
  () => import("./pages/Onboarding/OnboardingPendingApproval"),
);
const PlaceholderPage = React.lazy(() => import("./pages/PlaceholderPage"));
const AccountWhitelist = React.lazy(() => import("./pages/AccountWhitelist"));
const OfflineServiceRequestView = React.lazy(
  () => import("./pages/OfflineServiceRequestView"),
);
const Notifications = React.lazy(() => import("./pages/Notifications"));
const Profile = React.lazy(() => import("./pages/ProfilePage"));
const AllTransactions = React.lazy(() => import("./pages/AllTransactions"));
const TransactionDetailPage = React.lazy(
  () => import("./pages/TransactionDetailPage"),
);
const NoPermission = React.lazy(() => import("./pages/NoPermission"));
const AepsActivation = React.lazy(() => import("./pages/Aeps2/AepsActivation"));
const AddNewAccount = React.lazy(() => import("./pages/AddNewAccount"));
// const NotFound = React.lazy(() => import("./pages/NotFound"));
import NotFound from "./pages/NotFound";

// Loading Fallback
import { LoadingScreen } from "./components/layout/LoadingScreen";

import MainLayout from "./components/layout/MainLayout";

function AnimatedRoutes() {


  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<AuthWrapper />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected Routes Handling */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/recharge" element={<Recharge />} />
          <Route path="/aeps" element={<AEPS />} />
          <Route path="/aeps/aeps-service" element={<AepsServiceDashboard />} />
          <Route path="/aeps2/pending" element={<Aeps2Pending />} />
          <Route path="/aeps2/aeps-service" element={<Aeps2Dashboard />} />
          <Route path="/aeps2/aeps-daily-login" element={<Aeps2DailyLogin />} />
          <Route path="/aeps2/aeps-activation" element={<AepsActivation />} />
          <Route path="/aeps2/aeps-otp" element={<AepsOtp />} />
          <Route path="/add-account" element={<AddNewAccount />} />
          <Route path="/aeps2" element={<Aeps2 />} />
          <Route path="/money-transfer" element={<MoneyTransfer />} />
          <Route path="/money-transfer/kyc" element={<MoneyTransferKyc />} />
          <Route path="/money-transfer/otp" element={<OtpVerification />} />
          <Route path="/money-transfer/dashboard" element={<MoneyTransferDashboard />} />
          <Route path="/money-transfer/add-beneficiary" element={<AddBeneficiary />} />
          <Route path="/bill-payment" element={<BillPayment />} />
          <Route path="/aeps-payout" element={<AEPSPayout />} />
          <Route path="/xpress-transfer" element={<XpressTransfer />} />
           <Route path="/upi-payout" element={<UpiPayout />} />
          <Route path="/wallet-transfer" element={<WalletTransfer />} />
          <Route path="/offline-service" element={<OfflineService />} />
          <Route path="/online-service" element={<OnlineService />} />
          <Route path="/store" element={<ShoppingStore />} />
          <Route path="/store/product" element={<ProductDetails />} />
          <Route path="/store/checkout" element={<Checkout />} />
          <Route path="/store/view-order" element={<ViewOrder />} />
          <Route path="/account-whitelist" element={<AccountWhitelist />} />
          <Route path="/user-wallet-refill" element={<UserWalletRefill />} />
          <Route path="/commission-plan" element={<CommissionPlan />} />
          <Route path="/wallet-ledger" element={<WalletLedger />} />
          <Route
            path="/wallet-ledger/details/:id"
            element={<WalletTransactionDetails />}
          />
          <Route path="/transaction-report" element={<TransactionReport />} />
          <Route
            path="/transaction-report-details/:_id"
            element={<TransactionDetailPage />}
          />
          <Route
            path="/service-report/:service"
            element={<TransactionReport />}
          />
          <Route
            path="/service-report/details/:id"
            element={<TransactionDetailPage />}
          />
          <Route path="/commission-report" element={<CommissionReport />} />
          <Route path="/all-transactions" element={<AllTransactions />} />
          <Route path="/topup/online" element={<OnlineTopup />} />
          <Route path="/topup/offline" element={<OfflineTopup />} />
          <Route path="/topup/history" element={<OfflineHistory />} />
          <Route path="/support" element={<SupportTicket />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route
            path="/offline-service-request"
            element={<OfflineServiceRequestView />}
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/no-permission" element={<NoPermission />} />
        </Route>

        <Route path="/onboarding-charges" element={<OnboardingCharges />} />
        <Route
          path="/onboarding-pending"
          element={<OnboardingPendingApproval />}
        />
        <Route path="/kyc" element={<KYCSubmission />} />
        <Route path="/kyc-online" element={<OnlineKYCSubmission />} />
        <Route path="/kyc-pending" element={<PendingApproval />} />

        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route
          path="/"
          element={
            <Navigate
              to={localStorage.getItem("authToken") ? "/dashboard" : "/login"}
              replace
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// Simple Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");
  const isAuthenticated = !!token;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <NavigationGuard>{children}</NavigationGuard>;
}

import { WelcomeScreen } from "./components/layout/WelcomeScreen";
import { NavigationGuard } from "./components/layout/NavigationGuard";
import OtpVerification from "./pages/DMT/OtpVerification";
import UpiPayout from "./pages/UpiPayout";
// import ReceiptModal from "./components/rechargeReceiptModal";
// import ReceiptModal from "./modal/RecieptModal";


function App() {
  const [showWelcome, setShowWelcome] = React.useState(false);

  React.useEffect(() => {
    // Check if user has seen the welcome screen in this session
    // For testing: Commented out session check to show on every load
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");

    if (!hasSeenWelcome) {
      setShowWelcome(true);

      const timer = setTimeout(() => {
        setShowWelcome(false);
        sessionStorage.setItem("hasSeenWelcome", "true");
      }, 2400); // Increased to accommodate the typewriter and exit animations

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <LazyMotion features={domMax}>
      <AnimatePresence mode="wait">
        {showWelcome && <WelcomeScreen key="welcome-screen" />}
      </AnimatePresence>

      {/* <Router basename="/user"> */}
      <Router>
        <div className="app-container">
          <GlobalToaster />
          <AnimatedRoutes />
        </div>
      </Router>
    </LazyMotion>
  );
}

export default App;
