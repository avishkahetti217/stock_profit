import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation.jsx';
import { Home } from './pages/Home.jsx';
import { Portfolio } from './pages/Portfolio.jsx';

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Stock Profit Tracker</h1>
        <Navigation />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


