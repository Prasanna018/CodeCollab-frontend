import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { getApiBase } from '../config';

const API_BASE = getApiBase();

function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const createNewSpace = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/api/spaces`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: 'python',
                    initial_code: '# Start coding here...\n',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create space');
            }

            const data = await response.json();
            navigate(`/space/${data.space_id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error creating space:', err);

            // Auto-hide error after 5 seconds
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            createNewSpace();
        }
    };

    return (
        <div
            className="home-container"
            style={{
                background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`
            }}
        >
            <div className="home-content">
                <div className="hero-section">
                    <h1 className="title">
                        <span className="code-bracket">{'<'}</span>
                        CodeCollab
                        <span className="code-bracket">{'/>'}</span>
                    </h1>
                    <p className="subtitle">
                        Real-time code sharing made simple
                    </p>
                    <p className="description">
                        Share 2000+ lines of code instantly with teammates.<br />
                        No login required. Just create, share, and collaborate in real-time.
                    </p>
                </div>

                <div className="cta-section">
                    <button
                        className="create-button"
                        onClick={createNewSpace}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        aria-label="Create new collaboration space"
                    >
                        {loading ? (
                            <>
                                <span className="spinner" role="status" aria-label="loading"></span>
                                Creating Space...
                            </>
                        ) : (
                            <>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M12 4V20M4 12H20"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                Create New Space
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="error-message" role="alert">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                </div>

                <div className="features">
                    <div className="feature" tabIndex={0} role="article">
                        <div className="feature-icon" aria-hidden="true">⚡</div>
                        <div className="feature-text">
                            <h3>Instant Sync</h3>
                            <p>Changes appear in real-time across all connected users</p>
                        </div>
                    </div>

                    <div className="feature" tabIndex={0} role="article">
                        <div className="feature-icon" aria-hidden="true">🔗</div>
                        <div className="feature-text">
                            <h3>Easy Sharing</h3>
                            <p>Just share the unique link - no accounts or passwords needed</p>
                        </div>
                    </div>

                    <div className="feature" tabIndex={0} role="article">
                        <div className="feature-icon" aria-hidden="true">🎨</div>
                        <div className="feature-text">
                            <h3>Syntax Highlighting</h3>
                            <p>Supports all major programming languages with smart formatting</p>
                        </div>
                    </div>

                    <div className="feature" tabIndex={0} role="article">
                        <div className="feature-icon" aria-hidden="true">⏰</div>
                        <div className="feature-text">
                            <h3>Auto-Expire</h3>
                            <p>Spaces automatically delete after 24 hours for privacy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
