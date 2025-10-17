"use client";

import { useEffect } from "react";

const ADMIN_V2_URL = "http://localhost:3002/dashboard";

export default function AdminRedirectPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = ADMIN_V2_URL;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg p-6 text-center bg-white shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Redirection vers le panneau d'administration</h1>
        <p className="text-gray-600">
          Vous allez être redirigé vers l’Admin Panel v2.
        </p>
        <p className="mt-4">
          Si la redirection ne se lance pas, {" "}
          <a href={ADMIN_V2_URL} className="text-blue-600 underline">
            cliquez ici
          </a>.
        </p>
      </div>
    </div>
  );
}
