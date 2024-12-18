"use client";
import Categories from "@/components/common/Post/Categories";
import PostContent from "@/components/common/Post/PostContent";
import FormikInput from "@/components/common/input/FormikInput";
import Loading from "@/components/common/loading/Loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";

export default function NewPostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status, data: session } = useSession();
  const router = useRouter();
  const admin = process.env.NEXT_PUBLIC_ADMIN;

  if (status === "loading") {
    return <Loading />;
  }
  if (status === "unauthenticated") {
    return <p>Your are not authenticated</p>;
  }

  if (session?.user?.email !== admin) {
    return <p>You don&#39;t have permission to access this page.</p>;
  }

  // Function to properly encode a string for URLs
  const encodeForUrl = (str: string) => {
    return encodeURIComponent(str.replace(/\s+/g, "_")).toLowerCase();
  };

  return (
    <Formik
      initialValues={{ title: "", categories: "", content: "", imageUrl: "" }}
      validationSchema={Yup.object({
        title: Yup.string()
          .matches(
            /^[a-zA-Z0-9\s,\u0980-\u09FF]+$/,
            "Title can not contain special characters",
          )
          .min(4, "Title Must be at least 4 characters")
          .max(80, "Title can not be more than 80 characters")
          .required("Title is required"),
        imageUrl: Yup.string().required(),
        categories: Yup.string().required("Category is required"),
        content: Yup.string(),
      })}
      onSubmit={async (values) => {
        try {
          setIsSubmitting(true);
          toast.loading("Please wait...");
          const response = await axios.post("/api/post", values);

          if (response.status === 201) {
            toast.dismiss();
            toast.success("Post uploaded successfully 🎉");
            const uri = response.data.title;
            const category = response.data.category;
            const encodedUri = uri ? encodeForUrl(uri) : "";
            const encodedCategory = category ? encodeForUrl(category) : "";
            setTimeout(() => {
              router.push(`/blog/category/${encodedCategory}/${encodedUri}`);
            }, 1000);
            setIsSubmitting(false);
          } else {
            toast.dismiss();
            setIsSubmitting(false);
            toast.error("Error uploading post");
          }
        } catch (error) {
          setIsSubmitting(false);
          toast.dismiss();
          toast.error("Error uploading post: ");
        }
      }}
    >
      <Form>
        <Card className="mx-1 w-full md:mx-auto md:w-10/12 lg:w-9/12">
          <CardHeader className="flex items-center justify-center">
            <CardTitle className="text-3xl">Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormikInput
              label="Title:"
              name="title"
              type="text"
              placeholder="Input Post Title"
            />
            <div className="flex flex-col gap-1.5">
              <FormikInput
                label="Featured Image:"
                name="imageUrl"
                type="text"
                placeholder="Input gdrive image id"
              />
            </div>
            <Label>Categories:</Label>
            <Field as={Categories} name="categories" />
            <div>
              <Label>Post Content:</Label>
              <PostContent />
            </div>
          </CardContent>
          <CardFooter className="mt-10">
            <Button size="lg" type="submit" disabled={isSubmitting}>
              Upload Post
            </Button>
          </CardFooter>
        </Card>
        <ToastContainer theme="dark" position="top-center" />
      </Form>
    </Formik>
  );
}
