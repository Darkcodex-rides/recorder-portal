
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

function isTokenValid(token) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(
      atob(parts[1])
    );

    if (!payload.exp) {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  } catch (error) {
    console.error(
      "Invalid JWT token:",
      error
    );

    return false;
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] =
    useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user");

    if (
      storedToken &&
      isTokenValid(storedToken)
    ) {
      setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error(
            "Invalid stored user data"
          );

          localStorage.removeItem("user");
        }
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    }

    setIsInitializing(false);
  }, []);

  // Automatically logout when backend returns 401
  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn(
        "Authentication expired or is invalid. Logging out."
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    };

    window.addEventListener(
      "auth:expired",
      handleAuthExpired
    );

    return () => {
      window.removeEventListener(
        "auth:expired",
        handleAuthExpired
      );
    };
  }, []);

  const login = (loginToken, loginUser) => {
    localStorage.setItem(
      "token",
      loginToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(loginUser)
    );

    setToken(loginToken);
    setUser(loginUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
