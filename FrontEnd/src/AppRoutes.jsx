import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Header, Footer } from "./components/landing";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Signup } from "./pages/Signup";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { CookiePolicy } from "./pages/CookiePolicy";
import { Sitemap } from "./pages/Sitemap";
import { DeepLinkingPlatform } from "./pages/DeepLinkingPlatform";
import { DeferredDeepLinking } from "./pages/DeferredDeepLinking";
import { AppDeepLinks } from "./pages/AppDeepLinks";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { Affiliate } from "./pages/Affiliate";
import { Features } from "./pages/Features";
import { PricingPage } from "./pages/PricingPage";
import { Compare } from "./pages/Compare";
import { GuidesIndex } from "./pages/guides/GuidesIndex";
import { GuidePage } from "./pages/guides/GuidePage";
import { NotFound } from "./pages/NotFound";
import { VisitorTracker } from "./components/VisitorTracker";

const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function AppFallback() {
  return null;
}

export function AppRoutes() {
  return (
    <>
      <VisitorTracker />
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-background">
              <Header />
              <Home />
              <Footer />
            </div>
          }
        />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/guides" element={<GuidesIndex />} />
        <Route path="/guides/:slug" element={<GuidePage />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/onboarding"
          element={
            <Suspense fallback={<AppFallback />}>
              <Onboarding />
            </Suspense>
          }
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/deep-linking-platform" element={<DeepLinkingPlatform />} />
        <Route path="/deferred-deep-linking" element={<DeferredDeepLinking />} />
        <Route path="/app-deep-links" element={<AppDeepLinks />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/affiliate" element={<Affiliate />} />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<AppFallback />}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <Suspense fallback={<AppFallback />}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AppFallback />}>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AppFallback />}>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
