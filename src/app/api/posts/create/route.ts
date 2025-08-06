import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export async function POST(request: Request) {
  try {
    // VERIFY USER AUTHENTICATION FROM TOKEN IN REQUEST HEADER
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

    //PARSE FORM DATA
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const communityId = formData.get("communityId") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !description || !communityId) {
      return NextResponse.json(
        { error: "Title, Description and community are required." },
        { status: 400 }
      );
    }

    //IF THERE IS AN IMAGE UPLOAD IT TO FIRESTORE AND GET PUBLIC URL
    let imageUrl = "";
    if (imageFile) {
      const bucket = getStorage().bucket();
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filePath = `post-images/${uid}/${Date.now()}-${imageFile.name}`;
      const file = bucket.file(filePath);

      await file.save(buffer, {
        metadata: { contentType: imageFile.type },
      });

      imageUrl = file.publicUrl();
    }

    //save the new post document to firestore
    const db = getFirestore();
    const postRef = db.collection("posts").doc();

    const newPost = {
      id: postRef.id,
      title,
      description,
      imageUrl,
      authorUid: uid,
      communityId,
      createdAt: new Date(),
      likesCount: 0,
      commentCounts: 0,
      peakHotnessScore: 0,
    };

    await postRef.set(newPost);

    //return success response
    return NextResponse.json(
      { message: "Post successfully created", post: newPost },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating post: ", error);
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
