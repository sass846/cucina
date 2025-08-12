"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore";

export default function CreatePost() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  if(!user) return null;

  return(
    <>
      <div className="p-4 bg-white rounded-lg shadow-md mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full text-left bg-accent-primary hover:bg-amber-50 text-text-primary rounded-md p-3 transition"
        >
          What&apos;s on your mind, chef?
        </button>
      </div>

      {isModalOpen && (
        <CreatePostModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

function CreatePostModal({ onClose } : { onClose: () => void}) {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [communities, setCommunities] = useState<string[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const fetchUserCommunities = async () => {
      if(user){
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if(userDoc.exists() && userDoc.data().joinedCommunities){
          const userCommunities = userDoc.data().joinedCommunities;
          setCommunities(userCommunities);
          if(userCommunities.length>0){
            setSelectedCommunity(userCommunities[0]);
          }
        }
      }
    };
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!title.trim() || !postText.trim()) {
      setError("Please provide a title and description for your post");
      return;
    }
    if(!user) {
      setError("You must be logged in to post.");
      return;
    }

    if(!selectedCommunity){
      setError("Select a community to post in");
      return;
    }

    setIsSubmitting(false);
    setError(null);

    try {
      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', postText);
      formData.append('communityId', selectedCommunity);
      if(postImage) {
        formData.append('image', postImage);
      }

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if(!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post.');
      }

      onClose();
      router.refresh();
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

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['--font-heading'] text-2xl font-bold">Create a Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="community" className="mb-2 block text-sm font-bold">Community</label>
            <select
            name="community"
            id="community"
            value={selectedCommunity}
            onChange={(e) => {setSelectedCommunity(e.target.value)}}
            className="w-full rounded-md border-border p-3 shadow-sm focus:border-accent-primary focus:ring-accent-primary"
            >

              {communities.length>0 ? (
                communities.map(community => (
                  <option key={community} value={community}>{community}</option>
                ))
              ) : (
                <option disabled>You haven&apos;t joined any communities yet.</option>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="title" className="mb-2 block text-sm font-bold">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Perfect Sourdough Loaf"
              className="w-full rounded-md border-border p-3 shadow-sm focus:border-accent-primary focus:ring-accent-primary"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="mb-2 block text-sm font-bold">Description</label>
            <textarea
              id="description"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Share the story, recipe, or details behind your creation..."
              rows={5}
              className="w-full rounded-md border-border p-3 shadow-sm focus:border-accent-primary focus:ring-accent-primary"
            />
          </div>

          {imagePreview && (
            <div className="mt-4 relative">
              <Image src={imagePreview} alt="Image preview" width={500} height={300} className="rounded-lg object-cover w-full h-auto" />
              <button onClick={() => { setImagePreview(null); setPostImage(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">&times;</button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-accent-primary hover:underline"
            >
              Add Photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/png, image/jpeg"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-accent-primary px-6 py-2 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
           {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}