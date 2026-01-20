import { cn } from "@/lib/utils";
import { usePrivacy } from "@/providers/privacy-provider";

interface PrivateValueProps {
  value: string | number;
  className?: string;
  mask?: string;
}

const DEFAULT_MASK = "***";

export function PrivateValue({
  value,
  className,
  mask = DEFAULT_MASK,
}: PrivateValueProps) {
  const { isPrivacyMode } = usePrivacy();

  if (isPrivacyMode) {
    return <span className={cn("font-mono", className)}>{mask}</span>;
  }

  return <span className={className}>{value}</span>;
}
