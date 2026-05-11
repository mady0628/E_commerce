import { Routes, Route, useLocation } from 'react-router-dom'
import Sign_in from '../src/pages/sign_in'
import Sign_up from '../src/pages/sign_up';
import Home from '../src/pages/home'
import Product from '../src/pages/product'
import ProductDetail from '../src/pages/product_detail'
import SearchResult from '../src/pages/search_result'
import Cart from '../src/pages/cart'
import Order from '../src/pages/order';
import AdminRoute from './route/AdminRoute';
import AdminPage from './admin/admin_page';
import Navbar from './components/Navbar';

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sign_in' element={<Sign_in />} />
        <Route path='/sign_up' element={<Sign_up />} />
        <Route path='/product' element={<Product />} />
        <Route path='/product/:id' element={<ProductDetail />} />
        <Route path='/search' element={<SearchResult />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/order' element={<Order />} />
        <Route path='/admin' element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Routes>
    </>
  )
}

export default App;
