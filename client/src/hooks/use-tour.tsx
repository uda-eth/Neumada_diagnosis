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
    content: 'Discover exciting events and connect with fellow digital nomads in your city',
    disableBeacon: true,
  },
  {
    target: '.tour-connect',
    content: 'Connect with like-minded professionals and expand your network',
  },
  {
    target: '.tour-create',
    content: 'Create and host your own events to share your passions with the community',
  },
  {
    target: '.tour-concierge',
    content: 'Get personalized recommendations and assistance from our AI concierge',
  },
];
