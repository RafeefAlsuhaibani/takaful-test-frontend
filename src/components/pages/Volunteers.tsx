// src/components/psges/Volunteers.tsx
import { useEffect, useMemo, useState } from 'react';
import { Users, Clock, CheckCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../ui/StatCard';
import DonutChart from '../ui/DonutChart';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

function getAccessToken() {
  return (
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token') ||
    ''
  );
}

export default function Volunteers() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Fetched stats (when logged in) ---
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
  const [tasksCount, setTasksCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // --- Demo donut (no gender API yet, keep sample) ---
  const donutData = useMemo(
    () => ({
      total: 100,
      segments: [
        { value: 52, color: '#711f2c', label: 'رجال' },
        { value: 48, color: '#DFC775', label: 'نساء' },
      ],
    }),
    []
  );

  // --- Default demo stats (fallback when logged out or API fails) ---
  const fallbackStats = useMemo(
    () => [
      { icon: <Users size={20} />, value: 170, label: 'متطوع' },
      { icon: <Clock size={20} />, value: 284, label: 'ساعة تطوعية' },
      { icon: <CheckCircle size={20} />, value: 32, label: 'مشاركات' },
      { icon: <Award size={20} />, value: 21, label: 'نجاحات' },
    ],
    []
  );

  // --- Fetch real stats if logged in ---
  useEffect(() => {
    const access = getAccessToken();
    if (!user || !access) {
      // Not logged in → keep demo numbers
      setTotalHours(null);
      setApplicationsCount(null);
      setTasksCount(null);
      return;
    }

    let cancelled = false;
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [profileRes, appsRes, tasksRes] = await Promise.all([
          fetch(`${API_URL}/volunteers/volunteers/me/profile/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
          fetch(`${API_URL}/volunteers/volunteers/me/applications/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
          fetch(`${API_URL}/volunteers/volunteers/me/tasks/`, {
            headers: { Authorization: `Bearer ${access}` },
          }),
        ]);

        // Profile
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (!cancelled) setTotalHours(Number(profile?.total_hours || 0));
        } else if (!cancelled) setTotalHours(null);

        // Applications
        if (appsRes.ok) {
          const apps = await appsRes.json();
          if (!cancelled) setApplicationsCount(Array.isArray(apps) ? apps.length : 0);
        } else if (!cancelled) setApplicationsCount(null);

        // Tasks
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          if (!cancelled) setTasksCount(Array.isArray(tasks) ? tasks.length : 0);
        } else if (!cancelled) setTasksCount(null);
      } catch {
        if (!cancelled) {
          setTotalHours(null);
          setApplicationsCount(null);
          setTasksCount(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Build the stat cards (prefer real values if present)
  const statsToShow = useMemo(() => {
    if (!user) return fallbackStats;
    return [
      { icon: <Users size={20} />, value: applicationsCount ?? 0, label: 'طلب تطوع' },
      { icon: <Clock size={20} />, value: totalHours ?? 0, label: 'ساعة مسجلة' },
      { icon: <CheckCircle size={20} />, value: tasksCount ?? 0, label: 'مهام' },
      { icon: <Award size={20} />, value: 0, label: 'إنجازات' }, // no API yet
    ];
  }, [user, applicationsCount, totalHours, tasksCount, fallbackStats]);

  return (
    <div className="min-h-screen bg-[#f7f7f7]" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Main Container */}
        <div className="rounded-3xl bg-white shadow-[0_10px_30px_rgba(0,0,0,.06)] p-6 md:p-8 relative animate-fadeIn">
          {/* Top border glow */}
          <div className="absolute inset-x-6 top-0 h-[2px] bg-[#DFC775]/60 rounded-full"></div>

          {/* First Row - Donut Chart and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Donut Chart */}
            <div className="animate-slideUp">
              <DonutChart total={donutData.total} segments={donutData.segments} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {statsToShow.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  value={loading ? '...' : stat.value}
                  label={stat.label}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 80}ms` }}
                />
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 transition-all focus-visible:ring-2 ring-brand-600 ring-offset-2"
                >
                  تسجيل جديد كمتطوع
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="rounded-full border-2 border-[#DFC775] text-[#DFC775] bg-white hover:bg-[#FFF5D6] font-semibold px-8 py-3 transition-all focus-visible:ring-2 ring-brand-600 ring-offset-2"
                >
                  تسجيل الدخول
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 transition-all focus-visible:ring-2 ring-brand-600 ring-offset-2"
                >
                  استكشاف المشاريع
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/my-applications')}
                  className="rounded-full border-2 border-[#DFC775] text-[#DFC775] bg-white hover:bg-[#FFF5D6] font-semibold px-8 py-3 transition-all focus-visible:ring-2 ring-brand-600 ring-offset-2"
                >
                  طلباتي
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
