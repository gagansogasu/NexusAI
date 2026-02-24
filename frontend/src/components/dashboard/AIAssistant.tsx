import React, { useState } from 'react';
import { Sparkles, X, Brain, AlertTriangle, ListChecks, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { aiService } from '@/services/aiService';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: string; content: any } | null>(null);

  const tasks = useAppStore(state => state.tasks);
  const projects = useAppStore(state => state.projects);

  const handleAction = async (action: string) => {
    setLoading(action);
    setResult(null);
    try {
      if (action === 'summary') {
        if (tasks.length === 0) throw new Error('No tasks found');
        const res = await aiService.generateTaskSummary(tasks[0].id);
        setResult({ type: 'text', content: res });
      } else if (action === 'risks') {
        if (projects.length === 0) throw new Error('No projects found');
        const res = await aiService.detectRisks(projects[0].id);
        setResult({ type: 'list', content: res });
      } else if (action === 'report') {
        if (projects.length === 0) throw new Error('No projects found');
        const res = await aiService.generateProjectReport(projects[0].id);
        setResult({ type: 'text', content: res });
      }
    } catch (error) {
      console.error(error);
      setResult({ type: 'text', content: 'An error occurred while generating AI response.' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[400px]"
          >
            <Card className="border-indigo-200 dark:border-indigo-900 shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/10 overflow-hidden dark:bg-slate-900">
              <CardHeader className="bg-indigo-600 dark:bg-indigo-700 text-white p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} fill="currentColor" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">AI Assistant</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                >
                  <X size={18} />
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {!result && !loading && (
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-12 rounded-xl border-indigo-50 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 dark:bg-slate-900 dark:text-slate-300 transition-all"
                      onClick={() => handleAction('summary')}
                    >
                      <FileText size={18} className="text-indigo-500" />
                      <span>Summarize Recent Tasks</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-12 rounded-xl border-indigo-50 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 dark:bg-slate-900 dark:text-slate-300 transition-all"
                      onClick={() => handleAction('risks')}
                    >
                      <AlertTriangle size={18} className="text-amber-500" />
                      <span>Detect Project Risks</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-12 rounded-xl border-indigo-50 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 dark:bg-slate-900 dark:text-slate-300 transition-all"
                      onClick={() => handleAction('report')}
                    >
                      <Brain size={18} className="text-emerald-500" />
                      <span>Generate Performance Report</span>
                    </Button>
                  </div>
                )}

                {loading && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
                      <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">AI is thinking...</p>
                  </div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                      {result.type === 'text' ? (
                        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {result.content}
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {result.content.map((item: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      onClick={() => setResult(null)}
                    >
                      Back to Assistant
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 active:scale-90",
          isOpen ? "bg-slate-900 dark:bg-slate-800 rotate-90" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200/50 dark:shadow-indigo-900/20"
        )}
      >
        {isOpen ? <X size={28} /> : <Sparkles size={28} fill="currentColor" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
          </span>
        )}
      </Button>
    </div>
  );
};
