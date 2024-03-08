import { useEffect, useState } from 'react';
import './style/theme.css';

function App() {
  const [userAccount, setUserAccount] = useState(null);

  async function requestAccount() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask not detected. Please install MetaMask.');
    }
  }

  useEffect(() => {
    if (!userAccount) {
      requestAccount();
    }
  }, [userAccount]);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">Welcome to the Ticketing DApp</h1>
        <p>User Account: {userAccount}</p>
        {/* Example button for registration */}
        <button className="button" onClick={() => {}}>Register</button>
      </header>
      <div className="container">
        {/* Additional UI components go here */}
      </div>
    </div>
  );
}

export default App;
