"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserProfile {
  username: string;
  photoURL: string;
}

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if(user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if(userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 shadow-md backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="font-['--font-heading'] text-2xl font-bold text-accent-primary">
              Cucina
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && userProfile ? (
              // --- Logged-in user view ---
              <>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm font-medium text-[--color-text-primary] hover:bg-gray-100"
                >
                  Log Out
                </button>
                <Link href={`/profile/${userProfile.username}`}>
                  <Image
                    src={userProfile.photoURL || `https://ui-avatars.com/api/?name=${userProfile.username || 'User'}&size=128&background=F7F5F2&color=3D3D3D`}
                    alt="Your Profile"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </Link>
              </>
            ) : (
              // --- Logged-out user view ---
              <>
                <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-[--color-text-primary] hover:bg-gray-100">
                  Log In
                </Link>
                <Link href="/signup" className="rounded-md bg-[--color-accent-primary] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}