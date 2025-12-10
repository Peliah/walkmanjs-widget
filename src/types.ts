export interface Tour {
  _id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused';
  targetUrl?: string;
  theme?: Theme;
  targeting?: Targeting;
}

export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  overlayEnabled: boolean;
  overlayOpacity: number;
}

export interface Targeting {
  urlMatchType: 'exact' | 'contains' | 'regex';
  urlPattern: string;
  triggerType: 'pageload' | 'delay' | 'click';
  triggerDelay?: number;
  frequency: 'once' | 'session' | 'always';
}

export interface Step {
  _id: string;
  tourId: string;
  stepId: string;
  title: string;
  content: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  order: number;
}

export interface WidgetOptions {
  tour: Tour;
  steps: Step[];
  onStart?: () => void;
  onStepView?: (stepId: string) => void;
  onStepComplete?: (stepId: string) => void;
  onSkip?: (stepId: string) => void;
  onComplete?: () => void;
  onExit?: () => void;
}

