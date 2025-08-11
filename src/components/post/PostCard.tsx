"use client";

import Image from "next/image";
import Link from "next/link";

export interface PostType {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  authorUid: string;
  communityId: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  likesCount: number;
  commentsCount: number;
  // author object will be populated by the backend
  author?: {
    username: string;
    photoURL: string;
  };
}

interface PostCardProps {
  post: PostType;
}

export default function PostCard({ post }: PostCardProps) {
  const timeAgo = (timestamp: { seconds: number }) => {
    const now = new Date();
    const postDate = new Date(timestamp.seconds * 1000);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 transition hover:shadow-xl">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Link href={`/profile/${post.author?.username}`}>
            <Image
              src={post.author?.photoURL || `https://ui-avatars.com/api/?name=${post.author?.username || 'User'}`}
              alt={post.author?.username || 'Author profile picture'}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover mr-3"
            />
          </Link>
          <div>
            <Link href={`/c/${post.communityId}`} className="font-bold text-sm hover:underline">
              /c/{post.communityId}
            </Link>
            <p className="text-xs text-gray-500">
              Posted by{' '}
              <Link href={`/profile/${post.author?.username}`} className="hover:underline">
                u/{post.author?.username || '...'}
              </Link>
              {' '} | {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <h2 className="font-['--font-heading'] text-2xl font-bold mb-2">{post.title}</h2>
        <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.description}</p>
        
        {post.imageUrl && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <Image src={post.imageUrl} alt={post.title} width={800} height={600} className="w-full h-auto object-cover" />
          </div>
        )}
      </div>

      {/* TODO: update the buttons */}
      <div className="px-6 py-2 bg-gray-50 flex items-center space-x-6 text-sm font-semibold text-gray-600">
        <button className="hover:text-[--color-accent-primary]">Like ({post.likesCount})</button>
        <button className="hover:text-[--color-accent-primary]">Comment ({post.commentsCount})</button>
        <button className="hover:text-[--color-accent-primary]">Made this</button>
      </div>
    </div>
  );
}