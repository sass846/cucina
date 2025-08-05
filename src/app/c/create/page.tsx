"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { auth } from "@/lib/firebase"

export default function CreateCommunityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //redirect if user not logged in
  useEffect(() => {
    if(!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //only letters numbers and underscores
    const formattedName = e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase();
    setName(formattedName);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!name.trim() || !description.trim()){
      setError("Please provide a name and description");
      return;
    }

    if(!user){
      setError("You must be logged in to create a community");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // console.log({
    //   name: name,
    //   description: description,
    //   creatorId: user.uid,
    // });

    // setTimeout(() => {
    //   setIsSubmitting(false);
    // }, 1000);

    try{
      //get token
      const token = await user.getIdToken();
  
      //make api call
      const response = await fetch('api/communities/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      //on success redirect to new community page
      if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create community.');
      }

      router.push(`/c/${name}`);
    } catch (err: unknown){
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

    if(loading || !user){
      return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    return (
      <div className="mx-auto max-w-2xl py-12 px-4">
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 font-['--font-heading'] text-3xl font-bold">
            Create a Community
          </h1>
          <p className="mb-8 text-sm text-[--color-text-primary]/70">
            Start a new space for chefs and foodies to connect.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block text-sm font-bold">
                Community Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g., sourdough_bakers"
                className="w-full rounded-md border-[--color-border] p-3 shadow-sm focus:border-[--color-accent-primary] focus:ring-[--color-accent-primary]"
                required
                maxLength={25}
              />
              <p className="mt-1 text-xs text-[--color-text-primary]/60">Lowercase letters, numbers, and underscores only. This will be part of the URL.</p>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="mb-2 block text-sm font-bold">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-md border-[--color-border] p-3 shadow-sm focus:border-[--color-accent-primary] focus:ring-[--color-accent-primary]"
                placeholder="What is this community about?"
                required
              />
            </div>

            {error && (
              <p className="mb-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-[--color-accent-primary] px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Community'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
}