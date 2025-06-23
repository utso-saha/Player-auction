import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function Login() {
  const {
    loginWithRedirect,
    isAuthenticated,
    user,
    isLoading,
  } = useAuth0();

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="p-10 rounded-xl w-96 font-kanit text-center flex flex-col items-start">
        <h1 className="text-4xl font-rubik font-bold text-white mb-6">
          {isAuthenticated ? `Welcome, ${user?.name}!` : "Sign In"}
        </h1>

        {!isAuthenticated && !isLoading && (
          <button
            onClick={() => loginWithRedirect()}
            className="flex items-center gap-4 justify-center text-white font-rubik px-6 py-3 rounded shadow hover:bg-white hover:text-black w-full font-semibold mb-2"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
