import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/landing';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
// import { Settings } from './pages/Settings';
// import { Links } from './pages/Links';

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
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/dashboard/links" element={<Links />} /> */}
        {/* <Route path="/dashboard/settings" element={<Settings />} /> */}
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
