import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Home from './components/Home';
import AddCustomer from './components/AddCustomer';
import CustomerDetails from './components/CustomerDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-customer" element={<AddCustomer />} />
        <Route path="/add-customer/:id" element={<CustomerDetails />} />
      </Routes>
    </Router>
  );
}

// <Route path="/customers" element={<div>Customers</div>} />
// <Route path="/customers/:id" element={<div>Customer Details</div>} />
export default App;
