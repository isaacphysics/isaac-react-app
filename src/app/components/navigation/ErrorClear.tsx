import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { clearError } from "../../state";

// This component clears the error state when the location changes (i.e. when the user navigates to a new page)

const ErrorClear = () => {
  const location = useLocation();

  useEffect(() => {
      clearError();
  }, [location.pathname]);

  return null;

};

export default ErrorClear;
