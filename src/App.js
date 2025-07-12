import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EdtiorPage from './pages/EdtiorPage';
import Home from './pages/Home';
import {Toaster} from 'react-hot-toast'
function App() {
  return (
    <BrowserRouter>
    <div><Toaster></Toaster></div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/editor/:roomId' element={<EdtiorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
