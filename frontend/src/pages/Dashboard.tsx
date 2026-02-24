import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart2,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';

const chartData = [
  { name: 'Mon', completed: 4, pending: 6 },
  { name: 'Tue', completed: 7, pending: 4 },
  { name: 'Wed', completed: 5, pending: 8 },
  { name: 'Thu', completed: 10, pending: 3 },
  { name: 'Fri', completed: 8, pending: 5 },
  { name: 'Sat', completed: 3, pending: 2 },
  { name: 'Sun', completed: 2, pending: 1 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <Card className="overflow-hidden group dark:bg-slate-900 dark:border-slate-800">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100 transition-transform group-hover:scale-110 duration-300`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
      </div>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const { projects, setProjects, tasks, setTasks, theme } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await projectService.getDashboardStats();
        setStats(statsData);

        const [projectsData, tasksData] = await Promise.all([
          projectService.getProjects(),
          taskService.getTasks()
        ]);
        setProjects(projectsData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setProjects, setTasks]);

  const dashboardStats = {
    totalProjects: stats?.totalProjects || projects.length,
    totalTasks: stats?.totalTasks || tasks.length,
    completedTasks: stats?.completedTasks || tasks.filter(t => t.status === 'DONE').length,
    pendingTasks: stats?.pendingTasks || tasks.filter(t => t.status !== 'DONE').length,
    overdueTasks: stats?.overdueTasks || tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length,
  };

  const activityData = stats?.activities || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Preparing your workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none rounded-xl dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
            Download Report
          </Button>
          <Button className="flex-1 sm:flex-none rounded-xl gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
            <Plus size={18} />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={dashboardStats.totalProjects}
          icon={BarChart2}
          color="bg-indigo-600"
          trend="+12%"
        />
        <StatCard
          title="Active Tasks"
          value={dashboardStats.pendingTasks}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Completed"
          value={dashboardStats.completedTasks}
          icon={CheckCircle2}
          color="bg-emerald-500"
          trend="+5%"
        />
        <StatCard
          title="Overdue"
          value={dashboardStats.overdueTasks}
          icon={AlertCircle}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white">Task Productivity</CardTitle>
            <Badge variant="secondary" className="dark:bg-slate-800 dark:text-slate-400 border-none">Weekly</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke={theme === 'dark' ? '#334155' : '#cbd5e1'}
                    strokeWidth={2}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activityData.length > 0 ? activityData.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 font-bold text-slate-600 dark:text-slate-400 text-sm overflow-hidden">
                    {item.user.avatar ? <img src={item.user.avatar} alt="" className="w-full h-full object-cover" /> : item.user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-semibold text-slate-900 dark:text-white">{item.user.name || 'User'}</span>
                      <span className="text-slate-500 dark:text-slate-400 mx-1">{item.action}</span>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-600 text-sm">
                  <div className="mb-2 opacity-20">
                    <BarChart2 size={40} className="mx-auto" />
                  </div>
                  No recent activity
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.slice(0, 3).map((project) => (
          <GlassCard key={project.id} className="p-6 group cursor-pointer hover:-translate-y-1 transition-all duration-300 dark:border-indigo-500/20">
            <div className="flex justify-between items-start mb-4">
              <Badge className={project.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-none' : 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-none'}>
                {project.status || 'ACTIVE'}
              </Badge>
              <div className="flex -space-x-2">
                {project.teamMembers.slice(0, 3).map((m, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                    U
                  </div>
                ))}
              </div>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{project.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">{project.description || 'No description'}</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
                <Clock size={14} />
                <span>{project.dueDate ? `Due ${new Date(project.dueDate).toLocaleDateString()}` : 'No due date'}</span>
              </div>
              <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[65%] shadow-[0_0_8px_rgba(79,70,229,0.3)]"></div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
