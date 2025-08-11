import admin from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";
import Feed from '@/components/feed/Feed'

interface CommunityPageProps {
  params : {
    communityId : string;
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { communityId } = params;
  const db = admin.firestore();

  const communityRef = db.collection('communities').doc(communityId);
  const communityDoc = await communityRef.get();

  if(!communityDoc.exists){
    notFound();
  }

  const communityData = communityDoc.data();

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      {/* Community Header */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
        <h1 className="font-['--font-heading'] text-4xl font-bold">
          {communityData?.name}
        </h1>
        <p className="mt-2 text-[--color-text-primary]/80">
          {communityData?.description}
        </p>
        {/* We can add a Join/Leave button here later */}
      </div>

      {/* Placeholder for the interactive feed component */}
      <Feed fetchMode="community" communityId={communityId} />
    </div>
  )
}