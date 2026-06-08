import { useState } from 'react';
import { Search, Shirt, Footprints, CircleDot, CheckCircle2, XCircle, GraduationCap, Building2 } from 'lucide-react';
import { api } from '@/utils/api';
import { Student } from '@shared/types';
import { cn } from '@/lib/utils';

const sizeItems = [
  { key: 'top', label: '上衣', icon: Shirt, sizeKey: 'topSize', receivedKey: 'topReceived' },
  { key: 'pants', label: '裤子', icon: CircleDot, sizeKey: 'pantsSize', receivedKey: 'pantsReceived' },
  { key: 'shoe', label: '鞋', icon: Footprints, sizeKey: 'shoeSize', receivedKey: 'shoeReceived' },
  { key: 'belt', label: '腰带', icon: CircleDot, sizeKey: 'beltSize', receivedKey: 'beltReceived' },
] as const;

function Home() {
  const [studentId, setStudentId] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('请输入学号');
      return;
    }

    setLoading(true);
    setError('');
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

  const allReceived = student?.topReceived && student?.pantsReceived && student?.shoeReceived && student?.beltReceived;

  return (
    <div className="min-h-screen bg-gradient-to-br from-army-50 via-white to-army-100">
      <div className="container max-w-4xl px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-army-700 text-white mb-6 shadow-lg">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-army-900 mb-3">军训服尺码发放查询</h1>
          <p className="text-army-600 text-lg">输入学号查询您的服装尺码信息</p>
        </div>

        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12 animate-slide-up">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-army-400" />
            </div>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="请输入学号"
              className="w-full pl-12 pr-32 py-4 text-lg border-2 border-army-200 rounded-2xl focus:border-army-500 focus:ring-4 focus:ring-army-100 outline-none transition-all bg-white shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-army-700 text-white rounded-xl font-medium hover:bg-army-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? '查询中...' : '查询'}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center animate-bounce-in">
            {error}
          </div>
        )}

        {student && (
          <div className="animate-bounce-in">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-army-700 to-army-600 px-8 py-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
                    <div className="flex items-center gap-4 text-army-100">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        {student.college}
                      </span>
                      <span>{student.className}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-army-100 text-sm">学号</div>
                    <div className="text-2xl font-bold">{student.studentId}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {allReceived ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      已全部领取
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-accent-500/90 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      待领取
                    </span>
                  )}
                  {student.receivedAt && (
                    <span className="text-army-100 text-sm">领取时间：{student.receivedAt}</span>
                  )}
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-lg font-semibold text-army-900 mb-6">服装尺码信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sizeItems.map((item, index) => {
                    const Icon = item.icon;
                    const size = student[item.sizeKey];
                    const received = student[item.receivedKey];
                    return (
                      <div
                        key={item.key}
                        className={cn(
                          "relative p-6 rounded-2xl border-2 transition-all",
                          received
                            ? "bg-green-50 border-green-200"
                            : "bg-amber-50 border-amber-200"
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute top-3 right-3">
                          {received ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                          received ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                        <div className="text-2xl font-bold text-army-900">{size}</div>
                        <div className={cn(
                          "text-xs mt-2 font-medium",
                          received ? "text-green-600" : "text-amber-600"
                        )}>
                          {received ? '已领取' : '未领取'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-army-500 text-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p>提示：如尺码不合适，请联系现场工作人员进行换码登记</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
