"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user : User | null;
  loading : boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children : ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading }

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () : AuthContextType => {
  const context = useContext(AuthContext);
  if(context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const LoadingScreen = () => {
  return (<div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <p className="text-lg font-semibold text-orange-600">
        Loading Cucina...
      </p>
    </div>
  </div>)
}