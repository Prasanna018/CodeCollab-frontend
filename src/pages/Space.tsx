import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useWebSocket } from '../hooks/useWebSocket';
import './Space.css';

const API_URL = 'https://code-collab-backend-myk9.onrender.com';
const WS_URL = 'wss://code-collab-backend-myk9.onrender.com';
// const API_URL = 'https://code-collab-backend-rho.vercel.app'
// const WS_URL = 'wss://code-collab-backend-rho.vercel.app'

const LANGUAGES = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'Markdown' },
];

function Space() {
    const { spaceId } = useParams<{ spaceId: string }>();
    const navigate = useNavigate();
    const [code, setCode] = useState('// Loading...');
    const [language, setLanguage] = useState('python');
    const [activeUsers, setActiveUsers] = useState(1);
    const [userId, setUserId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isUpdatingFromWS, setIsUpdatingFromWS] = useState(false);

    // Fetch initial space data
    useEffect(() => {
        const fetchSpace = async () => {
            try {
                const response = await fetch(`${API_URL}/api/spaces/${spaceId}`);
                if (!response.ok) {
                    throw new Error('Space not found');
                }
                const data = await response.json();
                setCode(data.code);
                setLanguage(data.language);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load space');
                setLoading(false);
            }
        };

        fetchSpace();
    }, [spaceId]);

    // WebSocket message handler
    const handleWebSocketMessage = useCallback((data: any) => {
        console.log('WebSocket message:', data);

        switch (data.type) {
            case 'init':
                setUserId(data.user_id);
                setCode(data.code);
                setLanguage(data.language);
                setActiveUsers(data.active_users);
                break;

            case 'code_change':
                if (data.user_id !== userId) {
                    setIsUpdatingFromWS(true);
                    setCode(data.code);
                    setTimeout(() => setIsUpdatingFromWS(false), 100);
                }
                break;

            case 'language_change':
                if (data.user_id !== userId) {
                    setLanguage(data.language);
                }
                break;

            case 'user_join':
                setActiveUsers(data.active_users);
                break;

            case 'user_leave':
                setActiveUsers(data.active_users);
                break;
        }
    }, [userId]);

    const { sendMessage, isConnected } = useWebSocket(
        `${WS_URL}/ws/${spaceId}`,
        handleWebSocketMessage,
        !loading && !error
    );

    // Handle code changes
    const handleCodeChange = useCallback(
        (value: string | undefined) => {
            if (isUpdatingFromWS) return; // Don't send updates if we're receiving one

            const newCode = value || '';
            setCode(newCode);
            sendMessage({
                type: 'code_change',
                code: newCode,
            });
        },
        [sendMessage, isUpdatingFromWS]
    );

    // Handle language changes
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        sendMessage({
            type: 'language_change',
            language: newLanguage,
        });
    };

    // Copy invite link
    const copyInviteLink = async () => {
        const link = `${window.location.origin}/space/${spaceId}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (loading) {
        return (
            <div className="space-container">
                <div className="loading">Loading space...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-container">
                <div className="error-container">
                    <h2>❌ {error}</h2>
                    <button onClick={() => navigate('/')} className="back-button">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-container">
            <div className="toolbar">
                <div className="toolbar-left">
                    <h2 className="space-title">
                        <span className="code-icon">{'</>'}</span>
                        CodeCollab
                    </h2>
                    <div className="status-indicator">
                        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                        <span className="status-text">
                            {isConnected ? 'Connected' : 'Reconnecting...'}
                        </span>
                    </div>
                </div>

                <div className="toolbar-center">
                    <div className="language-selector">
                        <label htmlFor="language">Language:</label>
                        <select
                            id="language"
                            value={language}
                            onChange={handleLanguageChange}
                            className="language-select"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="active-users">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span>{activeUsers} online</span>
                    </div>
                </div>

                <div className="toolbar-right">
                    <button onClick={copyInviteLink} className="copy-button">
                        {copySuccess ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z" />
                                    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z" />
                                </svg>
                                Copy Link
                            </>
                        )}
                    </button>

                    <button onClick={() => navigate('/')} className="leave-button">
                        Leave Space
                    </button>
                </div>
            </div>

            <div className="editor-container">
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        glyphMargin: true,
                        folding: true,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: 'all',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                    }}
                />
            </div>
        </div>
    );
}

export default Space;
