"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import CommentsList from "./CommentList";

interface CommentFormProps {
  postId: string;
}

function CommentForm({ postId }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [added, setAdded] = useState(false);
  const { data: session } = useSession();
  const name = session?.user?.name;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!comment) {
      // Handle case where comment is empty
      return;
    }

    const payload = {
      content: comment,
      postId,
    };

    try {
      toast.loading("Please wait while we save your comment to the database.");
      const response = await fetch(`/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("Your comment has been submitted.");
        setAdded(true);
        // Handle success, reset the comment field
        setComment("");
      } else {
        // Handle error response
        toast.dismiss();
        toast.error("There was an error submitting your comment.");
        const responseData = await response.json();
        // You can show the error message from responseData
      }
    } catch (error) {
      // Handle fetch error
      console.error("Error sending comment:", error);
      // Show a generic error message to the user
    }
  };

  return (
    <div className="flex flex-col gap-4 overflow-hidden ">
      <div className="flex flex-col gap-4  rounded-lg border p-4">
        <span className="text-2xl font-semibold">Leave A Reply</span>
        {name ? (
          <div className="flex flex-col gap-6">
            <span className="items-baseline">
              <span className="pr-2 text-xl">
                You Are Logged In As{" "}
                <Link href={"/dashboard"}>
                  <span className="font-bold text-primary">{name}</span>{" "}
                </Link>
              </span>
            </span>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  placeholder="Enter your comment here"
                  value={comment}
                  className="h-28"
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></Textarea>
              </div>

              <Button type="submit">Submit</Button>
            </form>
          </div>
        ) : (
          <div className="text-xl">
            You Need To
            <Link href={"/signin"}>
              <span className="font-bold text-primary">Log In</span>
            </Link>
          </div>
        )}
      </div>
      <CommentsList postId={postId} onCommentAdded={added} />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default CommentForm;
