import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/Main';
import Clients from './components/Clients';
import Dashboard from './components/Dashboard';
import DiscountRules from './components/Discounts';
import NegRequests from './components/NegRequests';
import Bookings from './components/Bookings';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/dashboard/clients" element={<Clients />} />
          <Route path="/dashboard/discount-rules" element={<DiscountRules />} />
          <Route path="/dashboard/negotiation-requests" element={<NegRequests />} />
          <Route path="/dashboard/bookings" element={<Bookings/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
