import React, { useState } from 'react';
import { EventPlan, TimelinePhase, TimelineItem, DayOfScheduleItem, Collaborator } from '../types/event';
import { Plus, CheckCircle2, Circle, Clock, Calendar, Users, MapPin, Sparkles, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineManagerProps {
  event: EventPlan;
  currentCollaborator: Collaborator;
  onUpdateEvent: (updated: EventPlan) => void;
  onAddActivity: (action: string, detail: string) => void;
}

export const TimelineManager: React.FC<TimelineManagerProps> = ({
  event,
  currentCollaborator,
  onUpdateEvent,
  onAddActivity,
}) => {
  const [viewMode, setViewMode] = useState<'milestones' | 'run_of_show'>('run_of_show');
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);

  const phases = event.timelinePhases || [];
  const schedule = event.dayOfSchedule || [];
  const collaborators = event.collaborators || [];

  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(phases[0]?.id || '');

  // New Day of Schedule Item Form
  const [newScheduleItem, setNewScheduleItem] = useState<Partial<DayOfScheduleItem>>({
    time: '12:00 PM',
    title: '',
    location: 'Main Pavilion',
    leadPerson: currentCollaborator.name,
    notes: '',
  });

  // New Milestone Item Form
  const [newMilestoneItem, setNewMilestoneItem] = useState<Partial<TimelineItem>>({
    title: '',
    description: '',
    dueDate: '2026-10-15',
    category: 'Logistics',
    assignedTo: currentCollaborator.id,
  });

  // Toggle milestone completed
  const handleToggleMilestone = (phaseId: string, itemId: string) => {
    let completedState = false;
    const updatedPhases = phases.map((phase) => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        items: (phase.items || []).map((item) => {
          if (item.id === itemId) {
            completedState = !item.completed;
            return { ...item, completed: completedState };
          }
          return item;
        }),
      };
    });

    const updated = { ...event, timelinePhases: updatedPhases };
    onUpdateEvent(updated);
    onAddActivity(
      completedState ? 'Completed Milestone' : 'Unchecked Milestone',
      `Milestone task status updated by ${currentCollaborator.name}`
    );
  };

  // Toggle run of show item completed
  const handleToggleScheduleItem = (id: string) => {
    let completedState = false;
    const updatedSchedule = schedule.map((item) => {
      if (item.id === id) {
        completedState = !item.completed;
        return { ...item, completed: completedState };
      }
      return item;
    });

    const updated = { ...event, dayOfSchedule: updatedSchedule };
    onUpdateEvent(updated);
  };

  // Add Day-of Schedule Item
  const handleAddScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleItem.title?.trim()) return;

    const item: DayOfScheduleItem = {
      id: `ds-${Date.now()}`,
      time: newScheduleItem.time || '12:00 PM',
      title: newScheduleItem.title.trim(),
      location: newScheduleItem.location || 'Event Grounds',
      leadPerson: newScheduleItem.leadPerson || currentCollaborator.name,
      notes: newScheduleItem.notes || '',
      completed: false,
    };

    const updated = {
      ...event,
      dayOfSchedule: [...schedule, item].sort((a, b) => a.time.localeCompare(b.time)),
    };

    onUpdateEvent(updated);
    onAddActivity('Added Schedule Item', `Added "${item.time} - ${item.title}"`);
    setIsAddScheduleModalOpen(false);
    setNewScheduleItem({
      time: '12:00 PM',
      title: '',
      location: 'Main Pavilion',
      leadPerson: currentCollaborator.name,
      notes: '',
    });
  };

  // Add Milestone Item
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneItem.title?.trim()) return;

    const item: TimelineItem = {
      id: `t-${Date.now()}`,
      title: newMilestoneItem.title.trim(),
      description: newMilestoneItem.description || '',
      dueDate: newMilestoneItem.dueDate || '2026-10-15',
      category: newMilestoneItem.category || 'Logistics',
      assignedTo: newMilestoneItem.assignedTo || currentCollaborator.id,
      completed: false,
    };

    let updatedPhases = phases.map((phase) => {
      if (phase.id === selectedPhaseId) {
        return { ...phase, items: [...(phase.items || []), item] };
      }
      return phase;
    });

    if (updatedPhases.length === 0) {
      updatedPhases = [
        {
          id: `tp-${Date.now()}`,
          name: 'Phase 1: Planning Milestones',
          timeframe: 'Immediate Sprint',
          items: [item],
        },
      ];
    }

    const updated = { ...event, timelinePhases: updatedPhases };
    onUpdateEvent(updated);
    onAddActivity('Added Milestone Task', `Added task "${item.title}"`);
    setIsAddMilestoneModalOpen(false);
    setNewMilestoneItem({
      title: '',
      description: '',
      dueDate: '2026-10-15',
      category: 'Logistics',
      assignedTo: currentCollaborator.id,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Master Timeline & Day-of Run-of-Show
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Coordinate multi-phase planning milestones and synchronized hourly schedule
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented View Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('run_of_show')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'run_of_show'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day-of Run-of-Show
            </button>
            <button
              onClick={() => setViewMode('milestones')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'milestones'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Planning Milestones
            </button>
          </div>

          <button
            onClick={() =>
              viewMode === 'run_of_show'
                ? setIsAddScheduleModalOpen(true)
                : setIsAddMilestoneModalOpen(true)
            }
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{viewMode === 'run_of_show' ? 'Add Schedule Time' : 'Add Milestone'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Day-of Hourly Run-of-Show */}
      {viewMode === 'run_of_show' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Synchronized Run-of-Show Protocol:</strong> Times reflect live operational cues. All coordinators and vendors have access to this real-time sheet. Check off items as they complete on event day.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {schedule.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No day-of schedule cues added yet. Click &quot;Add Schedule Time&quot; above to organize your timeline!
              </div>
            ) : (
              schedule.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    item.completed ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => handleToggleScheduleItem(item.id)}
                      className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {/* Time Badge */}
                    <div className="shrink-0">
                      <span className="font-mono font-bold text-sm text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-2.5 py-1 rounded-md tabular-nums">
                        {item.time}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                      <h4 className={`text-sm sm:text-base font-bold text-slate-900 ${
                        item.completed ? 'line-through text-slate-400' : ''
                      }`}>
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.location}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Lead: <strong>{item.leadPerson}</strong>
                        </span>
                        {item.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-600 italic">{item.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                      item.completed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.completed ? 'Executed' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Multi-Phase Planning Milestones */}
      {viewMode === 'milestones' && (
        <div className="space-y-6">
          {phases.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center text-xs text-slate-500">
              No milestone phases defined yet. Click &quot;Add Milestone&quot; above to create your planning tasks!
            </div>
          ) : (
            phases.map((phase) => {
              const phaseItems = phase.items || [];
              const completedCount = phaseItems.filter((i) => i.completed).length;
              const progress = phaseItems.length
                ? Math.round((completedCount / phaseItems.length) * 100)
                : 0;

              return (
                <div key={phase.id} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                          {phase.name}
                        </h3>
                        <span className="text-xs text-indigo-600 font-medium">({phase.timeframe})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {completedCount} of {phaseItems.length} tasks completed ({progress}%)
                      </p>
                    </div>

                    <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {phaseItems.map((item) => {
                      const assignee = collaborators.find((c) => c.id === item.assignedTo);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                          item.completed ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleMilestone(phase.id, item.id)}
                            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div>
                            <div className={`text-xs sm:text-sm font-semibold text-slate-900 ${
                              item.completed ? 'line-through text-slate-400' : ''
                            }`}>
                              {item.title}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                              <span>Due {item.dueDate}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-indigo-600 font-medium">{item.category}</span>
                            </div>
                          </div>
                        </div>

                        {assignee && (
                          <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-600">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                              style={{ backgroundColor: assignee.color }}
                            >
                              {assignee.name.charAt(0)}
                            </div>
                            <span className="hidden sm:inline">{assignee.name.split(' ')[0]}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }))}
        </div>
      )}

      {/* Add Schedule Time Modal */}
      {isAddScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add Run-of-Show Activity
              </h3>
              <button onClick={() => setIsAddScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddScheduleItem} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 05:15 PM"
                    value={newScheduleItem.time}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Location / Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunset Outlook"
                    value={newScheduleItem.location}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Couple Golden Hour Sunset Shoot"
                  value={newScheduleItem.title}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Lead Responsible Person</label>
                <input
                  type="text"
                  value={newScheduleItem.leadPerson}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, leadPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Logistical Notes & Precautions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Have veil assistant ready; photographer cue audio..."
                  value={newScheduleItem.notes}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Time Cue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Task Modal */}
      {isAddMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add Planning Milestone
              </h3>
              <button onClick={() => setIsAddMilestoneModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phase</label>
                <select
                  value={selectedPhaseId}
                  onChange={(e) => setSelectedPhaseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {event.timelinePhases.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.timeframe})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finalize Bar Menu and Signature Cocktails"
                  value={newMilestoneItem.title}
                  onChange={(e) => setNewMilestoneItem({ ...newMilestoneItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newMilestoneItem.dueDate}
                    onChange={(e) => setNewMilestoneItem({ ...newMilestoneItem, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assigned Planner</label>
                  <select
                    value={newMilestoneItem.assignedTo}
                    onChange={(e) => setNewMilestoneItem({ ...newMilestoneItem, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {event.collaborators.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Schedule call with beverage director..."
                  value={newMilestoneItem.description}
                  onChange={(e) => setNewMilestoneItem({ ...newMilestoneItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMilestoneModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
