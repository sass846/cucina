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

  const loggedInView = (
    <>
      <div className="flex flex-col space-y-2">
        <Link href="/" className="font-bold text-lg p-3 rounded-lg hover:bg-gray-100 transition">Home</Link>
        <Link href="/c/create" className="p-3 rounded-lg bg-accent-primary hover:opacity-90 transition">Create Community</Link>
      </div>
      <div className="mt-6">
        <h3 className="px-3 mb-2 text-xs font-bold uppercase text-gray-500">Your Communities</h3>
        <div className="flex flex-col">
          {profile?.joinedCommunities?.map(communityId => (
            <Link key={communityId} href={`/c/${communityId}`} className="p-3 rounded-lg hover:bg-gray-100 transition text-sm">
              /c/{communityId}
            </Link>
          ))}
           {(!profile?.joinedCommunities || profile.joinedCommunities.length === 0) && (
            <p className="px-3 text-sm text-gray-400">Join a community to see it here!</p>
           )}
        </div>
      </div>
    </>
  );

  const loggedOutView = (
    <div className="flex flex-col space-y-2">
       <Link href="/login" className="font-bold text-lg p-3 rounded-lg hover:bg-gray-100 transition">Log In</Link>
       <Link href="/signup" className="rounded-lg bg-accent-primary px-4 py-3 text-center font-bold text-white transition hover:opacity-90">
          Sign Up
        </Link>
    </div>
  );

  return (
    // This sidebar will be hidden on mobile and visible on desktop
    <aside className="hidden md:block w-64 flex-shrink-0 border-r border-border p-4">
      <nav className="sticky top-20 flex flex-col">
        {user ? loggedInView : loggedOutView}
      </nav>
    </aside>
  );
}
