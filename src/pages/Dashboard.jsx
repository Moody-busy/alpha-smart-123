import { useAuth } from '@/lib/AuthContext';
import StudentDashboard from '@/pages/StudentDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  return user?.account_type === 'Teacher' ? <TeacherDashboard /> : <StudentDashboard />;
}