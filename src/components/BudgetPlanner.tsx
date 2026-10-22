import React, { useState } from 'react';
import { EventPlan, BudgetItem, BudgetCategory, Collaborator } from '../types/event';
import { Plus, Sparkles, TrendingUp, DollarSign, Filter, Trash2, Edit3, MessageSquare, Check, X } from 'lucide-react';
import { optimizeBudgetAI } from '../services/geminiService';

interface BudgetPlannerProps {
  event: EventPlan;
  currentCollaborator: Collaborator;
  onUpdateEvent: (updated: EventPlan) => void;
  onAddActivity: (action: string, detail: string) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  event,
  currentCollaborator,
  onUpdateEvent,
  onAddActivity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  
  // AI Optimizer State
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  // New item form state
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({
    category: 'Catering & Bar',
    title: '',
    estimatedCost: 1000,
    actualCost: 1000,
    paidAmount: 0,
    status: 'planned',
    priority: 'essential',
    assignedTo: currentCollaborator.id,
    notes: '',
  });

  const categories: ('All' | BudgetCategory)[] = [
    'All',
    'Venue',
    'Catering & Bar',
    'Decor & Florals',
    'Photography & Video',
    'Music & Entertainment',
    'Rentals & Attire',
    'Permits & Security',
    'Contingency',
    'Other',
  ];

  // Safe array references
  const items = event.budgetItems || [];
  const collaborators = event.collaborators || [];

  // Calculations
  const totalEstimated = items.reduce((acc, item) => acc + (Number(item.estimatedCost) || 0), 0);
  const totalActual = items.reduce((acc, item) => acc + (Number(item.actualCost) || 0), 0);
  const totalPaid = items.reduce((acc, item) => acc + (Number(item.paidAmount) || 0), 0);
  const remainingBudget = event.totalBudget - totalActual;

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((i) => i.category === selectedCategory);

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title?.trim()) return;

    const item: BudgetItem = {
      id: `b-${Date.now()}`,
      category: (newItem.category as BudgetCategory) || 'Other',
      title: newItem.title.trim(),
      estimatedCost: Number(newItem.estimatedCost) || 0,
      actualCost: Number(newItem.actualCost) || 0,
      paidAmount: Number(newItem.paidAmount) || 0,
      status: newItem.status as any || 'planned',
      priority: newItem.priority as any || 'essential',
      assignedTo: newItem.assignedTo || currentCollaborator.id,
      notes: newItem.notes || '',
    };

    const updated = {
      ...event,
      budgetItems: [...items, item],
    };

    onUpdateEvent(updated);
    onAddActivity('Added Budget Item', `Added "${item.title}" ($${item.estimatedCost.toLocaleString()})`);
    setIsAddModalOpen(false);
    setNewItem({
      category: 'Catering & Bar',
      title: '',
      estimatedCost: 1000,
      actualCost: 1000,
      paidAmount: 0,
      status: 'planned',
      priority: 'essential',
      assignedTo: currentCollaborator.id,
      notes: '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedItems = items.map((item) =>
      item.id === editingItem.id ? editingItem : item
    );

    const updated = {
      ...event,
      budgetItems: updatedItems,
    };

    onUpdateEvent(updated);
    onAddActivity('Updated Budget Item', `Edited "${editingItem.title}"`);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string, title: string) => {
    const updated = {
      ...event,
      budgetItems: items.filter((i) => i.id !== id),
    };
    onUpdateEvent(updated);
    onAddActivity('Removed Budget Item', `Deleted "${title}"`);
  };

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    setIsOptimizerOpen(true);
    const result = await optimizeBudgetAI({
      eventTitle: event.title,
      totalBudget: event.totalBudget,
      budgetItems: items,
      guestCount: event.guestCount,
    });
    setOptimizationResult(result);
    setIsOptimizing(false);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner & KPI Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Budget Master & Financial Optimizer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track line-item allocations, paid deposits, and run AI cost-saving optimizations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunOptimization}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Budget Optimizer</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">Target Budget</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums mt-1">
            ${event.totalBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Overall spending cap</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">Actual Committed</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums mt-1">
            ${totalActual.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Est: ${totalEstimated.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">Deposits Paid</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            ${totalPaid.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ${(totalActual - totalPaid).toLocaleString()} pending
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">Remaining Buffer</div>
          <div className={`text-xl sm:text-2xl font-bold tabular-nums mt-1 ${
            remainingBudget >= 0 ? 'text-indigo-600' : 'text-rose-600'
          }`}>
            ${remainingBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {remainingBudget >= 0 ? 'Within budget bounds' : 'Exceeds budget cap'}
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Budget Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">Line Item & Category</th>
                <th className="py-3 px-4 text-right">Estimated</th>
                <th className="py-3 px-4 text-right">Actual</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No budget items found in this category. Click &quot;Add Item&quot; to create one.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const assignee = event.collaborators.find((c) => c.id === item.assignedTo);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-indigo-600">{item.category}</span>
                          {item.notes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-xs text-slate-400">{item.notes}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700 tabular-nums">
                        ${item.estimatedCost.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${item.actualCost.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-emerald-700 font-medium tabular-nums">
                        ${item.paidAmount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block text-[11px] font-medium capitalize ${
                          item.status === 'paid_in_full'
                            ? 'text-emerald-700'
                            : item.status === 'deposit_paid'
                            ? 'text-sky-700'
                            : item.status === 'negotiating'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-500 capitalize">
                          {item.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: assignee?.color || '#6366f1' }}
                          >
                            {assignee?.name.charAt(0) || 'P'}
                          </div>
                          <span className="text-[11px] text-slate-700 truncate max-w-[100px]">
                            {assignee?.name.split(' ')[0] || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={`Edit ${item.title}`}
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                            aria-label={`Delete ${item.title}`}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Budget Optimization Insights Drawer / Modal */}
      {isOptimizerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="optimizer-modal-title"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600" aria-hidden="true">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 id="optimizer-modal-title" className="text-base font-bold text-slate-900 font-display">
                  AI Financial & Optimization Analysis
                </h3>
              </div>
              <button
                onClick={() => setIsOptimizerOpen(false)}
                aria-label="Close financial analysis modal"
                className="text-slate-400 hover:text-slate-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {isOptimizing ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-600">
                  Analyzing line items, caterer ratios, and contract savings opportunities...
                </p>
              </div>
            ) : optimizationResult ? (
              <div className="space-y-6 pt-4 text-xs">
                
                {/* Health & Savings Overview */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div>
                    <div className="text-slate-500">Allocation Health</div>
                    <div className="text-sm font-bold text-indigo-900 mt-0.5">
                      {optimizationResult.summaryScore || 'Balanced Allocation'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Estimated Savings Potential</div>
                    <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5">
                      +${(optimizationResult.savingsPotential || 1800).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Strategic Cost Saving Recommendations */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-3">
                    Actionable Rebalance Recommendations
                  </h4>
                  <div className="space-y-3">
                    {optimizationResult.strategicTips?.map((tip: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-indigo-700">{tip.category}</span>
                          {tip.estimatedSavings && (
                            <span className="font-mono text-emerald-700 font-semibold">
                              Save ~${tip.estimatedSavings}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{tip.recommendation}</p>
                        <p className="text-slate-400 text-[11px]">{tip.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vendor Negotiation Levers */}
                {optimizationResult.vendorNegotiationTips && (
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">
                      High-Leverage Vendor Negotiation Scripts
                    </h4>
                    <ul className="space-y-2 list-disc list-inside text-slate-600 leading-relaxed">
                      {optimizationResult.vendorNegotiationTips.map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contingency Rationale */}
                {optimizationResult.contingencyAssessment && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                    <strong>Contingency Reserve:</strong> {optimizationResult.contingencyAssessment}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsOptimizerOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                  >
                    Close Analysis
                  </button>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add Budget Item
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Cake & Dessert Tier"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="essential">Essential</option>
                    <option value="recommended">Recommended</option>
                    <option value="luxury">Luxury / Optional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Estimated ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.estimatedCost}
                    onChange={(e) => setNewItem({ ...newItem, estimatedCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Actual ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.actualCost}
                    onChange={(e) => setNewItem({ ...newItem, actualCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Paid ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.paidAmount}
                    onChange={(e) => setNewItem({ ...newItem, paidAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="planned">Planned</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="paid_in_full">Paid in Full</option>
                    <option value="negotiating">Negotiating</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assigned Collaborator</label>
                  <select
                    value={newItem.assignedTo}
                    onChange={(e) => setNewItem({ ...newItem, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {event.collaborators.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.title})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes / Scope Rationale</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Quoted includes delivery fee and tax..."
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Edit Budget Item
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={editingItem.priority}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="essential">Essential</option>
                    <option value="recommended">Recommended</option>
                    <option value="luxury">Luxury / Optional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Estimated ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.estimatedCost}
                    onChange={(e) => setEditingItem({ ...editingItem, estimatedCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Actual ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.actualCost}
                    onChange={(e) => setEditingItem({ ...editingItem, actualCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Paid ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.paidAmount}
                    onChange={(e) => setEditingItem({ ...editingItem, paidAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="planned">Planned</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="paid_in_full">Paid in Full</option>
                    <option value="negotiating">Negotiating</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assigned Collaborator</label>
                  <select
                    value={editingItem.assignedTo}
                    onChange={(e) => setEditingItem({ ...editingItem, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {event.collaborators.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
