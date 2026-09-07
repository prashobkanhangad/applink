import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/landing';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { CookiePolicy } from './pages/CookiePolicy';
import { Sitemap } from './pages/Sitemap';
import { DeepLinkingPlatform } from './pages/DeepLinkingPlatform';
import { DeferredDeepLinking } from './pages/DeferredDeepLinking';
import { AppDeepLinks } from './pages/AppDeepLinks';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Affiliate } from './pages/Affiliate';
import { VisitorTracker } from './components/VisitorTracker';

function App() {
  return (
    <BrowserRouter>
      <VisitorTracker />
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-background">
              <Header />
              <main>
                <Home />
              </main>
              <Footer />
            </div>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        {/* <Route path="/dashboard/links" element={<Links />} /> */}
        {/* <Route path="/dashboard/settings" element={<Settings />} /> */}
        <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
