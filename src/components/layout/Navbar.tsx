"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface UserProfile {
  joinedCommunities?: string[];
}

export default function Navbar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if(user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if(userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          setProfile(null);
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  const loggedinLinks = (
    <>
      <Link href="/" className="nav-link">Home</Link>
      <Link href="/c/create" className="nav-link">Create Community</Link>
      <div className="mt-4">
        <h3 className="px-4 mb-2 text-xs font-bold uppercase text-gray-500">Your Communities</h3>
        <div className="flex flex-col">
          {profile?.joinedCommunities?.map(communityId => (
            <Link key={communityId} href={`/c/${communityId}`} className="community-link">
              {communityId}
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  const loggedOutLinks = (
    <div className="flex flex-col space-y-2">
       <Link href="/login" className="nav-link">Log In</Link>
       <Link href="/signup" className="rounded-md bg-[--color-accent-primary] px-4 py-2 text-center font-bold text-white transition hover:opacity-90">
          Sign Up
        </Link>
    </div>
  );

  return (
    <>
      {/* for desktop */}
      <aside className="hidden md:block w-64 flex-shrink-0 border-r border-border">
        <nav className="flex flex-col">
          {user ? loggedinLinks : loggedOutLinks}
        </nav>
      </aside>

      {/* mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex justify-around items-center h-16">
        {user ? (
          <>
            <Link href="/" className="mobile-nav-link">Home</Link>
            <Link href="/c/create" className="mobile-nav-link">Create</Link>
            <button className="mobile-nav-link">Communities</button>
            <Link href="/profile/me" className="mobile-nav-link">Profile</Link>
          </>
        ) : (
          <>
            <Link href="/login" className="mobile-nav-link">Log In</Link>
            <Link href="/signup" className="mobile-nav-link font-bold text-[--color-accent-primary]">Sign Up</Link>
          </>
        )}
      </nav>

      <div className="pb-16 md:pb-0"/>
    </>
    
  )


}