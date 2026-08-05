import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api/authApi";

const AuthContext = createContext(null);



export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
const token = localStorage.getItem("token");

if (savedUser && token) {
  setCurrentUser(JSON.parse(savedUser));
}
    setLoading(false);
  }, []);

 const login = async (email, password) => {
  try {
    const { data } = await loginUser({
      email,
      password,
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setCurrentUser(data.user);

    return {
      success: true,
      user: data.user,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err.response?.data?.message || "Login failed",
    };
  }
};

const signup = async (userData) => {
  try {
    await registerUser(userData);

    return await login(
      userData.email,
      userData.password
    );

  } catch (err) {
    return {
      success: false,
      error:
        err.response?.data?.message ||
        "Registration failed",
    };
  }
};

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
localStorage.removeItem("token");
  };

  const updateUser = (updatedData) => {
    const allUsers = JSON.parse(localStorage.getItem("ecom_users") || "[]");
    const idx = allUsers.findIndex((u) => u.id === currentUser.id);
    if (idx !== -1) {
      allUsers[idx] = { ...allUsers[idx], ...updatedData };
      localStorage.setItem("ecom_users", JSON.stringify(allUsers));
    }
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    localStorage.setItem("ecom_current_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
