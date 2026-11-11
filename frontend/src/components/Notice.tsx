import { X } from "lucide-react";
import type { NoticeProps } from "../interfaces/components";

export default function Notice({ message, onClose }: NoticeProps) {
  if (!message) return null;
  return <div className="notice" role="alert"><span>{message}</span><button onClick={onClose} aria-label="Dismiss"><X size={16} /></button></div>;
}
