import React, { useState } from 'react';
import { EventPlan } from '../types/event';
import { X, Printer, Link2, Check, Share2, FileText, Download } from 'lucide-react';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [copied, setCopied] = useState(false);
  const [sharePermission, setSharePermission] = useState('editor');

  if (!isOpen) return null;

  const shareUrl = `https://auraevent.ai/shared/${event.id}?role=${sharePermission}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const budgetItems = event.budgetItems || [];
  const dayOfSchedule = event.dayOfSchedule || [];
  const vendors = event.vendors || [];
  const totalBudget = Number(event.totalBudget) || 0;

  const totalAllocated = budgetItems.reduce(
    (acc, item) => acc + (Number(item.actualCost || item.estimatedCost) || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        
        {/* Header (Hidden when printing) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Export & Share Master Plan
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link Controls (no-print) */}
        <div className="py-4 border-b border-slate-100 no-print space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900">Collaborator Share Link</div>
              <div className="text-slate-500 text-[11px]">Invite team members or clients with specific permissions</div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="editor">Can Edit (Co-Planner)</option>
                <option value="viewer">Can View Only (Client / Guest)</option>
              </select>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Executive Document Area */}
        <div className="flex-1 overflow-y-auto py-4 text-xs space-y-6 print:p-0">
          
          {/* Printable Document Header */}
          <div className="border-b border-slate-200 pb-4">
            <div className="text-[11px] uppercase tracking-wider font-bold text-indigo-600 mb-1">
              AuraEvent Master Plan Brief · {(event.eventType || 'event').toUpperCase()}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              {event.title}
            </h1>
            <div className="mt-2 text-slate-600 flex flex-wrap gap-4 text-xs">
              <span><strong>Date:</strong> {event.date || 'TBD'}</span>
              <span><strong>Location:</strong> {event.location || 'TBD'}</span>
              <span><strong>Guests:</strong> {event.guestCount || 0}</span>
              <span><strong>Target Budget:</strong> ${totalBudget.toLocaleString()}</span>
            </div>
          </div>

          {/* Theme & Strategy */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="font-bold text-slate-900 mb-1">Theme & Strategic Vision</div>
            <p className="text-slate-700 leading-relaxed">{event.theme || 'Custom theme'} {event.notes ? `— ${event.notes}` : ''}</p>
          </div>

          {/* Day of Run of Show Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">
              Day-of Run-of-Show Hourly Schedule
            </h4>
            {dayOfSchedule.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 italic">
                No hourly schedule items added yet.
              </div>
            ) : (
              <table className="w-full text-left border border-slate-200 text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2 border-b border-r border-slate-200 w-24">Time</th>
                    <th className="p-2 border-b border-r border-slate-200">Activity</th>
                    <th className="p-2 border-b border-r border-slate-200">Location</th>
                    <th className="p-2 border-b border-slate-200">Lead Person</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dayOfSchedule.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2 font-mono font-bold text-indigo-700 border-r border-slate-200">{item.time}</td>
                      <td className="p-2 font-medium text-slate-900 border-r border-slate-200">{item.title}</td>
                      <td className="p-2 text-slate-600 border-r border-slate-200">{item.location}</td>
                      <td className="p-2 text-slate-600">{item.leadPerson}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Financial Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 text-sm">
                Budget Allocation Summary
              </h4>
              <span className="font-mono text-slate-700 font-medium">
                Total Committed: ${totalAllocated.toLocaleString()} / ${totalBudget.toLocaleString()}
              </span>
            </div>
            {budgetItems.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 italic">
                No budget items recorded yet.
              </div>
            ) : (
              <table className="w-full text-left border border-slate-200 text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2 border-b border-r border-slate-200">Category</th>
                    <th className="p-2 border-b border-r border-slate-200">Line Item</th>
                    <th className="p-2 border-b border-r border-slate-200 text-right">Actual Cost</th>
                    <th className="p-2 border-b border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budgetItems.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2 text-indigo-700 font-medium border-r border-slate-200">{item.category}</td>
                      <td className="p-2 text-slate-900 border-r border-slate-200">{item.title}</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-800 border-r border-slate-200">${(item.actualCost || 0).toLocaleString()}</td>
                      <td className="p-2 text-slate-600 capitalize">{(item.status || 'planned').replace(/_/g, ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Confirmed Vendors */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">
              Vendor Directory Call Sheet
            </h4>
            {vendors.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 italic">
                No vendors booked or recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {vendors.map((v) => (
                  <div key={v.id} className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                    <div className="font-bold text-slate-900">{v.name} ({v.category})</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Contact: {v.contactPerson} · {v.phone || v.email}</div>
                    <div className="text-slate-600 text-[11px] font-mono mt-0.5">Agreed Price: ${(v.finalPrice || 0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions (no-print) */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between no-print text-xs">
          <span className="text-slate-400">
            Formatted for 8.5x11 standard printing or PDF download
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
