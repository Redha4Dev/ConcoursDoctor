"use client"
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const Dashbaord = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const checkAuth = async () => {
      try {
        await api.get("/api/v1/auth/me"); // cookie sent automatically
        setLoading(false);
      } catch (err) {
        router.push("/login/admin"); // redirect if not authenticated
      }
    };
  const handleLogout = async (e: React.FormEvent) => {
      e.preventDefault();
  

  
      try {
        await api.post("/api/v1/auth/logout", {}, { withCredentials: true });
        checkAuth();
        
      } catch (err: any) {
        setError(err?.response?.data?.message || "Invalid email or password");
      }
  
      setLoading(false);
    };
  

  const router = useRouter();

  useEffect(() => {
    

    checkAuth();
  }, [router]);
  return (
    <button onClick={handleLogout} className='bg-white'>Logout</button>
  )
}

export default Dashbaord