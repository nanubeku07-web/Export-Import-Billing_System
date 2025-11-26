import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuth = !!localStorage.getItem("token");
  const location = useLocation();

  if (!isAuth) {
    // Redirect to login and keep the attempted location in state
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
