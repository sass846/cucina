"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation";
import { 
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  GoogleAuthProvider
} from "firebase/auth";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if(!email){
      setError("Please enter your email.");
      setIsLoading(false);
      return;
    }
    else if(!password){
      setError("Please enter a password.");
      setIsLoading(false);
      return;
    }

    try{
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if(userCredential.user){
        await sendEmailVerification(userCredential.user);
      }

      setMessage("Account created! Please check your email to verify your account")
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try{
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-between">

      {/* <div>
      </div> */}

      <div className="w-80 mx-auto mt-10 p-8 bg-gray-950 rounded shadow">
        <p className="text-2xl font-bold mb-6 text-center">Sign Up</p>

        <form className="flex flex-col gap-4" onSubmit={handleEmailSignUp}>

        {/* email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input 
          type="text"
          name="email"
          id="email"
          placeholder="amazingchef@cucina.com"
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
          type="password"
          name="password"
          id="password"
          placeholder="" 
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* error message */}
        {error && (
          <p className="mt-6 rounded-md bg-red-100 p-3 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-6 rounded-md bg-green-100 p-3 text-center text-sm text-green-700">
            {message}
          </p>
        )}

        {/* signup button */}
        <button 
          type="submit" 
          disabled={isLoading} 
          className="bg-orange-600 text-white py-2 rounded font-semibold hover:bg-orange-700 transition disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Sign Up with Email"}
        </button>
        </form>

        <div className="flex items-center my-6">
        <div className="flex-grow h-px bg-gray-300" />
        <p className="mx-4 text-gray-500 text-sm">Or</p>
        <div className="flex-grow h-px bg-gray-300" />
        </div>
        <div className="flex justify-center">
        <button 
          aria-label="Sign up with Google" 
          className="flex items-center gap-2 border border-orange-500 px-4 py-2 rounded hover:bg-gray-100 hover:text-orange-600 transition"
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-current">
          <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z" />
          </svg> 
          Signup with Google
        </button>
        {/* <div>
          <button onClick={handleGoogleSignup} disabled={isLoading} className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-200">
            <svg className="mr-3 h-5 w-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.532 24.552c0-1.584-.14-3.128-.42-4.62H24.25v8.736h13.08c-.564 2.82-2.188 5.224-4.652 6.824v5.62h7.224c4.22-3.88 6.648-9.64 6.648-16.56z" fill="#4285F4"></path><path d="M24.25 48c6.48 0 11.92-2.144 15.896-5.824l-7.224-5.62c-2.144 1.44-4.88 2.3-8.672 2.3-6.648 0-12.28-4.472-14.288-10.432H2.61v5.824C6.566 42.424 14.78 48 24.25 48z" fill="#34A853"></path><path d="M9.962 28.776c-.488-1.44-.776-2.96-.776-4.52s.288-3.08.776-4.52V13.91H2.61C.974 17.136 0 20.72 0 24.256s.974 7.12 2.61 10.344l7.352-5.824z" fill="#FBBC05"></path><path d="M24.25 9.48c3.52 0 6.72 1.216 9.224 3.64l6.416-6.416C36.17 2.296 30.73 0 24.25 0 14.78 0 6.566 5.576 2.61 13.91l7.352 5.824c2.008-5.96 7.64-10.252 14.288-10.252z" fill="#EA4335"></path></svg>
            Sign Up with Google
          </button>
        </div> */}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-orange-600 hover:underline">
            Log In
          </Link>
        </p>
        {/* <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a rel="noopener noreferrer" href="#" className="text-blue-600 hover:underline">Sign in</a>
        </p> */}
      </div>
    </div>
  )
}