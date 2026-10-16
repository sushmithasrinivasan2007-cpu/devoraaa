import React, { useState } from 'react';
import { Play, CheckCircle2, ArrowRight, RotateCcw, Wrench, Bell, MessageSquare, Terminal, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Role } from '../types';

interface DemoStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: Role) => void;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
  id?: string;
}

export const DemoStoryModal: React.FC<DemoStoryModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  onNavigateTab,
  onRefresh,
  id = "demo-story-modal"
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: "Switch Role to Teacher / Faculty",
      desc: "Faculty member Sarah Jenkins accesses the Devora portal to report an in-class instructional failure.",
      role: 'TEACHER' as Role,
      tab: 'maintenance',
      actionLabel: "Set Role to Teacher",
      run: async () => {
        onSelectRole('TEACHER');
        onNavigateTab('maintenance');
      }
    },
    {
      step: 2,
      title: "Teacher Reports Broken Projector",
      desc: "Report filed: 'Projector not working in Class 8A (West Wing) - HDMI signal dead.'",
      role: 'TEACHER' as Role,
      tab: 'maintenance',
      actionLabel: "Simulate Report Submission",
      run: async () => {
        await api.createMaintenance({
          title: "Projector not working in Class 8A",
          description: "The ceiling projector in Class 8A fails to power on and HDMI signal flickers constantly during lectures.",
          location: "Class 8A (West Wing, 2nd Floor)",
          reported_by_name: "Sarah Jenkins",
          reported_by_role: "TEACHER"
        });
        onRefresh();
      }
    },
    {
      step: 3,
      title: "Autonomous AI Issue Classification",
      desc: "Devora AI autonomously extracts Category: Projector/Equipment, Priority: Medium, Location: Class 8A.",
      role: 'ADMIN' as Role,
      tab: 'maintenance',
      actionLabel: "Verify AI Classification",
      run: async () => {
        onSelectRole('ADMIN');
        onNavigateTab('maintenance');
        onRefresh();
      }
    },
    {
      step: 4,
      title: "Automated Technician Assignment",
      desc: "Issue routed to Campus Maintenance Lead: Rajesh Kumar (Facilities & Maintenance).",
      role: 'ADMIN' as Role,
      tab: 'maintenance',
      actionLabel: "Inspect Assignment",
      run: async () => {
        onNavigateTab('maintenance');
        onRefresh();
      }
    },
    {
      step: 5,
      title: "In-App Alert & SMTP Email Dispatch",
      desc: "In-app notification pushed & SMTP Gateway dispatches alert to Rajesh Kumar's email (rajesh.k@devora.edu).",
      role: 'ADMIN' as Role,
      tab: 'sms',
      actionLabel: "View Mail Gateway Audit",
      run: async () => {
        onNavigateTab('sms');
        onRefresh();
      }
    },
    {
      step: 6,
      title: "Maintenance Status: Set to In Progress",
      desc: "Rajesh Kumar arrives at Class 8A and changes status from PENDING to IN PROGRESS.",
      role: 'ADMIN' as Role,
      tab: 'maintenance',
      actionLabel: "Transition → In Progress",
      run: async () => {
        const issues = await api.getMaintenance();
        const target = issues.find(i => i.title.includes("Projector"));
        if (target) {
          await api.updateMaintenanceStatus(target.id, 'IN_PROGRESS', 'Technician on site inspecting power block');
        }
        onNavigateTab('maintenance');
        onRefresh();
      }
    },
    {
      step: 7,
      title: "Maintenance Status: Set to RESOLVED",
      desc: "Projector power connector replaced and tested. Marked RESOLVED. Confirmation email dispatched to Teacher.",
      role: 'ADMIN' as Role,
      tab: 'maintenance',
      actionLabel: "Resolve Issue & Notify",
      run: async () => {
        const issues = await api.getMaintenance();
        const target = issues.find(i => i.title.includes("Projector"));
        if (target) {
          await api.updateMaintenanceStatus(target.id, 'RESOLVED', 'Connector replaced and HDMI link verified 1080p');
        }
        onNavigateTab('maintenance');
        onRefresh();
      }
    },
    {
      step: 8,
      title: "Admin Dashboard & Realtime Sync",
      desc: "Open maintenance issues count decreases immediately. Operations brief synchronizes.",
      role: 'ADMIN' as Role,
      tab: 'dashboard',
      actionLabel: "View Admin Operations Brief",
      run: async () => {
        onSelectRole('ADMIN');
        onNavigateTab('dashboard');
        onRefresh();
      }
    },
    {
      step: 9,
      title: "Ask AI Terminal Reel: 'Show unresolved campus issues'",
      desc: "Interrogate the Terminal Reel assistant with draggable controls. Receives strictly verified real database facts.",
      role: 'ADMIN' as Role,
      tab: 'terminal',
      actionLabel: "Execute Terminal Reel Query",
      run: async () => {
        onNavigateTab('terminal');
        await api.askAI("Show unresolved campus issues.", { style: 50, length: 50, tone: 50, priority: 70 });
        onRefresh();
      }
    }
  ];

  const currentStep = demoSteps[currentStepIndex];

  const handleStepAction = async () => {
    setIsExecuting(true);
    try {
      await currentStep.run();
      if (currentStepIndex < demoSteps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetDemo = async () => {
    setIsExecuting(true);
    try {
      await api.resetDemoData();
      setCurrentStepIndex(0);
      onSelectRole('ADMIN');
      onNavigateTab('dashboard');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div id={id} className="fixed inset-0 bg-[#2B2020]/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#FFF8EC] border border-[#6B1E2B]/25 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6B1E2B]/10 text-[#6B1E2B] border border-[#6B1E2B]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2B2020] tracking-tight">
                Devora AI Demo Story Walkthrough
              </h2>
              <p className="text-xs text-[#756565] font-mono">
                Official Hackathon 3-Minute Presentation Journey
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#756565] hover:text-[#2B2020] font-mono text-sm w-8 h-8 rounded-lg hover:bg-[#6B1E2B]/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#756565]">
            <span>Step {currentStep.step} of {demoSteps.length}</span>
            <span className="text-[#6B1E2B] font-bold">{Math.round(((currentStepIndex + 1) / demoSteps.length) * 100)}% Completed</span>
          </div>
          <div className="h-2.5 w-full bg-[#E8DDCA] rounded-full overflow-hidden border border-[#6B1E2B]/15">
            <div
              className="h-full bg-gradient-to-r from-[#A85C68] to-[#6B1E2B] transition-all duration-300 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / demoSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Active Step Card */}
        <div className="p-5 rounded-2xl bg-[#F3EBDD]/70 border border-[#6B1E2B]/15 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white bg-[#6B1E2B] px-2.5 py-0.5 rounded-full">
              CURRENT STEP {currentStep.step}
            </span>
            <span className="text-xs font-mono text-[#756565]">
              Role: <strong className="text-[#2B2020]">{currentStep.role}</strong>
            </span>
          </div>

          <h3 className="text-xl font-bold text-[#2B2020]">
            {currentStep.title}
          </h3>
          <p className="text-sm text-[#756565] leading-relaxed">
            {currentStep.desc}
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
            <span className="bg-[#FFF8EC] text-[#2B2020] px-2.5 py-1 rounded-lg border border-[#6B1E2B]/15 font-medium">
              Module: {currentStep.tab.toUpperCase()}
            </span>
            <span className="bg-[#5F8F68]/15 text-[#3D6B46] border border-[#5F8F68]/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live Database Wired
            </span>
          </div>
        </div>

        {/* All Steps Mini Checklist */}
        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
          {demoSteps.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'bg-[#6B1E2B] text-white border-[#6B1E2B] font-bold shadow-sm'
                  : idx < currentStepIndex
                  ? 'bg-[#5F8F68]/15 text-[#3D6B46] border-[#5F8F68]/30 font-medium'
                  : 'bg-[#FFF8EC]/90 text-[#756565] border-[#6B1E2B]/15 hover:border-[#6B1E2B]/30 hover:text-[#2B2020]'
              }`}
            >
              <div className="flex items-center gap-1">
                {idx < currentStepIndex && <CheckCircle2 className="w-3 h-3 shrink-0 text-[#5F8F68]" />}
                <span className="truncate">{s.step}. {s.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#6B1E2B]/10">
          <button
            type="button"
            disabled={isExecuting}
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 text-xs font-mono text-[#756565] hover:text-[#6B1E2B] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database to Start</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-[#756565] hover:text-[#2B2020] font-medium transition-colors cursor-pointer"
            >
              Close Guide
            </button>
            <button
              type="button"
              disabled={isExecuting}
              onClick={handleStepAction}
              className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isExecuting ? (
                <span>Executing...</span>
              ) : (
                <>
                  <span>{currentStep.actionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
