import React, { useState } from 'react';
import { LayoutGrid, Plus, ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

function Tasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Verify MacBook Pro (AF-0001) handover condition', category: 'Handover', column: 'ToDo', done: false },
    { id: 2, title: 'Inspect overheating Dell Server R750 (AF-0002)', category: 'Maintenance', column: 'InProgress', done: false },
    { id: 3, title: 'Schedule Room B2 booking for weekly engineering sync', category: 'Booking', column: 'Done', done: true },
    { id: 4, title: 'Perform Q3 asset verification audit for Quality Assurance', category: 'Audit', column: 'InProgress', done: false },
    { id: 5, title: 'Review Ergonomic Chair (AF-0004) transfer request', category: 'Transfer', column: 'ToDo', done: false }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCat, setNewTaskCat] = useState('General');
  const [modalOpen, setModalOpen] = useState(false);

  const moveTask = (taskId, direction) => {
    const columnsOrder = ['ToDo', 'InProgress', 'InReview', 'Done'];
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const currentIndex = columnsOrder.indexOf(task.column);
        let nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < columnsOrder.length) {
          return { ...task, column: columnsOrder[nextIndex], done: columnsOrder[nextIndex] === 'Done' };
        }
      }
      return task;
    }));
  };

  const toggleDone = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const nextDone = !task.done;
        return { ...task, done: nextDone, column: nextDone ? 'Done' : 'ToDo' };
      }
      return task;
    }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const newTask = {
      id: tasks.length + 1,
      title: newTaskTitle,
      category: newTaskCat,
      column: 'ToDo',
      done: false
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setModalOpen(false);
  };

  const renderColumn = (colName, displayName) => {
    const colTasks = tasks.filter(t => t.column === colName);
    return (
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <span className="font-bold text-xs text-foreground uppercase tracking-wider">{displayName}</span>
          <span className="text-[10px] bg-secondary text-primary font-bold px-2 py-0.5 rounded-full">{colTasks.length}</span>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {colTasks.map(task => (
            <div key={task.id} className="bg-secondary/30 border border-border p-3.5 rounded-xl space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-2.5">
                <button onClick={() => toggleDone(task.id)} className="text-muted-foreground hover:text-primary shrink-0 mt-0.5">
                  {task.done ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                </button>
                <p className={`text-xs leading-relaxed font-semibold ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">{task.category}</span>
                
                {/* Movement buttons */}
                <div className="flex gap-1.5">
                  {colName !== 'ToDo' && (
                    <button onClick={() => moveTask(task.id, -1)} className="p-1 rounded hover:bg-border text-foreground">
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {colName !== 'Done' && (
                    <button onClick={() => moveTask(task.id, 1)} className="p-1 rounded hover:bg-border text-foreground">
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operational Tasks</h1>
          <p className="text-xs text-muted-foreground">Kanban workflow board of day-to-day asset manager activities.</p>
        </div>
        
        <button 
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs shadow-md shadow-primary/20 hover:scale-[1.03] transition-transform"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderColumn('ToDo', 'To Do')}
        {renderColumn('InProgress', 'In Progress')}
        {renderColumn('InReview', 'In Review')}
        {renderColumn('Done', 'Done')}
      </div>

      {/* Add Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-card border border-border w-full max-w-sm p-6 rounded-2xl shadow-xl">
            <h2 className="text-sm font-bold text-foreground mb-4">Add Kanban Task</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Task Summary</label>
                <input 
                  type="text"
                  placeholder="e.g. Schedule vehicle inspection"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Task Category</label>
                <select 
                  value={newTaskCat}
                  onChange={(e) => setNewTaskCat(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-background"
                >
                  <option value="General">General</option>
                  <option value="Handover">Handover</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Booking">Booking</option>
                  <option value="Audit">Audit</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
