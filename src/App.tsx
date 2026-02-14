import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Space from './pages/Space';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/space/:spaceId" element={<Space />} />
            </Routes>
        </Router>
    );
}

export default App;
