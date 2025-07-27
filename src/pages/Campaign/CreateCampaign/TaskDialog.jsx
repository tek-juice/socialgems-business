import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

const TaskDialog = ({
  isOpen,
  onClose,
  newTask,
  setNewTask,
  onAddTask,
  editingTaskIndex,
  socialSites
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isOpen) return null;

  const isRepetitive = newTask.task_type === "repetitive";

  // Conditional rendering based on screen size
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] bg-white border-none">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader className="pb-4">
              <DrawerTitle className="text-lg font-bold text-gray-900">
                {editingTaskIndex !== null ? "Edit Task" : "Add New Task"}
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                {editingTaskIndex !== null ? "Edit task details" : "Add a new task to the campaign"}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6 overflow-y-auto max-h-[75vh] pb-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.task}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, task: e.target.value }))
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors text-xs"
                    placeholder="e.g., Create Instagram post showcasing our product"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Task Description *
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors resize-none text-xs"
                    rows="4"
                    placeholder="Provide detailed instructions for what the creator needs to do..."
                  />
                </div>

                {/* Responsive grid that adapts based on task type */}
                <div className={`grid gap-4 transition-all duration-300 ${
                  isRepetitive 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Target Platform *
                    </label>
                    <select
                      value={newTask.site_id}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          site_id: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors text-xs bg-white"
                      required
                    >
                      <option value="">Select Platform</option>
                      {socialSites.map((site) => (
                        <option key={site.site_id} value={site.site_id}>
                          {site.sm_name || site.site_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Task Type *
                    </label>
                    <select
                      value={newTask.task_type}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          task_type: e.target.value,
                          // Reset repeat frequency when changing task type
                          repeats_after: e.target.value === "one_time" ? "" : prev.repeats_after
                        }))
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors text-xs bg-white"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="one_time">One-time</option>
                      <option value="repetitive">Repetitive</option>
                    </select>
                  </div>

                  {/* Conditionally render Repeat Frequency with smooth animation */}
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isRepetitive ? 1 : 0,
                      scale: isRepetitive ? 1 : 0.95,
                      height: isRepetitive ? "auto" : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className={`overflow-hidden ${!isRepetitive ? 'pointer-events-none' : ''}`}
                  >
                    {isRepetitive && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Repeat Frequency *
                        </label>
                        <select
                          value={newTask.repeats_after}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              repeats_after: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors text-xs bg-white"
                          required={isRepetitive}
                        >
                          <option value="">Select Frequency</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    )}
                  </motion.div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="requires_url"
                    checked={newTask.requires_url}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        requires_url: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="requires_url" className="text-xs text-gray-700">
                    Requires URL submission (post link, story link, etc.)
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pb-8">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onAddTask}
                    disabled={
                      !newTask.task.trim() || 
                      !newTask.description.trim() || 
                      !newTask.site_id || 
                      !newTask.task_type ||
                      (isRepetitive && !newTask.repeats_after)
                    }
                    className="flex-1 px-4 py-3 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
                  >
                    {editingTaskIndex !== null ? "Update Task" : "Add Task"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop/Tablet Modal
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {editingTaskIndex !== null ? "Edit Task" : "Add New Task"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={newTask.task}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, task: e.target.value }))
              }
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors text-xs"
              placeholder="e.g., Create Instagram post showcasing our product"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Task Description *
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors resize-none text-xs"
              rows="4"
              placeholder="Provide detailed instructions for what the creator needs to do..."
            />
          </div>

          {/* Responsive grid that adapts based on task type */}
          <div className={`grid gap-4 transition-all duration-300 ${
            isRepetitive 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2'
          }`}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Target Platform *
              </label>
              <select
                value={newTask.site_id}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    site_id: e.target.value,
                  }))
                }
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors text-xs bg-white"
                required
              >
                <option value="">Select Platform</option>
                {socialSites.map((site) => (
                  <option key={site.site_id} value={site.site_id}>
                    {site.sm_name || site.site_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Task Type *
              </label>
              <select
                value={newTask.task_type}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    task_type: e.target.value,
                    // Reset repeat frequency when changing task type
                    repeats_after: e.target.value === "one_time" ? "" : prev.repeats_after
                  }))
                }
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors text-xs bg-white"
                required
              >
                <option value="">Select Type</option>
                <option value="one_time">One-time</option>
                <option value="repetitive">Repetitive</option>
              </select>
            </div>

            {/* Conditionally render Repeat Frequency with smooth animation */}
            <motion.div
              initial={false}
              animate={{
                opacity: isRepetitive ? 1 : 0,
                scale: isRepetitive ? 1 : 0.95,
                height: isRepetitive ? "auto" : 0
              }}
              transition={{ duration: 0.3 }}
              className={`overflow-hidden ${!isRepetitive ? 'pointer-events-none' : ''}`}
            >
              {isRepetitive && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Repeat Frequency *
                  </label>
                  <select
                    value={newTask.repeats_after}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        repeats_after: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors text-xs bg-white"
                    required={isRepetitive}
                  >
                    <option value="">Select Frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="requires_url"
              checked={newTask.requires_url}
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  requires_url: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="requires_url" className="text-xs text-gray-700">
              Requires URL submission (post link, story link, etc.)
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs"
          >
            Cancel
          </button>
          <button
            onClick={onAddTask}
            disabled={
              !newTask.task.trim() || 
              !newTask.description.trim() || 
              !newTask.site_id || 
              !newTask.task_type ||
              (isRepetitive && !newTask.repeats_after)
            }
            className="flex-1 px-4 py-3 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
          >
            {editingTaskIndex !== null ? "Update Task" : "Add Task"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskDialog;