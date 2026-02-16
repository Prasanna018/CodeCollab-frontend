import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Space = lazy(() => import('./pages/Space'));

function App() {
    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/space/:spaceId" element={<Space />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
