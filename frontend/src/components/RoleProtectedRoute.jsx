import React from "react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/userRole";

/**
 * RoleProtectedRoute - Protects routes based on user role
 * @param {boolean} adminOnly - If true, only admins can access this route
 * @param {JSX.Element} children - The component to render if authorized
 */
const RoleProtectedRoute = ({ adminOnly = false, children }) => {
    const userIsAdmin = isAdmin();

    // If route requires admin and user is not admin, redirect to user dashboard
    if (adminOnly && !userIsAdmin) {
        return <Navigate to="/home" replace />;
    }

    // If user is admin trying to access user-only routes, allow it (admins can see everything)
    return children;
};

export default RoleProtectedRoute;
