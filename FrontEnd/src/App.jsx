import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/landing';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { CookiePolicy } from './pages/CookiePolicy';
import { Sitemap } from './pages/Sitemap';
import { DeepLinkingPlatform } from './pages/DeepLinkingPlatform';
import { DeferredDeepLinking } from './pages/DeferredDeepLinking';
import { AppDeepLinks } from './pages/AppDeepLinks';
import { Blog } from './pages/Blog';
import { FirebaseDynamicLinksAlternatives2025 } from './pages/blog/FirebaseDynamicLinksAlternatives2025';
import { WhatIsDeepLinking } from './pages/blog/WhatIsDeepLinking';
import { DeferredDeepLinkingForProductManagers } from './pages/blog/DeferredDeepLinkingForProductManagers';
import { HowToImplementDeepLinking } from './pages/blog/HowToImplementDeepLinking';

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/blog/firebase-dynamic-links-alternatives-2025" element={<FirebaseDynamicLinksAlternatives2025 />} />
        <Route path="/blog/what-is-deep-linking" element={<WhatIsDeepLinking />} />
        <Route path="/blog/deferred-deep-linking-for-product-managers" element={<DeferredDeepLinkingForProductManagers />} />
        <Route path="/blog/how-to-implement-deep-linking-android-ios" element={<HowToImplementDeepLinking />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/dashboard/links" element={<Links />} /> */}
        {/* <Route path="/dashboard/settings" element={<Settings />} /> */}
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
