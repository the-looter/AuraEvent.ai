/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EventPlan, Collaborator, CollaborativeComment, ActivityLogItem } from './types/event';
import { INITIAL_EVENTS, DEFAULT_COLLABORATORS, createDefaultEvent } from './data/mockEvents';
import { Header } from './components/Header';
import { EventOverview } from './components/EventOverview';
import { BudgetPlanner } from './components/BudgetPlanner';
import { TimelineManager } from './components/TimelineManager';
import { VendorHub } from './components/VendorHub';
import { CreativeIdeasBoard } from './components/CreativeIdeasBoard';
import { CollaborationPanel } from './components/CollaborationPanel';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { CreateEventModal } from './components/CreateEventModal';
import { ExportShareModal } from './components/ExportShareModal';

export default function App() {
  // Load events from localStorage or initialize with user-customizable starter plan
  const [events, setEvents] = useState<EventPlan[]>(() => {
    try {
      const saved = localStorage.getItem('auraevent_user_plans_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse saved events:', e);
    }
    return INITIAL_EVENTS;
  });

  const [currentEventId, setCurrentEventId] = useState<string>(
    events[0]?.id || INITIAL_EVENTS[0].id
  );

  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Active Planner persona (Elena Rostova / Lead Planner by default)
  const [currentCollaborator, setCurrentCollaborator] = useState<Collaborator>(
    DEFAULT_COLLABORATORS[0]
  );

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (events.length > 0) {
        localStorage.setItem('auraevent_user_plans_v4', JSON.stringify(events));
      }
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [events]);

  // Guaranteed current event: fallback to newly created event if array was emptied
  const currentEvent: EventPlan = 
    events.find((e) => e.id === currentEventId) || 
    events[0] || 
    createDefaultEvent('wedding');

  // If events somehow became empty, re-seed with clean default event
  useEffect(() => {
    if (events.length === 0) {
      const fresh = [createDefaultEvent('wedding')];
      setEvents(fresh);
      setCurrentEventId(fresh[0].id);
    }
  }, [events]);

  // Update current event
  const handleUpdateEvent = (updated: EventPlan) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  };

  // Add activity log entry
  const handleAddActivity = (action: string, detail: string) => {
    const newLog: ActivityLogItem = {
      id: `al-${Date.now()}`,
      collaboratorId: currentCollaborator.id,
      action,
      detail,
      timestamp: 'Just now',
    };

    const updated = {
      ...currentEvent,
      activityLog: [newLog, ...(currentEvent.activityLog || [])],
    };

    handleUpdateEvent(updated);
  };

  // Add comment entry
  const handleAddComment = (content: string, targetType: any = 'general') => {
    const newComment: CollaborativeComment = {
      id: `c-${Date.now()}`,
      collaboratorId: currentCollaborator.id,
      targetType,
      content,
      timestamp: 'Just now',
    };

    const updated = {
      ...currentEvent,
      comments: [newComment, ...(currentEvent.comments || [])],
    };

    handleUpdateEvent(updated);
    handleAddActivity('Posted Team Comment', `"${content.slice(0, 40)}..."`);
  };

  // Handle new event creation based on user inputs
  const handleEventCreated = (newEvent: EventPlan) => {
    setEvents((prev) => [newEvent, ...prev]);
    setCurrentEventId(newEvent.id);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentEvent={currentEvent}
        events={events}
        onSelectEvent={(ev) => setCurrentEventId(ev.id)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        currentCollaborator={currentCollaborator}
        onSwitchCollaborator={setCurrentCollaborator}
      />

      {/* Main Content Area - Fully Interactive across ALL Tabs */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <EventOverview
            event={currentEvent}
            onNavigateTab={setActiveTab}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            onOpenOptimizeModal={() => setActiveTab('budget')}
            currentCollaborator={currentCollaborator}
            onAddComment={handleAddComment}
            onUpdateEvent={handleUpdateEvent}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlanner
            event={currentEvent}
            currentCollaborator={currentCollaborator}
            onUpdateEvent={handleUpdateEvent}
            onAddActivity={handleAddActivity}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineManager
            event={currentEvent}
            currentCollaborator={currentCollaborator}
            onUpdateEvent={handleUpdateEvent}
            onAddActivity={handleAddActivity}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorHub
            event={currentEvent}
            currentCollaborator={currentCollaborator}
            onUpdateEvent={handleUpdateEvent}
            onAddActivity={handleAddActivity}
          />
        )}

        {activeTab === 'ideas' && (
          <CreativeIdeasBoard
            event={currentEvent}
            currentCollaborator={currentCollaborator}
            onUpdateEvent={handleUpdateEvent}
            onAddActivity={handleAddActivity}
          />
        )}

        {activeTab === 'chatbot' && (
          <GeminiChatbot
            event={currentEvent}
            currentCollaborator={currentCollaborator}
            onUpdateEvent={handleUpdateEvent}
            onAddActivity={handleAddActivity}
          />
        )}

        {activeTab === 'team' && (
          <CollaborationPanel
            event={currentEvent}
            currentCollaborator={currentCollaborator}
            onSwitchCollaborator={setCurrentCollaborator}
            onUpdateEvent={handleUpdateEvent}
            onAddComment={handleAddComment}
            onAddActivity={handleAddActivity}
          />
        )}
      </main>

      {/* AI Assistant Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        event={currentEvent}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Export & Share Modal */}
      <ExportShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        event={currentEvent}
      />
    </div>
  );
}
