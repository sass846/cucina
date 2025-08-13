import { NextResponse } from "next/server";
import { db, admin } from "@/lib/firebaseAdmin";
// import { getFirestore } from "firebase-admin/firestore";

export async function GET(request: Request) {
  try {
    //parse request
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const sortBy = searchParams.get("sortBy");
    const limit = parseInt(searchParams.get("limit") || "10");
    const cursor = searchParams.get("cursor");

    //connect to db and filter query
    // const db = getFirestore();
    let postsQuery: admin.firestore.Query = db.collection("posts");

    if (mode === "community") {
      const communityId = searchParams.get("communityId");
      if (!communityId)
        return NextResponse.json(
          { error: "CommunityId is required" },
          { status: 400 }
        );
      postsQuery = postsQuery.where("communityId", "==", communityId);
    }

    switch (sortBy) {
      case "new":
        postsQuery = postsQuery.orderBy("createdAt", "desc");
        break;
      case "hot":
        if (mode === "community") {
          postsQuery = postsQuery.orderBy("createdAt", "desc");
        } else {
          postsQuery = postsQuery
            .orderBy("peakHotnessScore", "desc")
            .orderBy("createdAt", "desc");
        }
        break;
      case "trending":
        //TODO: UPDATE IT WITH CURRENT HOTNESS SCORE
        if (mode === "community") {
          postsQuery = postsQuery.orderBy("createdAt", "desc");
        } else {
          postsQuery = postsQuery
            .orderBy("peakHotnessScore", "desc")
            .orderBy("createdAt", "desc");
        }
        break;
      case "top":
        if (mode === "community") {
          postsQuery = postsQuery.orderBy("createdAt", "desc");
        } else {
          postsQuery = postsQuery
            .orderBy("likesCount", "desc")
            .orderBy("createdAt", "desc");
        }
        break;
      default:
        //TODO: DEFAULT IS HOT
        if (mode === "community") {
          postsQuery = postsQuery.orderBy("createdAt", "desc");
        } else {
          postsQuery = postsQuery
            .orderBy("peakHotnessScore", "desc")
            .orderBy("createdAt", "desc");
        }
        break;
    }

    if (cursor) {
      postsQuery = postsQuery.startAfter(new Date(parseInt(cursor)));
    }

    postsQuery = postsQuery.limit(limit);

    const postSnapshot = await postsQuery.get();
    const posts = postSnapshot.docs.map((doc) => doc.data());

    if (posts.length == 0) {
      return NextResponse.json({ posts: [], nextCursor: null });
    }

    const authorUids = [...new Set(posts.map((post) => post.authorUid))];
    const usersRef = db.collection("users");
    const userSnapshot = await usersRef.where("uid", "in", authorUids).get();
    const authors = userSnapshot.docs.reduce<
      Record<string, { username: string; photoURL: string }>
    >((acc, doc) => {
      const data = doc.data();
      acc[data.uid as string] = {
        username: data.username,
        photoURL: data.photoURL,
      };
      return acc;
    }, {} as { [key: string]: { username: string; photoURL: string } });

    const postsWithAuthors = posts.map((post) => ({
      ...post,
      author: authors[post.authorUid] || null,
    }));

    const lastDoc = postSnapshot.docs[postSnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.data().createdAt.toMillis() : null;

    return NextResponse.json({ posts: postsWithAuthors, nextCursor });
  } catch (error) {
    console.error("Error fetching feed: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
