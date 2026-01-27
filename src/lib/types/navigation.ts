import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface NavigationItem {
  to: string;
  label: string;
  // Extracted from <Icon /> (lucide-react)
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  end?: boolean;
}
