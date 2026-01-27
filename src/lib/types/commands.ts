import { COMMANDS } from "@/lib/constants/commands";

export type CommandName = (typeof COMMANDS)[keyof typeof COMMANDS];
