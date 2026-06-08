import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Package, BarChart3, LogOut, Building2, Shirt, Footprints, CircleDot, TrendingUp } from 'lucide-react';
import { api } from '@/utils/api';
import { useAdminAuthStore } from '@/store/authStore';
import { StatsData, Student, CLOTHING_TYPE_LABELS } from '@shared/types';

const typeIcons: Record<string, typeof Shirt> = {
  top: Shirt,
  pants: CircleDot,
  shoe: Footprints,
  belt: CircleDot,
};

function Dashboard() {
  const navigate = useNavigate();
  const user = useAdminAuthStore(state => state.user);
  const logout = useAdminAuthStore(state => state.logout);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [notReceived, setNotReceived] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'not-received'>('overview');

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, notReceivedData] = await Promise.all([
        api.getStats(user?.college),
        api.getNotReceivedStudents(user?.college),
      ]);
      setStats(statsData);
      setNotReceived(notReceivedData);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const progressPercent = stats ? Math.round((stats.receivedStudents / stats.totalStudents) * 100) : 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-army-50 via-white to-army-100">
      <header className="bg-white shadow-sm border-b border-army-100">
        <div className="container max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-army-700 flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-army-900">发放统计</h1>
              <p className="text-xs text-gray-500">
                管理员：{user.username}
                {user.college && <span className="ml-2 text-army-600">· {user.college}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2 text-army-700 hover:bg-army-50 rounded-lg transition-colors text-sm font-medium"
            >
              刷新
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-army-500">
            <div className="animate-spin w-10 h-10 border-4 border-army-200 border-t-army-600 rounded-full mx-auto mb-4" />
            加载中...
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-400">总人数</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalStudents}</div>
                <div className="text-sm text-gray-500 mt-1">参训学生总数</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-400">已领取</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{stats.receivedStudents}</div>
                <div className="text-sm text-gray-500 mt-1">完成全部领取</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <UserX className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-400">未领取</span>
                </div>
                <div className="text-3xl font-bold text-amber-600">{stats.notReceivedStudents}</div>
                <div className="text-sm text-gray-500 mt-1">待领取物品</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-army-100 flex items-center justify-center text-army-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-400">完成率</span>
                </div>
                <div className="text-3xl font-bold text-army-700">{progressPercent}%</div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-army-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-army-700 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                概览
              </button>
              <button
                onClick={() => setActiveTab('not-received')}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'not-received'
                    ? 'bg-army-700 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                未领取名单 ({notReceived.length})
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
                  <div className="bg-gradient-to-r from-army-700 to-army-600 px-6 py-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      各学院发放进度
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {stats.byCollege.map((college, index) => {
                        const percent = Math.round((college.received / college.total) * 100);
                        return (
                          <div key={college.college} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-700">{college.college}</span>
                              <span className="text-sm text-gray-500">
                                {college.received}/{college.total} ({percent}%)
                              </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-army-500 to-army-600 rounded-full transition-all duration-700"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>未领取：{college.notReceived} 人</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <div className="bg-gradient-to-r from-accent-600 to-accent-500 px-6 py-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      待发放物品统计
                    </h2>
                  </div>
                  <div className="p-6">
                    {stats.outOfStock.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>所有物品已发放完毕</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {stats.outOfStock.slice(0, 8).map((item, index) => {
                          const Icon = typeIcons[item.type] || Package;
                          return (
                            <div
                              key={`${item.type}-${item.size}`}
                              className="p-4 bg-gray-50 rounded-xl border border-gray-100 animate-slide-up"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">
                                    {CLOTHING_TYPE_LABELS[item.type as keyof typeof CLOTHING_TYPE_LABELS]}
                                  </div>
                                  <div className="font-bold text-gray-900">{item.size} 码</div>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-gray-400">待发放</span>
                                <span className="text-xl font-bold text-accent-600">{item.count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'not-received' && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserX className="w-5 h-5" />
                    未领取学生名单
                  </h2>
                  <span className="text-amber-100 text-sm">共 {notReceived.length} 人</span>
                </div>
                <div className="overflow-x-auto">
                  {notReceived.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <UserCheck className="w-16 h-16 mx-auto mb-4 text-green-400" />
                      <p className="text-lg">所有学生已完成领取</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">学院</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">学号</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">未领取物品</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {notReceived.map((student, index) => {
                          const items: { key: string; label: string; received: boolean }[] = [
                            { key: 'top', label: '上衣', received: student.topReceived },
                            { key: 'pants', label: '裤子', received: student.pantsReceived },
                            { key: 'shoe', label: '鞋', received: student.shoeReceived },
                            { key: 'belt', label: '腰带', received: student.beltReceived },
                          ];
                          const notReceivedItems = items.filter(i => !i.received);
                          
                          return (
                            <tr key={student.id} className="hover:bg-gray-50 animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                              <td className="px-6 py-4 text-sm text-gray-900">{student.college}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{student.className}</td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-mono">{student.studentId}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.name}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {notReceivedItems.map(item => (
                                    <span
                                      key={item.key}
                                      className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-md"
                                    >
                                      {item.label}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}

export default Dashboard;
