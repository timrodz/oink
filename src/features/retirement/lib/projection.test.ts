import { getProjectionStatus } from "@/features/retirement/lib/projection";

const onTrack = getProjectionStatus(3200, 3100);
const shortfall = getProjectionStatus(2500, 3100);

if (onTrack !== "onTrack") {
  throw new Error("Expected onTrack status for higher income.");
}

if (shortfall !== "shortfall") {
  throw new Error("Expected shortfall status for lower income.");
}
