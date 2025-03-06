import { create } from 'zustand';
import { Step } from 'react-joyride';

interface TourState {
  isOpen: boolean;
  currentStep: number;
  steps: Step[];
  run: boolean;
  setRun: (run: boolean) => void;
  setSteps: (steps: Step[]) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

export const useTour = create<TourState>((set) => ({
  isOpen: false,
  currentStep: 0,
  run: false,
  steps: [],
  setRun: (run) => set({ run }),
  setSteps: (steps) => set({ steps }),
  setCurrentStep: (step) => set({ currentStep: step }),
  reset: () => set({ currentStep: 0, run: false }),
}));

// Default tour steps that will be used across the application
export const defaultTourSteps: Step[] = [
  {
    target: '.tour-discover',
    content: 'Discover upcoming events & happenings in your desired location',
    disableBeacon: true,
  },
  {
    target: '.tour-connect',
    content: 'Connect with like-vibe individuals and communities effortlessly',
  },
  {
    target: '.tour-create',
    content: 'Create or promote your event in minutes',
  },
  {
    target: '.tour-concierge',
    content: 'Utilize our chat-based Concierge for recs, city guides and more',
  },
];