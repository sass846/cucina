import Feed from "@/components/feed/Feed";
import Navbar from "@/components/layout/Navbar";
import CreatePost from "@/components/post/CreatePost";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex w-full">
      <main className="flex-grow p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <CreatePost/>
          <Feed fetchMode="homepage"/>
        </div>
      </main>
    </div>
  );
}
