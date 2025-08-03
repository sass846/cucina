"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { db, auth } from "@/lib/firebase"
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

export default function CreateProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [picPreview, setPicPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if(!loading && !user){
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      setPicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!user) {
      setError("You must be logged in to create a profile.");
      return;
    }
    if(!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      //check for uniqueness
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username.trim()));
      const querySnapshot = await getDocs(q);
      if(!querySnapshot.empty) {
        throw new Error("This username is already taken. Please choose another.");
      }

      let photoURL = user.photoURL || ''; //use google's photo if available

      if(profilePic) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile-pictures/${user.uid}/${profilePic.name}`);
        const snapshot = await uploadBytes(storageRef, profilePic);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      //create user doc in firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username.trim(),
        email: user.email,
        bio: bio.trim(),
        photoURL: photoURL,
        createdAt: serverTimestamp(),
      });

      router.push('/');
    
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }
  if (!user) {
    // Redirect will happen in useEffect, so just return null here
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 font-['--font-heading'] text-3xl font-bold text-center">
          Create Your Profile
        </h1>
        <p className="mb-6 text-center text-sm text-text-primary/70">
          Choose a unique username and tell us a bit about yourself.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex flex-col items-center">
            <label htmlFor="profilePic" className="cursor-pointer">
              <Image
                src={picPreview || user.photoURL || `https://ui-avatars.com/api/?name=${username || 'User'}&size=128&background=F7F5F2&color=3D3D3D`}
                alt="Profile Preview"
                width={128}
                height={128}
                className="h-32 w-32 rounded-full object-cover border-4 border-border"
              />
            </label>
            <input
              type="file"
              id="profilePic"
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
            <button type="button" onClick={() => document.getElementById('profilePic')?.click()} className="mt-4 text-sm font-semibold text-accent-primary hover:underline">
              Upload Picture
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="mb-2 block text-sm font-bold">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border-border p-3 shadow-sm focus:border-accent-primary focus:ring-accent-primary"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="bio" className="mb-2 block text-sm font-bold">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-md border-border p-3 shadow-sm focus:border-accent-primary focus:ring-accent-primary"
              placeholder="A little about yourself..."
            />
          </div>

          {error && (
            <p className="mb-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-accent-primary px-4 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Profile...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}