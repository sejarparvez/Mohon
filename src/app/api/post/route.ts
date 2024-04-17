import checkIfImageExists from "@/components/helper/backEnd/ImageCheck";
import { Prisma } from "@/components/helper/backEnd/Prisma";
import storage from "@/utils/firebaseConfig";
import { deleteObject, ref } from "firebase/storage";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;
const admin = process.env.NEXT_PUBLIC_ADMIN;

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return new NextResponse("Your are not authenticated");
    }
    if (token.email !== admin) {
      return new NextResponse("Only admin has access to this.");
    }

    const data = await req.json();

    if (!data.title || !data.imageUrl || !data.categories) {
      return new NextResponse("Missing title, imageId or categories", {
        status: 400,
      });
    }

    // Create a new post using Prisma

    const newImageUrl =
      "http://drive.google.com/uc?export=view&id=" + data.imageUrl;
    const newPost = await Prisma.post.create({
      data: {
        title: data.title,
        coverImage: newImageUrl,
        category: data.categories,
        content: data.content,
        author: { connect: { id: token.sub } },
      },
    });

    return new NextResponse(JSON.stringify(newPost), { status: 201 });
  } catch (error) {
    return new NextResponse("An error occurred", { status: 500 });
  }
}

export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return new NextResponse("Your are not authenticated");
    }
    if (token.email !== admin) {
      return new NextResponse("Only admin has access to this.");
    }

    const data = await req.json();
    if (!data.title || !data.imageUrl || !data.categories || !data.id) {
      return new NextResponse("Missing title, imageId or categories", {
        status: 400,
      });
    }

    const updatedPost = await Prisma.post.update({
      where: { id: data.id },
      data: {
        title: data.title,
        category: data.categories,
        coverImage: data.coverImage,
        content: data.content,
      },
    });

    return new NextResponse(JSON.stringify(updatedPost), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse("An error occurred", { status: 500 });
  }
}

export async function DELETE(req: NextRequest, res: NextResponse) {
  try {
    // Step 1: Authenticate the user
    const token = await getToken({ req, secret });
    const userId = token?.sub;

    if (!token || !userId) {
      // User is not authenticated
      return new NextResponse("User not authenticated", { status: 401 });
    }

    const search = req.nextUrl.searchParams;
    const postId = search.get("postId");

    if (!postId) {
      return new NextResponse("Post not found", { status: 404 });
    }
    // Step 2: Fetch the post details
    const post = await Prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        author: {
          select: {
            id: true,
          },
        },
        coverImage: true,
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const authorId = post.author.id;

    // Step 3: Check authorization
    if (userId !== authorId) {
      return new NextResponse(
        "Unauthorized: You can only delete your own posts",
        { status: 401 },
      );
    }

    // Step 4: Delete associated comments first
    await Prisma.comment.deleteMany({
      where: {
        postId: postId,
      },
    });

    // Step 5: Delete associated Image

    if (await checkIfImageExists(post.coverImage)) {
      const storageRefToDelete = ref(storage, post.coverImage);
      await deleteObject(storageRefToDelete);
    }

    // Step 6: Delete the post
    const deletedPost = await Prisma.post.delete({
      where: {
        id: postId,
      },
    });

    if (deletedPost) {
      return new NextResponse("Post deleted successfully");
    } else {
      return new NextResponse("Post not found", { status: 404 });
    }
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
