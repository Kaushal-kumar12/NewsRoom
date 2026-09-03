import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  loadFirebaseNews
} from "../services/firebaseBackend";



const AppContext = createContext(null);


/*
|--------------------------------------------------------------------------
| Default categories
|--------------------------------------------------------------------------
*/

const categories = [
  "India",
  "World",
  "Bihar",
  "Technology",
  "Business",
  "Sports",
  "Science"
];


export function AppProvider({ children }) {

  const [news, setNews] = useState([]);

  const [search, setSearch] = useState("");

  const [theme, setTheme] = useState("light");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | Load Firebase news
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    let mounted = true;

    async function loadNews() {

      try {

        setLoading(true);

        setError(null);

        const firebaseNews = await loadFirebaseNews();

        if (mounted) {
          setNews(firebaseNews);
        }

      } catch (error) {

        console.error("Firebase news loading error:", error);

        if (mounted) {
          setError(error);
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }

    loadNews();

    return () => {
      mounted = false;
    };

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Refresh news
  |--------------------------------------------------------------------------
  */

  const refreshNews = async () => {

    try {

      setLoading(true);

      setError(null);

      const firebaseNews = await loadFirebaseNews();

      setNews(firebaseNews);

    } catch (error) {

      console.error("Failed to refresh news:", error);

      setError(error);

    } finally {

      setLoading(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Context value
  |--------------------------------------------------------------------------
  */

  const value = useMemo(
    () => ({
      news,

      categories,

      search,
      setSearch,

      theme,
      setTheme,

      loading,
      error,

      refreshNews
    }),
    [
      news,
      search,
      theme,
      loading,
      error
    ]
  );


  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}


export function useApp() {

  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider"
    );
  }

  return context;
}