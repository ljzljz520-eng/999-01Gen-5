import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Shirt, Footprints, CircleDot, CheckCircle2, User, LogOut, Repeat, Building2, ArrowRight } from 'lucide-react';
import { api } from '@/utils/api';
import { useStaffAuthStore } from '@/store/authStore';
import { Student, ClothingType, ExchangeRecord, CLOTHING_TYPE_LABELS } from '@shared/types';
import { cn } from '@/lib/utils';

const sizeOptions: Record<ClothingType, string[]> = {
  top: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  pants: ['28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38'],
  shoe: ['38', '39', '40', '41', '42', '43', '44', '45', '46'],
  belt: ['S', 'M', 'L', 'XL'],
};

const typeOptions: { value: ClothingType; label: string }[] = [
  { value: 'top', label: '上衣' },
  { value: 'pants', label: '裤子' },
  { value: 'shoe', label: '鞋' },
  { value: 'belt', label: '腰带' },
];

function Exchange() {
  const navigate = useNavigate();
  const user = useStaffAuthStore(state => state.user);
  const logout = useStaffAuthStore(state => state.logout);
  const [studentId, setStudentId] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [type, setType] = useState<ClothingType>('top');
  const [oldSize, setOldSize] = useState('');
  const [newSize, setNewSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [records, setRecords] = useState<ExchangeRecord[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/staff/login');
    }
    loadRecords();
  }, [user, navigate]);

  useEffect(() => {
    if (student) {
      const sizeMap: Record<ClothingType, string> = {
        top: student.topSize,
        pants: student.pantsSize,
        shoe: student.shoeSize,
        belt: student.beltSize,
      };
      setOldSize(sizeMap[type]);
    }
  }, [student, type]);

  const loadRecords = async () => {
    try {
      const data = await api.getExchangeRecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load records', err);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!studentId.trim()) {
      setError('请输入学号');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setStudent(null);

    try {
      const data = await api.getStudent(studentId.trim());
      setStudent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !oldSize || !newSize || !user) return;
    if (oldSize === newSize) {
      setError('新尺码不能与原尺码相同');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.recordExchange({
        studentId: student.studentId,
        type,
        oldSize,
        newSize,
        operator: user.username,
      });
      
      setSuccess('换码登记成功！');
      const updatedStudent = await api.getStudent(student.studentId);
      setStudent(updatedStudent);
      loadRecords();
      
      setTimeout(() => {
        setStudentId('');
        setStudent(null);
        setSuccess('');
        setNewSize('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登记失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const getSizeKey = (t: ClothingType): keyof Student => {
    const keys: Record<ClothingType, keyof Student> = {
      top: 'topSize',
      pants: 'pantsSize',
      shoe: 'shoeSize',
      belt: 'beltSize',
    };
    return keys[t];
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-army-50 via-white to-army-100">
      <header className="bg-white shadow-sm border-b border-army-100">
        <div className="container max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-600 flex items-center justify-center text-white">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-army-900">换码登记</h1>
              <p className="text-xs text-gray-500">工作人员：{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/staff/distribute"
              className="px-4 py-2 text-army-700 hover:bg-army-50 rounded-lg transition-colors text-sm font-medium"
            >
              发放核销
            </Link>
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

      <main className="container max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-slide-up">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-accent-600 to-accent-500 px-6 py-4">
                <h2 className="text-lg font-bold text-white">换码登记</h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="输入学号查询学生信息"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-500 focus:ring-4 focus:ring-accent-100 outline-none transition-all"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-army-700 text-white rounded-lg text-sm font-medium hover:bg-army-800 transition-all disabled:opacity-50"
                    >
                      查询
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                  </div>
                )}

                {loading && (
                  <div className="text-center py-8 text-gray-400">查询中...</div>
                )}

                {student && !loading && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="p-4 bg-army-50 rounded-xl border border-army-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-army-600 flex items-center justify-center text-white">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-army-900">{student.name}</div>
                          <div className="text-sm text-army-600">
                            {student.college} · {student.className} · {student.studentId}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">换码类型</label>
                      <div className="grid grid-cols-4 gap-2">
                        {typeOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setType(opt.value)}
                            className={cn(
                              "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                              type === opt.value
                                ? "bg-accent-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">原尺码</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={oldSize}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                          />
                        </div>
                      </div>
                      <div className="flex items-end pb-2">
                        <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">新尺码</label>
                      <select
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-500 focus:ring-4 focus:ring-accent-100 outline-none transition-all"
                        required
                      >
                        <option value="">请选择新尺码</option>
                        {sizeOptions[type].map(size => (
                          <option key={size} value={size} disabled={size === oldSize}>
                            {size} {size === oldSize ? '(当前)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !newSize || newSize === oldSize}
                      className="w-full py-3 bg-accent-600 text-white rounded-xl font-medium hover:bg-accent-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-200"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                          登记中...
                        </>
                      ) : (
                        <>
                          <Repeat className="w-5 h-5" />
                          确认换码
                        </>
                      )}
                    </button>
                  </form>
                )}

                {!student && !loading && (
                  <div className="text-center py-12 text-gray-400">
                    <Repeat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>请输入学号查询学生信息</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-army-700 to-army-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">换码记录</h2>
                <span className="text-army-100 text-sm">共 {records.length} 条</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {records.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    暂无换码记录
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">学生</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">换码</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作员</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{record.createdAt}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{record.studentId}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{CLOTHING_TYPE_LABELS[record.type]}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="text-gray-500">{record.oldSize}</span>
                            <ArrowRight className="inline w-4 h-4 mx-1 text-gray-400" />
                            <span className="text-accent-600 font-medium">{record.newSize}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{record.operator}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Exchange;
