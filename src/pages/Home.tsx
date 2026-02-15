import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const API_URL = 'https://code-collab-backend-myk9.onrender.com';
// const API_URL = 'https://code-collab-backend-rho.vercel.app'

function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createNewSpace = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/spaces`, {
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-container">
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
                        No login required. Just create, share, and collaborate.
                    </p>
                </div>

                <button
                    className="create-button"
                    onClick={createNewSpace}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Creating Space...
                        </>
                    ) : (
                        <>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M10 4V16M4 10H16"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            Create New Space
                        </>
                    )}
                </button>

                {error && <div className="error-message">{error}</div>}

                <div className="features">
                    <div className="feature">
                        <div className="feature-icon">⚡</div>
                        <div className="feature-text">
                            <h3>Instant Sync</h3>
                            <p>Changes appear in real-time</p>
                        </div>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🔗</div>
                        <div className="feature-text">
                            <h3>Easy Sharing</h3>
                            <p>Just share the link</p>
                        </div>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🎨</div>
                        <div className="feature-text">
                            <h3>Syntax Highlighting</h3>
                            <p>Supports all major languages</p>
                        </div>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">⏰</div>
                        <div className="feature-text">
                            <h3>Auto-Expire</h3>
                            <p>Spaces delete after 24 hours</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
