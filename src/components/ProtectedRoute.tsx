import {
  Navigate
}
from "react-router-dom";

import type {
  ReactNode
}
from "react";

import {
  useAuth
}
from "../context/AuthContext";

interface Props {

  children: ReactNode;

  role?: string;
}

function ProtectedRoute({
  children,
  role
}: Props)
{
  const { user } =
    useAuth();

  if (!user)
  {
    return (
      <Navigate
        to="/"
      />
    );
  }

  if (
    role &&
    user.role?.toLowerCase() !== role.toLowerCase()
  )
  {
    return (
      <Navigate
        to="/"
      />
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;