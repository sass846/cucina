"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface JoinLeaveButtonProps {
  communityId: string;
}

export default function JoinLeaveButton({ communityId }: JoinLeaveButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      if(!user) {
        setIsLoading(false);
        return;
      }
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if(userDoc.exists()) {
        const joined = userDoc.data().joinedCommunities || [];
        setIsMember(joined.includes(communityId));
      }
      setIsLoading(false);
    }
    checkMembership();
  },[user, communityId]);

  const handleToggleMembership = async() => {
    if(!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    const action = isMember ? 'leave' : 'join';

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if(!response.ok) {
        throw new Error("Failed to update membership");
      }

      setIsMember(!isMember);
      router.refresh();
    } catch(error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if(!user) return null;

  return (
    <button
      onClick={handleToggleMembership}
      disabled={isLoading}
      className={`rounded-full px-4 py-2 font-bold text-sm transition ${
        isMember
        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        : 'bg-accent-primary text-white hover:opacity-90'
      } disabled:opacity-50`}
    >
      {isLoading ?  '...' : (isMember ? 'Joined' : 'Join')}
    </button>
  );
}