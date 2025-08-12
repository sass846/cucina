"use client";

import { useState, useEffect, useCallback } from "react";
import PostCard, { PostType } from "@/components/post/PostCard";
import { useInView } from "react-intersection-observer";

type FetchMode = 'community' | 'homepage' | 'user_posts';

interface FeedProps {
  fetchMode: FetchMode;
  communityId?: string;
  userId?: string;
}

export default function Feed({ fetchMode, communityId, userId }: FeedProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'trending' | 'top'>('hot');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastPostCursor, setLastPostCursor] = useState<number | null>(null);

  const { ref, inView } = useInView({threshold: 0.5});
  
  const fetchPosts = useCallback(async (cursor: number | null, newSortBy: typeof sortBy) => {
    setIsLoading(true);
    const params = new URLSearchParams({
      mode: fetchMode,
      sortBy: newSortBy,
      limit: '5',
    });

    if(communityId) params.append('communityId', communityId);
    if(userId) params.append('userId', userId);
    if(cursor) params.append('cursor', cursor.toString());

    try {
      const response = await fetch(`/api/feed?${params.toString()}`);
      if(!response.ok){
        const errorText = await response.text();
        console.error('Feed fetch error: ', response.status, errorText);
        throw new Error(`Failed to fetch posts: ${response.status} ${errorText}`);
      } 

      const data = await response.json();

      setPosts(prev => cursor ? [...prev, ...data.posts] : data.posts);
      const hasNewPosts = data.posts.length > 0;
      setHasMore(hasNewPosts);
      setLastPostCursor(hasNewPosts ? data.nextCursor : null);
    } catch(error) {
      console.error(error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMode, communityId, userId]);

  useEffect(() => {
    setPosts([]);
    setLastPostCursor(null);
    setHasMore(true);
    fetchPosts(null, sortBy);
  }, [sortBy, fetchPosts]);

  useEffect(() => {
    if(inView && !isLoading && hasMore) {
      fetchPosts(lastPostCursor, sortBy);
    }
  }, [inView, isLoading, hasMore, lastPostCursor, sortBy, fetchPosts]);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-2 mb-6 flex items-center space-x-2">
        <button 
          onClick={() => setSortBy('hot')}
          className={`px-4 py-2 rounded-md font-bold text-sm transition ${sortBy === 'hot' ? 'bg-accent-primary text-white' : 'hover:bg-gray-100'}`}
        >
          Hot
        </button>
        <button 
          onClick={() => setSortBy('trending')}
          className={`px-4 py-2 rounded-md font-bold text-sm transition ${sortBy === 'trending' ? 'bg-accent-primary text-white' : 'hover:bg-gray-100'}`}
        >
          Trending
        </button>
        <button 
          onClick={() => setSortBy('new')}
          className={`px-4 py-2 rounded-md font-bold text-sm transition ${sortBy === 'new' ? 'bg-accent-primary text-white' : 'hover:bg-gray-100'}`}
        >
          New
        </button>
        <button 
          onClick={() => setSortBy('top')}
          className={`px-4 py-2 rounded-md font-bold text-sm transition ${sortBy === 'top' ? 'bg-accent-primary text-white' : 'hover:bg-gray-100'}`}
        >
          Top
        </button>
      </div>

      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* This invisible div at the end of the list will trigger the infinite scroll */}
      {hasMore && <div ref={ref} />}

      {isLoading && <p className="text-center py-4">Loading more posts...</p>}
      {!hasMore && posts.length > 0 && <p className="text-center py-4 text-gray-500">You&apos;ve reached the end!</p>}
      {!isLoading && !hasMore && posts.length === 0 && <p className="text-center py-4 text-gray-500">No posts here yet. Be the first!</p>}
    </div>
  );
}