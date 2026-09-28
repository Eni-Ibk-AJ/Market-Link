import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title, detail, icon: Icon = PackageOpen, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      <div><Icon size={26} strokeWidth={1.7} /><strong>{title}</strong>{detail && <span>{detail}</span>}</div>
    </div>
  );
}