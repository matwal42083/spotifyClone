import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import './App.css';

export default function App() {
  // Step 6t: Write return (
       return (
          <>
          <BrowserRouter>
          <Navbar />
           <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
           </Routes>
          <Footer />
          </BrowserRouter>
          </>
       )
    // Step 6u: Open a <BrowserRouter> tag

      // Step 6v: Render a self-closing <Navbar /> component

      // Step 6w: Open a <Routes> tag

        // Step 6x: Render <Route path="/" element={<Dashboard />} />

        // Step 6y: Render <Route path="*" element={<NotFound />} />

      // Step 6z: Close the </Routes> tag

      // Step 6aa: Render a self-closing <Footer /> component

    // Step 6ab: Close the </BrowserRouter> tag

  // Step 6ac: Close the return statement with );

  // (Remove temporary return null; below once you write Step 6t–6ac)
  return null;
}

// LIVE HMR CHECK: Start `npm run dev` and confirm `/` mounts Dashboard and `/unknown` mounts NotFound!
// NEXT STEP: Open src/components/GraphicEqualizer.jsx
