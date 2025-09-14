import { useState } from 'react';
import Router from 'next/router';

export default function LoginPage() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  async function login(e){
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email, password})
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      Router.push('/notes');
    } else setErr(data.error || 'Login failed');
  }
  return (
    <div>
      <h1>Notes SaaS — Login</h1>
      <form onSubmit={login}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} type="password"/>
        <button type="submit">Login</button>
      </form>
      <p style={{color:'red'}}>{err}</p>
      <p>Test accounts: admin@acme.test, user@acme.test, admin@globex.test, user@globex.test — password: password</p>
    </div>
  )
}
