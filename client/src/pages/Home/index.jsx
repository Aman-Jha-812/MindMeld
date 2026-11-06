import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMessageSquare,
  FiCpu,
  FiCheckSquare,
  FiGrid,
} from 'react-icons/fi';

const features = [
  {
    icon: FiMessageSquare,
    title: 'Real-time Chat',
    description:
      'Seamless instant messaging with channels, direct messages, and rich media sharing.',
  },
  {
    icon: FiCpu,
    title: 'AI Assistant',
    description:
      'Built-in AI that answers questions, generates content, and automates workflows.',
  },
  {
    icon: FiCheckSquare,
    title: 'Task Management',
    description:
      'Organize work with boards, tasks, deadlines, and automated progress tracking.',
  },
  {
    icon: FiGrid,
    title: 'Team Workspaces',
    description:
      'Dedicated spaces for teams with custom permissions and integrations.',
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 md:px-12 lg:px-24">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <FiCpu className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-ink">MindMeld</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-ink-secondary hover:text-ink transition-colors px-4 py-2 text-sm font-medium"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-soft rounded-2xl mb-6">
            <FiCpu className="text-brand w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-ink mb-4">
            MindMeld
          </h1>
          <p className="text-xl md:text-2xl text-brand font-semibold mb-3">
            AI-Powered Team Collaboration
          </p>
          <p className="text-ink-secondary text-lg mb-10 max-w-2xl mx-auto">
            Slack + Notion + Trello + ChatGPT — all in one place
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors w-full sm:w-auto text-center"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-card border border-line hover:bg-hover text-ink px-8 py-3 rounded-lg text-lg font-medium transition-colors w-full sm:w-auto text-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-24 max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-ink text-center mb-12">
            Everything your team needs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card hover:border-brand transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-soft transition-colors">
                    <Icon className="text-brand w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-ink mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-ink-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-line py-6 px-6">
        <p className="text-center text-ink-muted text-sm">
          &copy; {new Date().getFullYear()} MindMeld. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
