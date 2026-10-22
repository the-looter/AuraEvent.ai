import React, { useState } from 'react';
import { EventPlan, Collaborator, CollaborativeComment } from '../types/event';
import { Users, UserCheck, MessageSquare, History, Shield, Link2, Check, Send, Plus, Sparkles, X } from 'lucide-react';

interface CollaborationPanelProps {
  event: EventPlan;
  currentCollaborator: Collaborator;
  onSwitchCollaborator: (collaborator: Collaborator) => void;
  onUpdateEvent: (updated: EventPlan) => void;
  onAddComment: (content: string, targetType?: any) => void;
  onAddActivity: (action: string, detail: string) => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  event,
  currentCollaborator,
  onSwitchCollaborator,
  onUpdateEvent,
  onAddComment,
  onAddActivity,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'team' | 'activity' | 'discussion'>('team');
  const [commentText, setCommentText] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Co-Planner');
  const [copiedLink, setCopiedLink] = useState(false);

  const collaborators = event.collaborators || [];
  const budgetItems = event.budgetItems || [];
  const timelinePhases = event.timelinePhases || [];
  const comments = event.comments || [];
  const activityLog = event.activityLog || [];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText.trim(), 'general');
    setCommentText('');
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`https://auraevent.ai/collaborate/${event.id}?role=${inviteRole.toLowerCase().replace(' ', '_')}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    onAddActivity(
      'Sent Team Invitation',
      `Invited ${inviteEmail} as ${inviteRole}`
    );
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header and Sub-Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Collaborative Planner Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-planner workspace, live presence, audit history, and team discussions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tab switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveSubTab('team')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSubTab === 'team'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Planner Team
            </button>
            <button
              onClick={() => setActiveSubTab('discussion')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSubTab === 'discussion'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Team Discussion
            </button>
            <button
              onClick={() => setActiveSubTab('activity')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSubTab === 'activity'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activity Audit
            </button>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Planner</span>
          </button>
        </div>
      </div>

      {/* Active Persona Banner (Demonstrating Collaborative Shared Editing) */}
      <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-xs"
            style={{ backgroundColor: currentCollaborator.color }}
          >
            {currentCollaborator.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>You are currently editing as:</span>
              <span className="font-semibold text-indigo-700 capitalize">{currentCollaborator.role.replace('_', ' ')}</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {currentCollaborator.name} — {currentCollaborator.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden md:inline">Switch Planner Persona:</span>
          <div className="flex items-center gap-1.5">
            {collaborators.map((c) => (
              <button
                key={c.id}
                onClick={() => onSwitchCollaborator(c)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border ${
                  c.id === currentCollaborator.id
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title={`Switch to ${c.name}`}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: Planner Team Directory */}
      {activeSubTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {collaborators.map((collaborator) => {
            // Count tasks assigned
            const assignedBudget = budgetItems.filter((b) => b.assignedTo === collaborator.id).length;
            const assignedMilestones = timelinePhases.flatMap((p) => p.items || []).filter((t) => t.assignedTo === collaborator.id).length;

            return (
              <div
                key={collaborator.id}
                className={`bg-white rounded-xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                  collaborator.id === currentCollaborator.id
                    ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-xs"
                          style={{ backgroundColor: collaborator.color }}
                        >
                          {collaborator.name.charAt(0)}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          collaborator.status === 'online'
                            ? 'bg-emerald-500'
                            : collaborator.status === 'idle'
                            ? 'bg-amber-400'
                            : 'bg-slate-300'
                        }`} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {collaborator.name}
                          </h3>
                          {collaborator.id === currentCollaborator.id && (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {collaborator.title}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-slate-500 capitalize bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {collaborator.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1 mb-4">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Currently Focused On:</span>
                      <strong className="text-indigo-700">{collaborator.currentSection || 'Overview'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Assigned Workload:</span>
                      <strong className="text-slate-800 tabular-nums">
                        {assignedBudget} budget lines · {assignedMilestones} timeline tasks
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Full Shared Editing Enabled
                  </span>
                  {collaborator.id !== currentCollaborator.id && (
                    <button
                      onClick={() => onSwitchCollaborator(collaborator)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Assume Role &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: Team Discussion */}
      {activeSubTab === 'discussion' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Live Collaborative Discussions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Messages and notes shared across all planners on this master plan
            </p>
          </div>

          {/* Comment Stream */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 divide-y divide-slate-100">
            {comments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No discussion messages posted yet. Start the conversation with your fellow planners below!
              </div>
            ) : (
              comments.map((comment) => {
                const author = collaborators.find((c) => c.id === comment.collaboratorId);
                return (
                  <div key={comment.id} className="pt-4 first:pt-0 flex items-start gap-3 text-xs">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: author?.color || '#6366f1' }}
                    >
                      {author?.name.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-semibold">{author?.name}</strong>
                          <span className="text-[11px] text-slate-500 font-medium">({author?.title})</span>
                        </div>
                        <span className="text-[11px] text-slate-400 tabular-nums">{comment.timestamp}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Post Message Input */}
          <form onSubmit={handlePostComment} className="pt-4 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder={`Write a shared comment as ${currentCollaborator.name}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 disabled:opacity-50 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: Activity Audit History */}
      {activeSubTab === 'activity' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Audit & Revision History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete chronological record of all changes, approvals, and budget rebalances
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {activityLog.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No activity recorded yet. Edits made by planners will appear here automatically.
              </div>
            ) : (
              activityLog.map((log) => {
                const user = collaborators.find((c) => c.id === log.collaboratorId);
                return (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                        style={{ backgroundColor: user?.color || '#6366f1' }}
                      >
                        {user?.name.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{user?.name}</strong>
                          <span className="text-indigo-600 font-medium">{log.action}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{log.detail}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Invite Collaborator Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Invite Planner or Host
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 pt-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Teammate Email</label>
                <input
                  type="email"
                  required
                  placeholder="planner@studio.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Collaborator Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Co-Planner">Co-Planner (Full Edit Permissions)</option>
                  <option value="Financial Lead">Financial Lead (Budget & Contracts)</option>
                  <option value="Design & Decor Specialist">Design & Decor Specialist</option>
                  <option value="Client Host">Client Host (View & Approve Only)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Direct Share Link</span>
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="flex items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-800"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-500 truncate bg-white p-2 rounded border border-slate-200">
                  https://auraevent.ai/collaborate/{event.id}?role={inviteRole.toLowerCase().replace(' ', '_')}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
