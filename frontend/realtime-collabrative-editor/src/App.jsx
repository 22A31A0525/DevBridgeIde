import { useState } from 'react'
import './App.css'
import AnimatedBackground from './background/AnimatedBackground'
import Login from './Authorization/Login'
import { BrowserRouter,Router,Routes,Route } from 'react-router'
import Dashboard from './Dashboard/Dashboard'
import EditorPage from './CodeEditor/EditorPage'
import WebSocketEditor from './WebSocketEditor'
import CodeEditor from './CodeEditor/CodeEditor'
import Home from './LandingPage/Home'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/auth' element={<Login />}></Route>
     
      <Route path='/dashboard' element={<Dashboard/>}></Route>
      <Route path='/w' element={<WebSocketEditor/>}></Route>
      <Route path="/editor/:sessionId" element={<EditorPage/>} />


    </Routes>
    </BrowserRouter>
  
    </>
  )
}

export default App
