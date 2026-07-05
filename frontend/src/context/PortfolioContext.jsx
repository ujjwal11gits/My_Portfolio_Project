import { createContext, useContext, useEffect, useState } from 'react';
import { getAllPortfolio } from '../utils/api';

// 1. Create the Context:
// Think of this as a global storage shelf. Instead of passing data manually from page to page (prop drilling),
// we save it in this context shelf so any React file can pull it directly.
const PortfolioContext = createContext(null);

// 2. Provider Component:
// Wraps around our entire React app (in main.jsx). It fetches data once and shares it with all child components.
export const PortfolioProvider = ({ children }) => {
  const [data, setData]       = useState(null); // Holds the main profile, project, and experience databases
  const [loading, setLoading] = useState(true); // Tracks if the network call is still loading
  const [error, setError]     = useState(null);   // Stores server errors if the backend goes down

  // useEffect runs exactly once when the website first loads (mounts).
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch all portfolio models concurrently inside a single backend call.
        const res = await getAllPortfolio();
        setData(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading indicator once network call completes
      }
    };
    fetchAll();
  }, []); // Empty dependency array [] means: "Run this only once when the page loads, not on state updates".

  return (
    // We pass our state variables into the Provider's 'value'.
    // Every React file inside the app can read these values now.
    <PortfolioContext.Provider value={{ data, loading, error, setData }}>
      {children}
    </PortfolioContext.Provider>
  );
};

// 3. Custom Hook (usePortfolio):
// Instead of importing both useContext and PortfolioContext on every page,
// components can just write: `const { data } = usePortfolio();`
export const usePortfolio = () => useContext(PortfolioContext);
export default PortfolioContext;
