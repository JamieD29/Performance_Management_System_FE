import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes'; // Bỏ đuôi .tsx khi import
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
