import { useEffect, useState } from 'react';
import Router from 'next/router';
export default function NotesPage(){
  const [notes,setNotes]=useState([]);
  const [title,setTitle]=useState('');
  const [content,setContent]=useState('');
  const [limitReached,setLimitReached]=useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  async function fetchNotes(){
    const res = await fetch('/api/notes', { headers: { Authorization: token } });
    if (res.status===401) { localStorage.removeItem('token'); Router.push('/'); return; }
    const data = await res.json();
    setNotes(data.notes || []);
    setLimitReached(data.limitReached || false);
  }
  useEffect(()=>{ fetchNotes() }, []);
  async function createNote(e){
    e.preventDefault();
    const res = await fetch('/api/notes', {
      method:'POST',
      headers:{'Content-Type':'application/json', Authorization: token},
      body: JSON.stringify({ title, content })
    });
    if (res.ok) { setTitle(''); setContent(''); fetchNotes(); }
    else alert((await res.json()).error);
  }
  async function del(id){
    if (!confirm('Delete?')) return;
    await fetch('/api/notes/'+id, { method:'DELETE', headers:{ Authorization: token } });
    fetchNotes();
  }
  async function upgrade(){
    const slug = (await fetch('/api/auth/me', { headers:{ Authorization: token } }).then(r=>r.json())).tenant;
    await fetch('/api/tenants/'+slug+'/upgrade', { method:'POST', headers:{ Authorization: token } });
    fetchNotes();
  }
  return (
    <div>
      <div className="header">
        <h1>Notes</h1>
        <button onClick={()=>{ localStorage.removeItem('token'); Router.push('/'); }}>Logout</button>
      </div>
      <form onSubmit={createNote}>
        <input value={title} placeholder="Title" onChange={e=>setTitle(e.target.value)} />
        <textarea value={content} placeholder="Content" onChange={e=>setContent(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      {limitReached && <div style={{color:'red'}}>Free plan limit reached (3 notes). <button onClick={upgrade}>Upgrade to Pro</button></div>}
      <h2>Your notes</h2>
      {notes.map(n=>(
        <div className="note" key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.content}</p>
          <button onClick={()=>del(n.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
