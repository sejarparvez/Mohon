"use client";
import SigninInput from "@/components/common/input/SigninInput";
import LoginValidation from "@/components/validation/LoginValidation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleEmailChange = (e: { target: { value: any } }) => {
    setData((prevData) => ({
      ...prevData,
      email: e.target.value,
    }));
  };
  const handlePasswordChange = (e: { target: { value: any } }) => {
    setData((prevData) => ({
      ...prevData,
      password: e.target.value,
    }));
  };

  const loginUser = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const errors = LoginValidation({
      email: data.email,
      password: data.password,
    });
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      const loadingToastId = toast.loading("Logging in...", {
        autoClose: false,
        theme: "dark",
      });

      const response = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      toast.dismiss(loadingToastId);

      if (response?.error) {
        toast.error("Sign-in failed. Please check your email and password.");
      } else {
        toast.success("Successful sign-in");

        setTimeout(() => {
          router.back();
        }, 2000);
      }

      return response;
    } catch (error) {
      console.error("Sign-in error:", error);
      throw error;
    }
  };

  if (session) {
    return (
      <div>
        You are already logged in. Go to{" "}
        <Link href={"/dashboard"} className="font-bold">
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-20 md:mt-32 lg:mt-48 ">
      <div className="grid md:grid-cols-5 grid-cols-1 rounded-2xl justify-around shadow-2xl md:w-10/12 w-11/12">
        <div className="col-span-3 p-6 bg-blue-950 md:rounded-l-2xl">
          <section className="flex gap-4 items-center justify-center flex-col my-8">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-center text-primary-200">
              Log in to Continue
            </h1>
            <span className="h-1 w-20 rounded-full bg-primary-200 flex"></span>

            <form
              className="flex flex-col gap-8 my-6 w-full md:w-2/3 lg:w-1/2"
              onSubmit={loginUser}
            >
              <SigninInput
                label="Input Your Email"
                id="email"
                type="email"
                error={errors.email}
                onChange={handleEmailChange}
                value={data.email}
              />
              <div>
                <SigninInput
                  label="Input Your Password"
                  id="password"
                  type="password"
                  error={errors.password}
                  onChange={handlePasswordChange}
                  value={data.password}
                />
                <div className="flex items-center justify-end">
                  <Link
                    href="/resetpassword"
                    className="text-primary-200 text-sm"
                  >
                    Forget Password
                  </Link>
                </div>
              </div>
              <button className="border border-primary-200 text-primary-200 hover:bg-gray-950 bg-black px-4 py-2 rounded-lg">
                Log In
              </button>
              <p className="md:hidden text-center">
                Don&apos;t have an account?
                <Link href={"/signup"} className="text-xl font-bold pl-2">
                  Register
                </Link>
              </p>
            </form>
          </section>
        </div>
        <div className="hidden md:flex bg-gray-800 col-span-2  md:rounded-r-2xl gap-4 p-16 items-center justify-center text-center flex-col">
          <span className="font-bold text-3xl text-lightgray-100">
            Hi, There!
          </span>
          <span className="h-1 w-20 rounded-full bg-lightgray-100 flex"></span>
          <span className="text-darkgray-100 my-4">
            New Here? Let&#39;s create a free account to start your journey with
            us.
          </span>
          <Link href="/signup">
            <button className="border border-primary-200 text-primary-200 hover:bg-gray-950 bg-black px-4 py-2 rounded-lg">
              Registration
            </button>
          </Link>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}