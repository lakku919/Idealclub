import useSWR from 'swr';
import { useState } from 'react';
const fetcher = (u)=>fetch(u).then(r=>r.json());

export default function Admin(){
  const { data: me } = useSWR('/api/me', fetcher);
  const [refreshKey,setRefreshKey] = useState(0);
  const { data } = useSWR(me?.user?.role === 'admin' ? ['/api/admin/withdrawals', refreshKey] : null, fetcher);
  const withdrawals = data?.list || [];

  async function act(id, action){
    await fetch('/api/admin/withdrawals',{ method:'POST', body: JSON.stringify({ id, action }), headers:{ 'Content-Type':'application/json'}});
    setRefreshKey(k=>k+1);
  }
  async function draw(roundId){
    await fetch('/api/admin/draw', { method:'POST', body: JSON.stringify({ roundId }), headers:{ 'Content-Type':'application/json'}});
    alert('Draw executed (check logs)');
  }

  if (!me) return <div className="container"><p>Loading...</p></div>;
  if (!me.user || me.user.role !== 'admin') return <div className="container"><p>Admin only. Sign in as admin@idealclub.test</p></div>;

  return (
    <div className="container">
      <header className="header"><h1>Admin Dashboard</h1></header>
      <div className="card">
        <h3>Withdrawals</h3>
        <table className="table">
          <thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {withdrawals.map(w=>(
              <tr key={w.id}>
                <td>{w.id}</td>
                <td>{w.userId}</td>
                <td>${(w.amount/100).toFixed(2)}</td>
                <td>{w.status}</td>
                <td>
                  {w.status==='pending' && <>
                    <button className="btn" onClick={()=>act(w.id,'approve')}>Approve</button>
                    <button style={{marginLeft:6}} onClick={()=>act(w.id,'reject')}>Reject</button>
                  </>}
                  {w.status==='approved' && <button className="btn" onClick={()=>act(w.id,'pay')}>Mark Paid</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Rounds</h3>
        <RoundsPanel draw={draw} />
      </div>
    </div>
  );
}

function RoundsPanel({ draw }){
  const { data } = useSWR('/api/public/rounds', (u)=>fetch(u).then(r=>r.json()));
  const rounds = data?.rounds || [];
  return (
    <>
      {rounds.map(r=>(
        <div key={r.id} style={{marginBottom:8}}>
          <strong>{r.name}</strong> — ${(r.ticketPrice/100).toFixed(2)} — Tickets: {r._count?.tickets||0}
          <div style={{marginTop:6}}><button className="btn" onClick={()=>draw(r.id)}>Run Draw</button></div>
        </div>
      ))}
    </>
  );
}
