import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock, ArrowLeft, BarChart3 } from 'lucide-react';
import { api } from '@/utils/api';
import { useAdminAuthStore } from '@/store/authStore';

function AdminLogin() {
  const navigate = useNavigate();
  const login = useAdminAuthStore(state => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.adminLogin(username, password);
      login(response.user, response.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-army-50 via-white to-army-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-2 text-army-600 hover:text-army-800 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-army-700 text-white mb-4">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-army-900 mb-2">学院管理员登录</h1>
            <p className="text-gray-500">请使用管理员账号登录查看统计</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-army-500 focus:ring-4 focus:ring-army-100 outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-army-500 focus:ring-4 focus:ring-army-100 outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-army-700 text-white rounded-xl font-medium hover:bg-army-800 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-army-200"
            >
              <LogIn className="w-5 h-5" />
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500 mb-3">演示账号：</p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>计算机学院：admin_cs / admin123</p>
              <p>电子工程学院：admin_ee / admin123</p>
              <p>机械工程学院：admin_me / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
