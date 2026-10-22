import React, { useState } from 'react';
import { EventPlan, VendorItem, VendorStatus, Collaborator } from '../types/event';
import { Plus, Mail, Phone, Sparkles, Star, CheckCircle, ExternalLink, Trash2, Edit3, X, Copy, Check } from 'lucide-react';
import { draftVendorEmailAI } from '../services/geminiService';

interface VendorHubProps {
  event: EventPlan;
  currentCollaborator: Collaborator;
  onUpdateEvent: (updated: EventPlan) => void;
  onAddActivity: (action: string, detail: string) => void;
}

export const VendorHub: React.FC<VendorHubProps> = ({
  event,
  currentCollaborator,
  onUpdateEvent,
  onAddActivity,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedVendorForEmail, setSelectedVendorForEmail] = useState<VendorItem | null>(null);
  const [emailGoal, setEmailGoal] = useState<string>('Negotiate 10% courtesy discount');
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // New Vendor Form State
  const [newVendor, setNewVendor] = useState<Partial<VendorItem>>({
    category: 'Catering & Bar',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    quotedPrice: 3500,
    finalPrice: 3500,
    status: 'proposal_received',
    rating: 5,
    notes: '',
    tags: ['Professional', 'Recommended'],
  });

  const statuses: ('All' | VendorStatus)[] = [
    'All',
    'researching',
    'contacted',
    'proposal_received',
    'contract_signed',
    'paid',
  ];

  const vendors = event.vendors || [];

  const filteredVendors = selectedStatus === 'All'
    ? vendors
    : vendors.filter((v) => v.status === selectedStatus);

  const handleStatusChange = (vendorId: string, newStatus: VendorStatus) => {
    const updated = {
      ...event,
      vendors: vendors.map((v) =>
        v.id === vendorId ? { ...v, status: newStatus } : v
      ),
    };
    onUpdateEvent(updated);
    onAddActivity('Updated Vendor Status', `Status set to ${newStatus.replace('_', ' ')}`);
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name?.trim()) return;

    const vendor: VendorItem = {
      id: `v-${Date.now()}`,
      category: newVendor.category || 'General',
      name: newVendor.name.trim(),
      contactPerson: newVendor.contactPerson || 'Coordinator',
      email: newVendor.email || '',
      phone: newVendor.phone || '',
      quotedPrice: Number(newVendor.quotedPrice) || 0,
      finalPrice: Number(newVendor.finalPrice || newVendor.quotedPrice) || 0,
      status: (newVendor.status as VendorStatus) || 'proposal_received',
      rating: Number(newVendor.rating) || 5,
      notes: newVendor.notes || '',
      tags: newVendor.tags || ['Verified'],
    };

    const updated = {
      ...event,
      vendors: [...vendors, vendor],
    };

    onUpdateEvent(updated);
    onAddActivity('Added Vendor', `Added "${vendor.name}" (${vendor.category})`);
    setIsAddModalOpen(false);
    setNewVendor({
      category: 'Catering & Bar',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      quotedPrice: 3500,
      finalPrice: 3500,
      status: 'proposal_received',
      rating: 5,
      notes: '',
      tags: ['Professional'],
    });
  };

  const handleDeleteVendor = (id: string, name: string) => {
    const updated = {
      ...event,
      vendors: vendors.filter((v) => v.id !== id),
    };
    onUpdateEvent(updated);
    onAddActivity('Removed Vendor', `Deleted "${name}"`);
  };

  const handleOpenEmailGenerator = async (vendor: VendorItem) => {
    setSelectedVendorForEmail(vendor);
    setIsEmailModalOpen(true);
    setIsGeneratingEmail(true);
    setGeneratedEmail('');
    setCopiedEmail(false);

    const email = await draftVendorEmailAI({
      vendor,
      eventContext: event,
      emailGoal,
    });

    setGeneratedEmail(email);
    setIsGeneratingEmail(false);
  };

  const handleRegenerateEmail = async () => {
    if (!selectedVendorForEmail) return;
    setIsGeneratingEmail(true);
    setCopiedEmail(false);

    const email = await draftVendorEmailAI({
      vendor: selectedVendorForEmail,
      eventContext: event,
      emailGoal,
    });

    setGeneratedEmail(email);
    setIsGeneratingEmail(false);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Vendor Directory & Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage partner quotes, contracts, contact sheets, and generate AI negotiation emails
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-xs">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
              selectedStatus === status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No vendors found in this status category.
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-indigo-700">
                    {vendor.category}
                  </span>
                  
                  {/* Status Dropdown */}
                  <select
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                    className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-md py-0.5 px-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-700 capitalize"
                  >
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="proposal_received">Proposal</option>
                    <option value="contract_signed">Contract Signed</option>
                    <option value="paid">Paid in Full</option>
                  </select>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {vendor.name}
                </h3>

                <p className="text-xs text-slate-500 mb-3">
                  Contact: <strong className="text-slate-800">{vendor.contactPerson}</strong>
                </p>

                {/* Financial comparison */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[11px] text-slate-400">Quoted Price</div>
                    <div className="font-mono text-slate-600 font-medium tabular-nums">
                      ${vendor.quotedPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Agreed Price</div>
                    <div className="font-mono font-bold text-slate-900 tabular-nums">
                      ${vendor.finalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Contact Links */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  {vendor.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${vendor.email}`} className="hover:text-indigo-600 truncate">
                        {vendor.email}
                      </a>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {vendor.notes && (
                  <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100/50 mb-3 leading-relaxed">
                    {vendor.notes}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {vendor.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-slate-500 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => handleOpenEmailGenerator(vendor)}
                  className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Email Draft</span>
                </button>

                <button
                  onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Delete Vendor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Vendor Negotiation Email Modal */}
      {isEmailModalOpen && selectedVendorForEmail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  AI Vendor Communication Assistant
                </h3>
              </div>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs flex-1 overflow-y-auto">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Goal / Angle</label>
                <div className="flex gap-2">
                  <select
                    value={emailGoal}
                    onChange={(e) => setEmailGoal(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                  >
                    <option value="Negotiate 10% courtesy discount in exchange for fast contract signing">
                      Negotiate 10% discount for fast contract signing
                    </option>
                    <option value="Inquire about availability and request comprehensive package breakdown">
                      Inquire about availability & scope breakdown
                    </option>
                    <option value="Request complimentary setup or waiver of travel/curfew fees">
                      Request complimentary setup or waiver of extra fees
                    </option>
                    <option value="Confirm load-in timing, electrical specs, and call-sheet details">
                      Confirm load-in schedule and power requirements
                    </option>
                  </select>
                  <button
                    onClick={handleRegenerateEmail}
                    disabled={isGeneratingEmail}
                    className="px-3 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              {isGeneratingEmail ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-500">Drafting personalized negotiation letter with Gemini...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Ready to Send:</span>
                    <button
                      onClick={handleCopyEmail}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Email'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={generatedEmail}
                    onChange={(e) => setGeneratedEmail(e.target.value)}
                    className="w-full p-3 font-sans text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed text-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add Vendor Partner
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Company / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golden State Sound & Lighting"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newVendor.category}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering & Bar">Catering & Bar</option>
                    <option value="Florals & Styling">Florals & Styling</option>
                    <option value="Photo & Video">Photo & Video</option>
                    <option value="Live Music & DJ">Live Music & DJ</option>
                    <option value="Production & Rentals">Production & Rentals</option>
                    <option value="Permits & Safety">Permits & Safety</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={newVendor.status}
                    onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="proposal_received">Proposal Received</option>
                    <option value="contract_signed">Contract Signed</option>
                    <option value="paid">Paid in Full</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Rachel Adams"
                    value={newVendor.contactPerson}
                    onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. (555) 012-3456"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="contact@vendor.com"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Quoted ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newVendor.quotedPrice}
                    onChange={(e) => setNewVendor({ ...newVendor, quotedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Final Agreed ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newVendor.finalPrice}
                    onChange={(e) => setNewVendor({ ...newVendor, finalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Special Notes / Deliverables</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Includes delivery, staging, and late-night breakdown..."
                  value={newVendor.notes}
                  onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
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
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
