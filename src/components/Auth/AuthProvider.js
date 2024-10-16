import React, { createContext, useState, useContext } from "react";
import {jwtDecode} from "jwt-decode"; 

export const AuthContext = createContext({
  admin: null,
  handleLogin: (token) => {},
  handleLogout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  const handleLogin = (token) => {
    try {
      const decodedAdmin = jwtDecode(token);       
      setAdmin(decodedAdmin);
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("avatar");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ admin, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
