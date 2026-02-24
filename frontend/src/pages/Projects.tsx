import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Users,
  Flag,
  Sparkles,
  Brain,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { userService } from '@/services/userService';
import { aiService } from '@/services/aiService';

export const Projects = () => {
  const { projects, setProjects, tasks, setTasks, addProjectToStore, users, setUsers } = useAppStore(state => ({
    projects: state.projects,
    setProjects: state.setProjects,
    tasks: state.tasks,
    setTasks: state.setTasks,
    addProjectToStore: state.addProject,
    users: state.users,
    setUsers: state.setUsers
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState<number | null>(null);

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'ACTIVE' as any,
    priority: 'MEDIUM' as any,
    dueDate: '',
    teamMembers: [] as number[],
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [projectsData, tasksData, usersData] = await Promise.all([
          projectService.getProjects(),
          taskService.getTasks(),
          userService.getUsers()
        ]);
        setProjects(projectsData);
        setTasks(tasksData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [setProjects, setTasks, setUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdProject = await projectService.createProject(newProject);
      addProjectToStore(createdProject);
      toast.success('Project created successfully!');
      setIsModalOpen(false);
      setNewProject({
        title: '',
        description: '',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        dueDate: '',
        teamMembers: [],
      });
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getProjectProgress = (projectId: number) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(t => t.status === 'DONE').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30';
      case 'HIGH': return 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
      case 'MEDIUM': return 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      default: return 'bg-slate-50 dark:bg-slate-900/10 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    }
  };

  const handleAIReport = async (projectId: number) => {
    setAiLoading(projectId);
    try {
      const report = await aiService.generateProjectReport(projectId);
      toast.info('Weekly Project Report', {
        description: report,
        duration: 15000,
      });
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIRisks = async (projectId: number) => {
    setAiLoading(projectId);
    try {
      const risks = await aiService.detectRisks(projectId);
      toast.warning('Risk Detection', {
        description: risks.join('\n'),
        duration: 15000,
      });
    } catch (error) {
      toast.error('Failed to detect risks');
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your active projects here.</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl gap-2 h-11 px-6 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
        >
          <Plus size={20} />
          Create New Project
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-slate-300">Project Title</label>
            <Input
              required
              placeholder="Enter project name"
              value={newProject.title}
              onChange={e => setNewProject({ ...newProject, title: e.target.value })}
              className="dark:bg-slate-900 dark:border-slate-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-slate-300">Description</label>
            <textarea
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              placeholder="What is this project about?"
              value={newProject.description}
              onChange={e => setNewProject({ ...newProject, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-300">Priority</label>
              <select
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                value={newProject.priority}
                onChange={e => setNewProject({ ...newProject, priority: e.target.value as any })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-300">Due Date</label>
              <Input
                type="date"
                required
                value={newProject.dueDate}
                onChange={e => setNewProject({ ...newProject, dueDate: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-slate-300">Team Members</label>
            <div className="flex flex-wrap gap-2 p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 min-h-[44px]">
              {users.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    const members = newProject.teamMembers.includes(user.id)
                      ? newProject.teamMembers.filter(id => id !== user.id)
                      : [...newProject.teamMembers, user.id];
                    setNewProject({ ...newProject, teamMembers: members });
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                    newProject.teamMembers.includes(user.id)
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {user.name || user.email}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/20 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search projects by name or description..."
              className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <Filter size={18} />
              Filters
            </Button>
            <Button variant="outline" className="rounded-xl gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <Flag size={18} />
              Sort
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority || 'MEDIUM'}
                    </Badge>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-slate-400">
                      <MoreVertical size={16} />
                    </Button>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[40px]">
                      {project.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 rounded-xl text-xs gap-1.5 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-medium"
                      onClick={() => handleAIReport(project.id)}
                      disabled={aiLoading === project.id}
                    >
                      {aiLoading === project.id ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                      Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 rounded-xl text-xs gap-1.5 border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all font-medium"
                      onClick={() => handleAIRisks(project.id)}
                      disabled={aiLoading === project.id}
                    >
                      <AlertTriangle size={14} />
                      Risks
                    </Button>
                  </div>

                  <div className="space-y-4 mt-auto">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar size={16} />
                        <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}</span>
                      </div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{getProjectProgress(project.id)}%</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getProjectProgress(project.id)}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-indigo-500 dark:bg-indigo-600 h-full rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                        {project.teamMembers.length > 0 ? (
                          project.teamMembers.slice(0, 3).map((m, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 ring-2 ring-transparent group-hover:ring-indigo-50 dark:group-hover:ring-indigo-900/20 overflow-hidden"
                            >
                              {users.find(u => u.id === m)?.avatar ? (
                                <img src={users.find(u => u.id === m)?.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (users.find(u => u.id === m)?.name || 'U').charAt(0).toUpperCase()
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            -
                          </div>
                        )}
                        {project.teamMembers.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            +{project.teamMembers.length - 3}
                          </div>
                        )}
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors">
                          <Plus size={12} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Users size={14} />
                        <span>{project.teamMembers.length} members</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};