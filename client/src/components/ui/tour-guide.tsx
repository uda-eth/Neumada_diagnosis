import { useEffect } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useTour, defaultTourSteps } from '@/hooks/use-tour';
import { useToast } from '@/hooks/use-toast';

export function TourGuide() {
  const { toast } = useToast();
  const { run, steps, setRun, setSteps, reset } = useTour();

  useEffect(() => {
    // Initialize with default steps
    setSteps(defaultTourSteps);
    
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRun(true);
    }
  }, [setSteps, setRun]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      reset();
      localStorage.setItem('hasSeenTour', 'true');
      
      if (status === STATUS.FINISHED) {
        toast({
          title: "Tour Completed! 🎉",
          description: "You're all set to explore our platform. Enjoy!",
        });
      }
    }
  };

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: '#0EA5E9',
          zIndex: 1000,
        },
        tooltip: {
          fontSize: '14px',
        },
        buttonNext: {
          backgroundColor: '#0EA5E9',
        },
        buttonBack: {
          marginRight: 10,
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
}
