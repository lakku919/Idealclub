import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url)=>fetch(url).then(r=>r.json());

export default function Home(){
  const { data } = useSWR('/api/me', fetcher);
  const user = data?.user;
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [regEmail,setRegEmail] = useState('');
  const [regPw,setRegPw] = useState('');
  const [amount,setAmount] = useState(1000);

  async function login(e){
    e.preventDefault();
    await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password: pw }), headers:{ 'Content-Type':'application/json'}});
    location.reload();
  }
  async function register(e){
    e.preventDefault();
    await fetch('/api/auth/register', { method:'POST', body: JSON.stringify({ email: regEmail, password: regPw }), headers:{ 'Content-Type':'application/json'}});
    location.reload();
  }
  async function logout(){ await fetch('/api/auth/logout', { method:'POST' }); location.reload(); }
  async function deposit(){
    const res = await fetch('/api/deposit',{ method:'POST', body: JSON.stringify({ amountCents: Number(amount) }), headers:{ 'Content-Type':'application/json'}});
    const j = await res.json();
    if (j.simulated) { alert('Simulated deposit completed'); location.reload(); return; }
    // if Stripe flow, return client secret and handle on client side (not implemented here)
    alert('Payment created (clientSecret returned). For full Stripe Checkout integrate on frontend.');
  }
  async function buyTicket(roundId){
    await fetch('/api/buy-ticket', { method:'POST', body: JSON.stringify({ roundId, qty: 1 }), headers:{ 'Content-Type':'application/json'}});
    alert('Bought 1 ticket (if balance sufficient)');
    location.reload();
  }
  async function requestWithdraw(){
    const am = prompt('Enter amount in cents (e.g. 500 = $5)');
    if (!am) return;
    await fetch('/api/withdraw', { method:'POST', body: JSON.stringify({ amountCents: Number(am) }), headers:{ 'Content-Type':'application/json'}});
    alert('Withdrawal request created');
  }

  return (
    <div className="container">
      <header className="header">
        <h1>idealclub (Demo)</h1>
        <div>
          {user ? (<>
            <small>{user.email} — Balance: ${(user.balance/100).toFixed(2)}</small>
            <button onClick={logout} className="btn" style={{marginLeft:10}}>Logout</button>
          </>) : (
            <small>Not signed in</small>
          )}
        </div>
      </header>

      <div className="card">
        <h3>Account</h3>
        {user ? (
          <>
            <p>Welcome, {user.email}</p>
            <p>Balance: ${(user.balance/100).toFixed(2)}</p>
            <button className="btn" onClick={()=>requestWithdraw()}>Request Withdrawal</button>
          </>
        ) : (
          <>
            <form onSubmit={login}>
              <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <input placeholder="Password" type="password" value={pw} onChange={(e)=>setPw(e.target.value)} />
              <button className="btn">Login</button>
            </form>
            <hr/>
            <form onSubmit={register}>
              <input placeholder="Email" value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} />
              <input placeholder="Password" type="password" value={regPw} onChange={(e)=>setRegPw(e.target.value)} />
              <button className="btn">Register</button>
            </form>
          </>
        )}
      </div>

      <div className="card">
        <h3>Buy Credits (Demo)</h3>
        <p>Enter amount in cents (e.g. 1000 = $10). If STRIPE is configured, it will create PaymentIntent (frontend for Stripe not implemented here). Otherwise the deposit is simulated.</p>
        <input value={amount} onChange={(e)=>setAmount(e.target.value)} />
        <button className="btn" onClick={deposit}>Add Credits</button>
      </div>

      <LotterySection buyTicket={buyTicket} />

      <Footer />
    </div>
  );
}

function LotterySection({ buyTicket }){
  const { data } = useSWR('/api/public/rounds', (url)=>fetch(url).then(r=>r.json()));
  const rounds = data?.rounds || [];
  return (
    <div className="card">
      <h3>Lottery Rounds</h3>
      {rounds.map(r => (
        <div key={r.id} style={{marginBottom:8}}>
          <strong>{r.name}</strong><br/>
          Price: ${(r.ticketPrice/100).toFixed(2)} — Tickets sold: {r._count?.tickets || 0}
          <div style={{marginTop:6}}>
            <button className="btn" onClick={()=>buyTicket(r.id)}>Buy 1 ticket</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Footer(){
  return <footer style={{marginTop:20}}><small>Demo site. Do not use real money until verified.</small></footer>;
}
