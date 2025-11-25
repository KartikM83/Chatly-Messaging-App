
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import PublicRoute from './routes/PublicRoute'

function App() {


  return (
   <BrowserRouter>
      <PublicRoute />
   </BrowserRouter>
  )
}

export default App
