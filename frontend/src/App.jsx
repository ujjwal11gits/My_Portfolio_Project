import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PortfolioProvider } from './context/PortfolioContext';
import Navbar   from './components/layout/Navbar';
import Footer   from './components/layout/Footer';
import Cursor   from './components/ui/Cursor';
import Home         from './pages/Home';
import About        from './pages/About';
import Coding       from './pages/Coding';
import DevStats     from './pages/DevStats';
import Projects     from './pages/Projects';
import Achievements from './pages/Achievements';
import Contact      from './pages/Contact';
import Admin        from './pages/Admin';
import './styles/index.css';

function App() {
  return (
    <PortfolioProvider>
      <BrowserRouter>
        <Cursor />
        <Navbar />
        <main>
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/about"         element={<About />} />
            <Route path="/coding"        element={<Coding />} />
            <Route path="/dev-stats"     element={<DevStats />} />
            <Route path="/projects"      element={<Projects />} />
            <Route path="/achievements"  element={<Achievements />} />
            <Route path="/contact"       element={<Contact />} />
            <Route path="/admin"         element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#1a1a2e', color: '#f1f5f9', border: '1px solid rgba(139,92,246,0.3)' },
          }}
        />
      </BrowserRouter>
    </PortfolioProvider>
  );
}

export default App;
