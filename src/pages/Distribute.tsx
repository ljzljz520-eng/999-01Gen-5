import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Shirt, Footprints, CircleDot, CheckCircle2, XCircle, User, LogOut, Scan, Building2, RefreshCw } from 'lucide-react';
import { api } from '@/utils/api';
import { useStaffAuthStore } from '@/store/authStore';
import { Student, ClothingType, CLOTHING_TYPE_LABELS } from '@shared/types';
import { cn } from '@/lib/utils';

const sizeItems: { key: ClothingType; label: string; icon: typeof Shirt; sizeKey: keyof Student; receivedKey: keyof Student }[] = [
  { key: 'top', label: '上衣', icon: Shirt, sizeKey: 'topSize', receivedKey: 'topReceived' },
  { key: 'pants', label: '裤子', icon: CircleDot, sizeKey: 'pantsSize', receivedKey: 'pantsReceived' },
  { key: 'shoe', label: '鞋', icon: Footprints, sizeKey: 'shoeSize', receivedKey: 'shoeReceived' },
  { key: 'belt', label: '腰带', icon: CircleDot, sizeKey: 'beltSize', receivedKey: 'beltReceived' },
];

function Distribute() {
  const navigate = useNavigate();
  const user = useStaffAuthStore(state => state.user);
  const logout = useStaffAuthStore(state => state.logout);
  const [studentId, setStudentId] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<ClothingType>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/staff/login');
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (student) {
      const items = new Set<ClothingType>();
      sizeItems.forEach(item => {
        if (!student[item.receivedKey] as boolean) {
          items.add(item.key);
        }
      });
      setSelectedItems(items);
    }
  }, [student]);

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

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && studentId.length >= 5) {
      handleSearch();
    }
  };

  const toggleItem = (item: ClothingType) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!student || selectedItems.size === 0) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const updated = await api.confirmDistribute(student.studentId, Array.from(selectedItems));
      setStudent(updated);
      setSuccess('发放确认成功！');
      setTimeout(() => {
        setStudentId('');
        setStudent(null);
        setSuccess('');
        inputRef.current?.focus();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '确认失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStudentId('');
    setStudent(null);
    setError('');
    setSuccess('');
    inputRef.current?.focus();
  };

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-army-50 via-white to-army-100">
      <header className="bg-white shadow-sm border-b border-army-100">
        <div className="container max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-army-700 flex items-center justify-center text-white">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-army-900">发放核销</h1>
              <p className="text-xs text-gray-500">工作人员：{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/staff/exchange"
              className="px-4 py-2 text-army-700 hover:bg-army-50 rounded-lg transition-colors text-sm font-medium"
            >
              换码登记
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

      <main className="container max-w-5xl px-4 py-8">
        <form onSubmit={handleSearch} className="mb-8 animate-slide-up">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-army-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="扫码或输入学号，按回车查询"
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-army-200 rounded-2xl focus:border-army-500 focus:ring-4 focus:ring-army-100 outline-none transition-all bg-white shadow-sm"
              disabled={loading}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleReset}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center animate-bounce-in">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-center animate-bounce-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-army-500">
            <div className="animate-spin w-8 h-8 border-4 border-army-200 border-t-army-600 rounded-full mx-auto mb-4" />
            查询中...
          </div>
        )}

        {student && !loading && (
          <div className="animate-bounce-in">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-army-700 to-army-600 px-8 py-6">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{student.name}</h2>
                      <div className="flex items-center gap-4 text-army-100 text-sm">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {student.college}
                        </span>
                        <span>{student.className}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-army-100 text-sm">学号</div>
                    <div className="text-2xl font-bold">{student.studentId}</div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-lg font-semibold text-army-900 mb-6">发放物品确认（点击选择发放物品）</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {sizeItems.map((item) => {
                    const Icon = item.icon;
                    const size = student[item.sizeKey] as string;
                    const received = student[item.receivedKey] as boolean;
                    const selected = selectedItems.has(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => !received && toggleItem(item.key)}
                        disabled={received}
                        className={cn(
                          "relative p-6 rounded-2xl border-2 transition-all text-left",
                          received
                            ? "bg-green-50 border-green-200 cursor-not-allowed opacity-75"
                            : selected
                            ? "bg-army-50 border-army-500 ring-4 ring-army-100"
                            : "bg-white border-gray-200 hover:border-army-300 cursor-pointer"
                        )}
                      >
                        <div className="absolute top-3 right-3">
                          {received ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : selected ? (
                            <div className="w-5 h-5 rounded-full bg-army-600 flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                          received ? "bg-green-100 text-green-600" : selected ? "bg-army-100 text-army-600" : "bg-gray-100 text-gray-500"
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                        <div className="text-2xl font-bold text-army-900">{size}</div>
                        <div className={cn(
                          "text-xs mt-2 font-medium",
                          received ? "text-green-600" : selected ? "text-army-600" : "text-gray-500"
                        )}>
                          {received ? '已发放' : selected ? '已选择' : '待发放'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="text-army-600">
                    已选择 <span className="font-bold text-army-900">{selectedItems.size}</span> 件物品发放
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
                    >
                      继续扫描
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={selectedItems.size === 0 || submitting}
                      className="px-8 py-3 bg-accent-600 text-white rounded-xl font-medium hover:bg-accent-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-accent-200"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                          确认中...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          确认发放
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!student && !loading && (
          <div className="text-center py-16 text-gray-400 animate-fade-in">
            <Scan className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">请扫描学生条码或输入学号</p>
            <p className="text-sm mt-2">支持扫码枪自动扫码</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Distribute;
