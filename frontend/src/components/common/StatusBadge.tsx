interface StatusBadgeProps {
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'IN' | 'OUT' | 'UNPAID' | 'PAID';
  text?: string;
}

export function StatusBadge({ status, text }: StatusBadgeProps) {
  const styles = {
    DRAFT: 'bg-[#FFF1EB] text-[#C2410C]',
    CONFIRMED: 'bg-[#EAF7EE] text-[#16803C]',
    CANCELLED: 'bg-[#FDECEC] text-[#B91C1C]',
    ACTIVE: 'bg-[#EAF7EE] text-[#16803C]',
    INACTIVE: 'bg-[#F1F3F5] text-[#6B7280]',
    LEAD: 'bg-[#FFF7E6] text-[#B45309]',
    IN: 'bg-[#EAF7EE] text-[#16803C]',
    OUT: 'bg-[#FDECEC] text-[#B91C1C]',
    UNPAID: 'bg-[#FFF7E6] text-[#B45309]',
    PAID: 'bg-[#EAF7EE] text-[#16803C]',
  };

  const displayText = text || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
      {displayText}
    </span>
  );
}