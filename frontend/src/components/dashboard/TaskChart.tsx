import { useMemo } from 'react';
import type { Task } from '@/types/task.types';
import type { Board } from '@/types/board.types';

interface TaskChartProps {
  tasks: Task[];
  boards: Board[];
}

const MAX_BARS = 5;

const TaskChart = ({ tasks, boards }: TaskChartProps) => {
  const boardStats = useMemo(() => {
    const counts: Record<string, { total: number; urgent: number; high: number }> = {};
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      const k = t.boardId;
      if (!counts[k]) counts[k] = { total: 0, urgent: 0, high: 0 };
      counts[k].total += 1;
      if (t.priority === 'URGENT' || t.priority === 'HIGH') {
        counts[k][t.priority === 'URGENT' ? 'urgent' : 'high'] += 1;
      }
    }
    return boards.map((b) => ({
      id: b.id,
      name: b.name || 'Unnamed',
      total: counts[b.id]?.total ?? 0,
      urgent: counts[b.id]?.urgent ?? 0,
      high: counts[b.id]?.high ?? 0,
    }));
  }, [boards, tasks]);

  const topBoards = useMemo(
    () => boardStats.filter((b) => b.total > 0).slice(0, MAX_BARS),
    [boardStats]
  );

  const maxTotal = useMemo(() => {
    let m = 0;
    for (let i = 0; i < topBoards.length; i++) {
      if (topBoards[i].total > m) m = topBoards[i].total;
    }
    return m;
  }, [topBoards]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Task Overview</h3>
        <span className="text-xs text-gray-400">{tasks.length} tasks total</span>
      </div>
      {topBoards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h6m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-1">No tasks tracked yet</p>
          <p className="text-xs text-gray-400">Create tasks to see workload distribution across boards.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topBoards.map((stat) => {
            const widthPct = maxTotal > 0 ? Math.round((stat.total / maxTotal) * 100) : 0;
            return (
              <div key={stat.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate w-40">{stat.name}</span>
                  <span className="tabular-nums text-gray-600">{stat.total}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  {(stat.urgent > 0 || stat.high > 0) && (
                    <span className="text-[11px] text-gray-500 flex-shrink-0">
                      {stat.urgent > 0 && <span className="text-rose-600 font-medium mr-1">{stat.urgent} urgent</span>}
                      {stat.high > 0 && <span className="text-amber-600 font-medium">{stat.high} high</span>}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskChart;
