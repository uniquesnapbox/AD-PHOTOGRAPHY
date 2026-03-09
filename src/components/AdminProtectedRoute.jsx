import { Navigate } from "react-router-dom";
import { getStoredAdminToken } from "../utils/adminAuth";

function AdminProtectedRoute({ children }) {
  return getStoredAdminToken() ? children : <Navigate to="/login" replace />;
}

export default AdminProtectedRoute;
