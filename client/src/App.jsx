import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Settings from './pages/Settings'
import Expenses from './pages/Expenses'
import DashboardWrapper from './components/DashboardWrapper'

function App() {
  return (
    <DashboardWrapper>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/expenses" element={<Expenses />} />
      </Routes>
    </DashboardWrapper>
  )
}

export default App
