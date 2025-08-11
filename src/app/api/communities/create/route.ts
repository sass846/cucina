import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    //verify auth
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    if (!uid) {
      return NextResponse.json(
        { error: "Unauthorized: No user id found in token" },
        { status: 401 }
      );
    }

    //parse request data
    const { name, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and Description are required " },
        { status: 400 }
      );
    }

    const db = getFirestore();

    //check unique name
    const communityRef = db.collection("communities").doc(name);
    const doc = await communityRef.get();
    if (doc.exists) {
      return NextResponse.json(
        { error: "A community with this name already exists " },
        { status: 409 }
      );
    }

    //save the community doc to firestore & add community to creator's joined
    const newCommunity = {
      id: name,
      name: name,
      description: description,
      creatorId: uid,
      createdAt: new Date(),
      memberCount: 1,
    };

    await communityRef.set(newCommunity);

    const userRef = db.collection("users").doc(uid);
    await userRef.update({
      joinedCommunities: admin.firestore.FieldValue.arrayUnion(name),
    });

    //return success response
    return NextResponse.json(
      { message: "Community created successfully", community: newCommunity },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating community: ", error);
    if (
      (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "auth/id-token-expired") ||
      (error as { code?: string }).code === "auth/augment-error"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
