import { useState, useRef } from 'react';
import { FiActivity, FiChevronDown } from 'react-icons/fi';
import { formatHtmlContent, formatDate } from './utils';

export const TasksAccordion = ({ tasks }) => {
  const [openItem, setOpenItem] = useState(null);
  const contentRefs = useRef({});

  const toggleItem = (id) => {
    setOpenItem((current) => (current === id ? null : id));
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiActivity className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">No tasks found for this campaign.</p>
      </div>
    );
  }

  // Get unique tasks based on task_id
  const uniqueTasks = tasks.reduce((acc, task) => {
    if (!acc.find(t => t.task_id === task.task_id)) {
      acc.push(task);
    }
    return acc;
  }, []);

  return (
    <div className="space-y-3">
      {uniqueTasks.map((task, index) => {
        const isOpen = openItem === task.task_id;
        
        return (
          <div
            key={task.task_id}
            className="group border-b border-black/10 overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleItem(task.task_id)}
              className="flex items-center justify-between w-full px-4 py-3 bg-transparent text-left group-data-[state=open]:bg-black/[0.04] transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-medium">
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs">
                  TASK {index + 1}
                </span>
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {/* Content wrapper with smooth animation */}
            <div
              style={{
                height: isOpen ? 'auto' : 0,
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <div
                ref={(el) => {
                  contentRefs.current[task.task_id] = el;
                }}
                className="relative px-4 py-3 text-sm text-black dark:text-white border-t border-black/10 dark:border-white/10 before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-black dark:before:bg-white before:opacity-100 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div 
                    className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: formatHtmlContent(task.description)
                    }}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-600">{task.task_type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Reward:</span>
                      <span className="ml-2 text-gray-600">${task.reward}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">End Date:</span>
                      <span className="ml-2 text-gray-600">{formatDate(task.end_date)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">URL Required:</span>
                      <span className="ml-2 text-gray-600">{task.requires_url === 'yes' ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};