/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [dealers, setDealers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      getDocs(collection(db, 'dealers')).then((snapshot) => {
        setDealers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [user]);

  const handleLogin = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    setLoading(true);
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResponse(data.text);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">JYB CONNECT</h1>
      {!user ? (
        <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      ) : (
        <div>
          <p>Welcome, {user.email}</p>
          
          <div className="mt-4 border p-2">
            <input value={prompt} onChange={e => setPrompt(e.target.value)} className="border p-1 w-full" placeholder="Ask AI..."/>
            <button onClick={askAI} className="bg-green-500 text-white p-1 mt-2 rounded" disabled={loading}>
              {loading ? 'Asking...' : 'Ask AI'}
            </button>
            {response && <p className="mt-2 text-gray-700">{response}</p>}
          </div>

          <h2 className="text-xl mt-4">Dealers</h2>
          <ul>
            {dealers.map((dealer) => (
              <li key={dealer.id}>{dealer.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
