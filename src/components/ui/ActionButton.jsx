import React from 'react';
import { Button } from './button';
import { CheckCircle2, XCircle, FileEdit, Trash2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const ActionButtons = ({
  onApprove,
  onReject,
  onEdit,
  onView,
  onDelete,
  approveText = "Approve",
  rejectText = "Reject",
  approveIcon: ApproveIcon = CheckCircle2,
  rejectIcon: RejectIcon = XCircle,
  editIcon: EditIcon = FileEdit,
  viewIcon: ViewIcon = Eye,
  deleteIcon: DeleteIcon = Trash2,
  isDeleteDisabled = false,
  editTitle = "Edit",
  viewTitle = "View",
  deleteTitle = "Delete",
  className
}) => {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {onApprove && (
        <Button
          size="sm"
          onClick={onApprove}
          className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-white hover:text-white font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 group text-xs border-0"
        >
          <ApproveIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          {approveText}
        </Button>
      )}
      {onReject && (
        <Button
          size="sm"
          onClick={onReject}
          className="h-8 px-4 bg-rose-500 hover:bg-rose-600 text-white hover:text-white font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 group text-xs border-0"
        >
          <RejectIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          {rejectText}
        </Button>
      )}
      {onEdit && (
        <motion.button
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onEdit}
          className="p-1.5 text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
          title={editTitle}
        >
          <EditIcon className="h-5 w-5" strokeWidth={1.5} />
        </motion.button>
      )}
      {onView && (
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={onView}
          className="p-1.5 text-slate-600 hover:text-slate-700 cursor-pointer transition-colors"
          title={viewTitle}
        >
          <ViewIcon className="h-5 w-5" strokeWidth={1.5} />
        </motion.button>
      )}
      {onDelete && (
        <motion.button
          whileHover={!isDeleteDisabled ? { scale: 1.15 } : {}}
          whileTap={!isDeleteDisabled ? { scale: 0.9 } : {}}
          onClick={onDelete}
          disabled={isDeleteDisabled}
          className={cn(
            "p-1.5 transition-colors",
            isDeleteDisabled ? "text-slate-300 cursor-not-allowed opacity-50" : "text-rose-500 hover:text-rose-700 cursor-pointer"
          )}
          title={deleteTitle}
        >
          <DeleteIcon className="h-5 w-5" strokeWidth={1.5} />
        </motion.button>
      )}
    </div>
  );
};
