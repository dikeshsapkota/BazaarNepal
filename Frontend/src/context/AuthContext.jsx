import { createContext, useContext, useState, useEffect } from "react";
import { SEED_SELLERS, SEED_CUSTOMERS } from "../data/seedData";

const AuthContext = createContext(null);

function initializeUsers() {
  const stored = localStorage.getItem("ecom_users");
  if (!stored) {
    const initialUsers = [...SEED_SELLERS, ...SEED_CUSTOMERS];
    localStorage.setItem("ecom_users", JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(stored);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allUsers = initializeUsers();
    setUsers(allUsers);
    const savedUser = localStorage.getItem("ecom_current_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password, role) => {
    const allUsers = JSON.parse(localStorage.getItem("ecom_users") || "[]");
    const user = allUsers.find(
      (u) => u.email === email && u.password === btoa(password) && u.role === role
    );
    if (user) {
      const safeUser = { ...user };
      delete safeUser.password;
      setCurrentUser(safeUser);
      localStorage.setItem("ecom_current_user", JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, error: "Invalid email, password, or role." };
  };

  const signup = (userData) => {
    const allUsers = JSON.parse(localStorage.getItem("ecom_users") || "[]");
    const exists = allUsers.find((u) => u.email === userData.email);
    if (exists) {
      return { success: false, error: "Email already registered." };
    }
    const newUser = {
      ...userData,
      id: userData.role + "_" + Date.now(),
      password: btoa(userData.password),
      avatar: userData.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      joinedDate: new Date().toISOString().split("T")[0],
    };
    const updated = [...allUsers, newUser];
    localStorage.setItem("ecom_users", JSON.stringify(updated));
    setUsers(updated);

    const safeUser = { ...newUser };
    delete safeUser.password;
    setCurrentUser(safeUser);
    localStorage.setItem("ecom_current_user", JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ecom_current_user");
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
