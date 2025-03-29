import { createContext, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Define search scope based on current page
  const getSearchScope = () => {
    if (location.pathname.includes("/customers")) return "Search customers...";
    if (location.pathname.includes("/interactions")) return "Search interactions...";
    if (location.pathname.includes("/orders")) return "Search orders...";
    if (location.pathname.includes("/revenue")) return "Search transactions...";
    if (location.pathname.includes("/employees")) return "Search employees...";
    return "Search everything...";
  };

  // Search logic (navigate or fetch results based on input)
  const handleSearch = () => {
    if (query.trim() === "") return;

    if (query.toLowerCase().includes("customers")) {
      navigate("/customers");
    } else if (query.toLowerCase().includes("orders")) {
      navigate("/orders");
    } else if (query.toLowerCase().includes("add customer")) {
      navigate("/customers/new"); // Navigate to Add Customer form
    } else {
      console.log("Searching for:", query);
      // Here, you could make an API call for relevant search results
    }
  };

  return (
    <SearchContext.Provider value={{ query, setQuery, getSearchScope, handleSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook for easier access
export const useSearch = () => useContext(SearchContext);
