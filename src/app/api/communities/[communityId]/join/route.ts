import { NextResponse } from "next/server";
import { db, admin } from "@/lib/firebaseAdmin";

interface Params {
  params: { communityId: string };
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { communityId } = await params;

    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // const db = getFirestore();
    const communityRef = db.collection("communities").doc(communityId);
    const userRef = db.collection("users").doc(uid);

    // use a transaction to update both docs
    const { action } = await request.json();

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User doc not found.");
      }

      const joinedCommunities = userDoc.data()?.joinedCommunities || [];
      const isMember = joinedCommunities.includes(communityId);

      if (action === "join" && !isMember) {
        transaction.update(userRef, {
          joinedCommunities: admin.firestore.FieldValue.arrayUnion(communityId),
        });
        transaction.update(communityRef, {
          memberCount: admin.firestore.FieldValue.increment(1),
        });
      } else if (action === "leave" && isMember) {
        transaction.update(userRef, {
          joinedCommunities:
            admin.firestore.FieldValue.arrayRemove(communityId),
        });
        transaction.update(communityRef, {
          memberCount: admin.firestore.FieldValue.increment(-1),
        });
      }
    });

    return NextResponse.json(
      { message: `Successfully ${action}ed community` },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error joining/leaving community:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
