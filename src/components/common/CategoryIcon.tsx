import React from 'react';
import {
  Zap,
  Wrench,
  Sparkles,
  Hammer,
  Wind,
  Paintbrush,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

interface Props {
  iconName?: string;
  className?: string;
}

export const CategoryIcon: React.FC<Props> = ({ iconName, className = 'w-5 h-5' }) => {
  switch (iconName?.toLowerCase()) {
    case 'zap':
    case 'electrician':
      return <Zap className={className} />;
    case 'wrench':
    case 'plumber':
      return <Wrench className={className} />;
    case 'sparkles':
    case 'home-cleaning':
    case 'cleaning':
      return <Sparkles className={className} />;
    case 'hammer':
    case 'carpenter':
      return <Hammer className={className} />;
    case 'wind':
    case 'ac-repair':
      return <Wind className={className} />;
    case 'paintbrush':
    case 'painting':
      return <Paintbrush className={className} />;
    case 'cpu':
    case 'appliance-repair':
      return <Cpu className={className} />;
    case 'graduationcap':
    case 'tutoring':
      return <GraduationCap className={className} />;
    case 'shieldcheck':
      return <ShieldCheck className={className} />;
    default:
      return <Briefcase className={className} />;
  }
};
