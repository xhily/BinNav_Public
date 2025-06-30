import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage.jsx'
import Admin from './pages/Admin.jsx'
import { useSiteConfig } from './hooks/useSiteConfig.js'
import './App.css'

function App() {
  const { siteConfig } = useSiteConfig()
  
  // 初始化页面标题
  useEffect(() => {
    document.title = siteConfig.siteTitle
  }, [siteConfig.siteTitle])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App