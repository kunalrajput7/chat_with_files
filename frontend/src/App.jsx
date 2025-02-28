// App.jsx (simplified snippet)
import  { useEffect, useState } from 'react';
import { auth } from './firebase';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage'; // your existing app (with Navbar, PdfList, ChatArea, etc.)

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return user ? <MainPage /> : <AuthPage />;
}

export default App;
