import { createContext, useContext, useEffect, useState } from 'react';
import { getAllPortfolio } from '../utils/api';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await getAllPortfolio();
        setData(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <PortfolioContext.Provider value={{ data, loading, error, setData }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
export default PortfolioContext;
