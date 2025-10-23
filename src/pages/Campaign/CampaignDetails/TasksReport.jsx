import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FiUser, FiExternalLink, FiActivity, FiCheck } from "react-icons/fi";

import { FaRegCircle } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

import { formatDate } from "./utils";

export const TasksReport = ({ actionedInfluencers }) => {
  // Initialize with all member IDs expanded by default
  const [expandedMembers, setExpandedMembers] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Use useMemo to prevent recreation on every render
  const membersWithTasks = useMemo(() => {
    return actionedInfluencers?.filter((member) => {
      if (!member.tasks || member.tasks.length === 0) return false;

      const influencerName =
        member.full_name ||
        `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
        (member.userProfile?.first_name && member.userProfile?.last_name
          ? `${member.userProfile.first_name} ${member.userProfile.last_name}`
          : "");

      // Filter out "Unknown User" or empty names
      return influencerName && influencerName !== "Unknown User";
    }) || [];
  }, [actionedInfluencers]); // Only recreate when actionedInfluencers changes

  // Set all members as expanded by default when component mounts or members change
  useEffect(() => {
    if (membersWithTasks.length > 0) {
      const allMemberIds = membersWithTasks.map(member => member.user_id);
      setExpandedMembers(allMemberIds);
    }
  }, [membersWithTasks]); // Now this is stable

  const unknownUsersCount = useMemo(() => {
    return actionedInfluencers?.filter((member) => {
      if (!member.tasks || member.tasks.length === 0) return false;

      const influencerName =
        member.full_name ||
        `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
        (member.userProfile?.first_name && member.userProfile?.last_name
          ? `${member.userProfile.first_name} ${member.userProfile.last_name}`
          : "");

      return !influencerName || influencerName === "Unknown User";
    })?.length || 0;
  }, [actionedInfluencers]);

  if (membersWithTasks.length === 0 && unknownUsersCount === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FiActivity className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">
          No task submissions from influencers yet.
        </p>
      </div>
    );
  }

  // Toggle function - now only closes (removes from expanded) when clicked
  const toggleMemberExpansion = (userId) => {
    setExpandedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId) // Remove if already expanded (close it)
        : [...prev, userId] // Add if not expanded (open it)
    );
  };

  const toggleTaskExpansion = (userId, taskId) => {
    const key = `${userId}-${taskId}`;
    setExpandedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getProfilePicture = (member) => {
    const profileData = member.userProfile || member;
    return (
      member.profile_pic ||
      profileData.profile_pic ||
      member.userProfile?.profile_pic ||
      null
    );
  };

  const handleImageError = (memberId) => {
    setImageErrors((prev) => ({ ...prev, [memberId]: true }));
  };

  const taskVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -5,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: prefersReducedMotion ? "tween" : "spring",
        stiffness: 500,
        damping: 30,
        duration: prefersReducedMotion ? 0.2 : undefined,
      },
    },
  };

  const taskListVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      overflow: "hidden",
    },
    visible: {
      height: "auto",
      opacity: 1,
      overflow: "visible",
      transition: {
        duration: 0.25,
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren",
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      overflow: "hidden",
      transition: {
        duration: 0.2,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  const taskDetailsVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      overflow: "hidden",
    },
    visible: {
      opacity: 1,
      height: "auto",
      overflow: "visible",
      transition: {
        duration: 0.25,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  return (
    <div className="bg-background text-foreground">
      <motion.div
        className="bg-card border-border rounded-lg border shadow overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.2, 0.65, 0.3, 0.9],
          },
        }}
      >
        <LayoutGroup>
          <div className="p-4 overflow-hidden">
            {unknownUsersCount > 0 && (
              <div className="mb-3 px-3 py-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Note: {unknownUsersCount} user
                  {unknownUsersCount !== 1 ? "s" : ""} with incomplete profile
                  information {unknownUsersCount !== 1 ? "are" : "is"} not
                  displayed.
                </p>
              </div>
            )}

            <ul className="space-y-1 overflow-hidden">
              {membersWithTasks.map((member) => {
                const influencerName =
                  member.full_name ||
                  `${member.first_name || ""} ${
                    member.last_name || ""
                  }`.trim() ||
                  (member.userProfile?.first_name &&
                  member.userProfile?.last_name
                    ? `${member.userProfile.first_name} ${member.userProfile.last_name}`
                    : "");

                const isExpanded = expandedMembers.includes(member.user_id);
                const completedTasks = member.tasks.filter(
                  (t) => t.status === "done"
                ).length;
                const totalTasks = member.tasks.length;
                const profilePic = getProfilePicture(member);

                return (
                  <motion.li
                    key={member.user_id}
                    className="pt-2"
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    <motion.div
                      className="group flex items-center px-3 py-1.5 rounded-md cursor-pointer"
                      whileHover={{
                        backgroundColor: "rgba(0,0,0,0.03)",
                        transition: { duration: 0.2 },
                      }}
                      onClick={() => toggleMemberExpansion(member.user_id)}
                    >
                      <motion.div className="mr-2 flex-shrink-0">
                        {profilePic && !imageErrors[member.user_id] ? (
                          <img
                            src={profilePic}
                            alt={influencerName}
                            className="w-5 h-5 rounded-full object-cover"
                            onError={() => handleImageError(member.user_id)}
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-[10px] font-medium">
                              {influencerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </motion.div>

                      <motion.div className="flex min-w-0 flex-grow items-center justify-between">
                        <div className="mr-2 flex-1 truncate">
                          <span>{influencerName}</span>
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                          <motion.span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                            {completedTasks}/{totalTasks}
                          </motion.span>
                        </div>
                      </motion.div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {isExpanded && member.tasks.length > 0 && (
                        <motion.div
                          className="relative overflow-hidden"
                          variants={taskListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                        >
                          {/* Straight vertical line */}
                          <div className="absolute top-0 bottom-0 left-[20px] border-l-[1px] border-secondary" />

                          <ul className="border-muted mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                            {member.tasks.map((task, taskIndex) => {
                              const taskKey = `${member.user_id}-${task.task_id}`;
                              const isTaskExpanded = expandedTasks[taskKey];
                              const isLastTask =
                                taskIndex === member.tasks.length - 1;

                              return (
                                <motion.li
                                  key={task.task_id}
                                  className="group flex flex-col py-0.5 pl-6 relative"
                                  onClick={() =>
                                    toggleTaskExpansion(
                                      member.user_id,
                                      task.task_id
                                    )
                                  }
                                  variants={taskVariants}
                                  initial="hidden"
                                  animate="visible"
                                  layout
                                >
                                  <motion.div
                                    className="cursor-pointer flex flex-1 items-center rounded-md p-2.5 bg-primary hover:bg-secondary hover:text-white"
                                    whileHover={{
                                      transition: { duration: 1 },
                                    }}
                                    layout
                                  >
                                    <motion.div
                                      className="mr-2 flex-shrink-0 cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                      whileTap={{ scale: 0.9 }}
                                      whileHover={{ scale: 1.1 }}
                                      layout
                                    >
                                      <AnimatePresence mode="wait">
                                        <motion.div
                                          key={task.status}
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.8 }}
                                          transition={{
                                            duration: 0.2,
                                            ease: [0.2, 0.65, 0.3, 0.9],
                                          }}
                                        >
                                          {task.status === "done" ? (
                                            <FaCheckCircle className="h-3.5 w-3.5 text-green-500" />
                                          ) : (
                                            <FaRegCircle className="text-muted-foreground h-3.5 w-3.5" />
                                          )}
                                        </motion.div>
                                      </AnimatePresence>
                                    </motion.div>

                                    <div className="flex items-center justify-between flex-1">
                                      <span
                                        className={`cursor-pointer text-sm ${
                                          task.status === "done"
                                            ? "text-muted-foreground font-semibold line-through"
                                            : ""
                                        }`}
                                      >
                                        {task.title}
                                      </span>

                                      {task.status === "done" && (
                                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                          Completed
                                        </span>
                                      )}
                                    </div>
                                  </motion.div>

                                  <AnimatePresence mode="wait">
                                    {isTaskExpanded && (
                                      <motion.div
                                        className="text-muted-foreground border-primary mt-1 ml-1.5 border-l pl-5 text-xs overflow-hidden"
                                        variants={taskDetailsVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        layout
                                      >
                                        <p className="py-1">
                                          {task.description}
                                        </p>

                                        <div className="mt-1 mb-1 space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground font-medium">
                                              Type:
                                            </span>
                                            <span className="text-foreground">
                                              {task.task_type}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground font-medium">
                                              Reward:
                                            </span>
                                            <span className="text-foreground">
                                              ${task.reward}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground font-medium">
                                              End Date:
                                            </span>
                                            <span className="text-foreground">
                                              {formatDate(task.end_date)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground font-medium">
                                              URL Required:
                                            </span>
                                            <span className="text-foreground">
                                              {task.requires_url === "yes"
                                                ? "Yes"
                                                : "No"}
                                            </span>
                                          </div>
                                        </div>

                                        {task.activity_url && (
                                          <div className="mt-2 pt-2 border-t border-muted">
                                            <div className="flex items-center gap-1 mb-1">
                                              <FiCheck className="w-3 h-3 text-green-500" />
                                              <span className="text-muted-foreground font-medium text-[10px]">
                                                Submitted URL
                                              </span>
                                            </div>

                                            <a
                                              href={task.activity_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex min-w-full bg-primary/20 hover:bg-green-50/60 hover:border-green-500
             px-3 py-3 rounded-lg border border-primary items-center gap-1 text-xs text-foreground
             no-underline hover:no-underline transition-all duration-300 ease-in-out 
             hover:shadow-md hover:scale-[1.02]"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <FiExternalLink className="w-3 h-3 transition-transform duration-300 group-hover:rotate-45" />
                                              <span className="truncate">
                                                {task.activity_url}
                                              </span>
                                            </a>
                                          </div>
                                        )}

                                        {task.requires_url === "yes" &&
                                          !task.activity_url &&
                                          task.status !== "done" && (
                                            <div className="mt-2 pt-2 border-t border-muted">
                                              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-[10px]">
                                                <FiExternalLink className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                  Awaiting URL
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
};