'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log(data);
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 p-8 max-w-md mx-auto">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded"/>
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded"/>
      <button type="submit" className="bg-black text-white p-2 rounded">Login</button>
    </form>
  );
}
