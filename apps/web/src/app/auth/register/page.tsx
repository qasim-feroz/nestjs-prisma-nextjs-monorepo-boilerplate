'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      // Redirect to login or dashboard
      window.location.href = '/auth/login';
    }
  }

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4 p-8 max-w-md mx-auto">
      <input 
        type="text" 
        placeholder="Name (optional)" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        className="border p-2 rounded"
      />
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        className="border p-2 rounded"
        required
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        className="border p-2 rounded"
        required
      />
      <button type="submit" className="bg-black text-white p-2 rounded">Register</button>
    </form>
  );
}



