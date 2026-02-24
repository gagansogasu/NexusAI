import React, { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  Shield,
  MoreVertical,
  Search,
  UserPlus,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { userService } from '@/services/userService';
import { motion } from 'framer-motion';

export const Team = () => {
  const { users, setUsers } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await userService.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [setUsers]);

  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30';
      case 'PROJECT_MANAGER': return 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      default: return 'bg-slate-50 dark:bg-slate-900/10 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Gathering team info...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Team Members</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your team and their roles.</p>
        </div>
        <Button className="rounded-xl gap-2 h-11 px-6 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
          <UserPlus size={20} />
          Invite Member
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/20 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search by name or email..."
            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-inner overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                    <MoreVertical size={18} />
                  </Button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {user.name || 'Unnamed User'}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mt-1">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    <Shield size={12} className="mr-1" />
                    {user.role || 'MEMBER'}
                  </Badge>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
