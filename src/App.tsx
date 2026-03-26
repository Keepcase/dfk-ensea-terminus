import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CatalogPage } from './pages/CatalogPage'
import { OrderbookPage } from './pages/OrderbookPage'
import { MyOrdersPage } from './pages/MyOrdersPage'
import { HallOfHeroesPage } from './pages/HallOfHeroesPage'

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/item/:symbol" element={<OrderbookPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/hall-of-heroes" element={<HallOfHeroesPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
