import { useState } from 'react';
import { FiChevronDown, FiExternalLink } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button } from './UIComponents';
import { formatHtmlContent, formatDate, getActionStatusBadge } from './utils';

export const TaskCard = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getTaskStatusBadge = (status) => {
    return getActionStatusBadge(status, Badge);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <h4 className="font-semibold text-sm text-gray-900">{task.title}</h4>
            <p className="text-xs text-gray-600">{task.task_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTaskStatusBadge(task.status)}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-gray-100">
              <div 
                className="text-xs text-gray-700 mb-3"
                dangerouslySetInnerHTML={{
                  __html: formatHtmlContent(task.description)
                }}
              />
              
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                {task.reward && (
                  <div>
                    <span className="font-medium text-gray-700">Reward:</span>
                    <span className="ml-2 text-gray-600">${task.reward}</span>
                  </div>
                )}
                {task.end_date && (
                  <div>
                    <span className="font-medium text-gray-700">End Date:</span>
                    <span className="ml-2 text-gray-600">{formatDate(task.end_date)}</span>
                  </div>
                )}
                {task.requires_url && (
                  <div>
                    <span className="font-medium text-gray-700">URL Required:</span>
                    <span className="ml-2 text-gray-600">{task.requires_url === 'yes' ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {task.is_repetitive && (
                  <div>
                    <span className="font-medium text-gray-700">Repetitive:</span>
                    <span className="ml-2 text-gray-600">{task.is_repetitive === 'yes' ? 'Yes' : 'No'}</span>
                  </div>
                )}
              </div>

              {task.activity_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 shadow-sm"
                  onClick={() => window.open(task.activity_url, '_blank')}
                >
                  <FiExternalLink className="w-3 h-3 mr-1" />
                  View Activity
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};