import {
  FilePlus,
  Pencil,
  Eye,
  RotateCcw,
  ArrowRight,
  Trash2,
  Check,
  Loader2,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StrReplaceCommand = "view" | "create" | "str_replace" | "insert" | "undo_edit";
type FileManagerCommand = "rename" | "delete";

interface OperationConfig {
  Icon: React.ElementType;
  pendingLabel: string;
  doneLabel: string;
  iconClass: string;
  bgClass: string;
  borderClass: string;
}

const STR_REPLACE_CONFIGS: Record<StrReplaceCommand, OperationConfig> = {
  create: {
    Icon: FilePlus,
    pendingLabel: "Creating",
    doneLabel: "Created",
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-100",
  },
  str_replace: {
    Icon: Pencil,
    pendingLabel: "Editing",
    doneLabel: "Edited",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-100",
  },
  insert: {
    Icon: Pencil,
    pendingLabel: "Editing",
    doneLabel: "Edited",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-100",
  },
  view: {
    Icon: Eye,
    pendingLabel: "Reading",
    doneLabel: "Read",
    iconClass: "text-neutral-400",
    bgClass: "bg-neutral-50",
    borderClass: "border-neutral-200",
  },
  undo_edit: {
    Icon: RotateCcw,
    pendingLabel: "Reverting",
    doneLabel: "Reverted",
    iconClass: "text-purple-500",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-100",
  },
};

const FILE_MANAGER_CONFIGS: Record<FileManagerCommand, OperationConfig> = {
  rename: {
    Icon: ArrowRight,
    pendingLabel: "Renaming",
    doneLabel: "Renamed",
    iconClass: "text-purple-500",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-100",
  },
  delete: {
    Icon: Trash2,
    pendingLabel: "Deleting",
    doneLabel: "Deleted",
    iconClass: "text-red-500",
    bgClass: "bg-red-50",
    borderClass: "border-red-100",
  },
};

function getFileName(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export interface ToolCallDisplayProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "partial-call" | "call" | "result";
}

export function ToolCallDisplay({ toolName, args, state }: ToolCallDisplayProps) {
  const isDone = state === "result";

  let config: OperationConfig | undefined;
  let filePath: string | undefined;

  if (toolName === "str_replace_editor") {
    const command = args.command as StrReplaceCommand | undefined;
    const path = args.path as string | undefined;
    if (command) config = STR_REPLACE_CONFIGS[command];
    filePath = path;
  } else if (toolName === "file_manager") {
    const command = args.command as FileManagerCommand | undefined;
    const path = args.path as string | undefined;
    if (command) config = FILE_MANAGER_CONFIGS[command];
    filePath = path;
  }

  if (!config || !filePath) {
    return (
      <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
        <File className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
        <span className="text-neutral-600">{toolName}</span>
        {isDone ? (
          <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
        ) : (
          <Loader2 className="w-3 h-3 animate-spin text-blue-500 flex-shrink-0" />
        )}
      </div>
    );
  }

  const { Icon, pendingLabel, doneLabel, iconClass, bgClass, borderClass } = config;
  const label = isDone ? doneLabel : pendingLabel;
  const fileName = getFileName(filePath);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-xs border",
        bgClass,
        borderClass
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", iconClass)} />
      <span className="text-neutral-600 font-medium">{label}</span>
      <span className="font-mono text-neutral-800">{fileName}</span>
      {isDone ? (
        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-500 flex-shrink-0" />
      )}
    </div>
  );
}
