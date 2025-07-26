import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { get, patch, post } from '../../../utils/service';
import { motion, AnimatePresence } from "framer-motion";

// React Icons
import {
  FiArrowLeft,
  FiUsers,
  FiTarget,
  FiActivity,
  FiMail,
  FiChevronDown,
  FiExternalLink,
} from 'react-icons/fi';

import { MdTask, MdArrowBackIosNew } from "react-icons/md";

// Import components
import { SkeletonCard, SkeletonStatsCard } from './SkeletonComponents';
import { Badge, Button } from './UIComponents';
import { AvatarCircles } from './AvatarCircles';
import CampaignHeroCard from './CampaignHeroCard';
import CampaignDescription from './CampaignDescription';
import CampaignObjective from './CampaignObjective';
import CampaignOverview from './CampaignOverview';
import CampaignActionButtons from './CampaignActionButtons';
import MembersSection from './MembersSection';
import CampaignModals from './CampaignModals';

// Import utilities
import { formatDate, formatHtmlContent, getActionStatusBadge } from './utils';

// TasksAccordion Component - Your improved version
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
          <MdTask className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">No tasks found for this campaign.</p>
      </div>
    );
  }

  // Get unique tasks based on task_id, with fallback for different id fields
  const uniqueTasks = tasks.reduce((acc, task) => {
    const taskId = task.task_id || task.id || task.campaign_task_id || `task-${acc.length}`;
    if (!acc.find(t => (t.task_id || t.id || t.campaign_task_id) === taskId)) {
      acc.push({ ...task, task_id: taskId });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-3">
      {uniqueTasks.map((task, index) => {
        const isOpen = openItem === task.task_id;
        const taskTitle = task.title || task.task || task.name || `Task ${index + 1}`;
        
        return (
          <div
            key={task.task_id}
            className="group border-b border-black/10 overflow-hidden transition-all duration-300 mx-4"
          >
            <button
              onClick={() => toggleItem(task.task_id)}
              className="flex items-center justify-between w-full px-4 py-3 bg-transparent text-left group-data-[state=open]:bg-black/[0.04] transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-semibold">
                  {taskTitle}
                </span>
              </div>
              <div className="flex items-center gap-3">
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
                className="relative px-4 py-3 text-sm text-black border-t border-black/10 before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:opacity-100 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div 
                    className="text-xs text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: formatHtmlContent(task.description || 'No description available')
                    }}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 text-xs">
                    <div>
                      <span className="font-semibold text-gray-700">URL Required:</span>
                      <span className="ml-2 text-gray-600">
                        {(task.requires_url === 'yes' || task.requires_url === true || task.requires_url === '1') ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {(task.is_repetitive || task.repeats_after) && (
                      <div>
                        <span className="font-semibold text-gray-700">Repetitive:</span>
                        <span className="ml-2 text-gray-600">
                          {(task.is_repetitive === 'yes' || task.repeats_after) ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                    {(task.repeats_after || task.frequency) && (
                      <div>
                        <span className="font-semibold text-gray-700">Frequency:</span>
                        <span className="ml-2 text-gray-600">{task.repeats_after || task.frequency}</span>
                      </div>
                    )}
                  </div>
                  {task.activity_url && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="shadow-sm"
                        onClick={() => window.open(task.activity_url, '_blank')}
                      >
                        <FiExternalLink className="w-3 h-3 mr-1" />
                        View Activity
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// TaskCard Component for alternative display
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
            <h4 className="font-semibold text-sm text-gray-900">{task.title || task.task || task.name}</h4>
            <p className="text-xs text-gray-600">{task.task_type || task.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.status && getTaskStatusBadge(task.status)}
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
                  __html: formatHtmlContent(task.description || 'No description available')
                }}
              />
              
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                {task.reward && (
                  <div>
                    <span className="font-medium text-gray-700">Reward:</span>
                    <span className="ml-2 text-gray-600">${task.reward}</span>
                  </div>
                )}
                {(task.end_date || task.endDate) && (
                  <div>
                    <span className="font-medium text-gray-700">End Date:</span>
                    <span className="ml-2 text-gray-600">{formatDate(task.end_date || task.endDate)}</span>
                  </div>
                )}
                {task.requires_url && (
                  <div>
                    <span className="font-medium text-gray-700">URL Required:</span>
                    <span className="ml-2 text-gray-600">
                      {(task.requires_url === 'yes' || task.requires_url === true || task.requires_url === '1') ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                {task.is_repetitive && (
                  <div>
                    <span className="font-medium text-gray-700">Repetitive:</span>
                    <span className="ml-2 text-gray-600">
                      {(task.is_repetitive === 'yes' || task.is_repetitive === true || task.is_repetitive === '1') ? 'Yes' : 'No'}
                    </span>
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

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Campaign state
  const [campaign, setCampaign] = useState(state?.campaign || null);
  const [loading, setLoading] = useState(!state?.campaign);
  const [actionedMembers, setActionedMembers] = useState([]);
  const [actionedInfluencers, setActionedInfluencers] = useState([]);
  const [allSentInvites, setAllSentInvites] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraft, setIsDraft] = useState(state?.isDraft || false);
  const [campaignTasks, setCampaignTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [sentInvitesLoading, setSentInvitesLoading] = useState(false);

  // Static data state
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);

  // Modal states
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [userProfileModal, setUserProfileModal] = useState(false);
  const [closeCampaignModal, setCloseCampaignModal] = useState(false);
  const [deleteCampaignModal, setDeleteCampaignModal] = useState(false);
  const [resendInviteModal, setResendInviteModal] = useState(false);
  const [cancelInviteModal, setCancelInviteModal] = useState(false);
  const [activateCampaignModal, setActivateCampaignModal] = useState(false);

  // Application processing states
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState(new Set());

  // Refs for scroll synchronization
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);
  const [scrollSync, setScrollSync] = useState({ leftTaller: false, rightTaller: false });

  // Helper function to get country name from ISO code
  const getCountryName = useCallback((isoCode) => {
    if (!countries.length || !isoCode) return isoCode || 'Unknown';
    const country = countries.find(c => c.iso_code === isoCode);
    return country ? country.name : isoCode;
  }, [countries]);

  // Function to check campaign influencer limits
  const getCampaignInfluencerInfo = useCallback(() => {
    if (!campaign) return { maxInfluencers: 0, currentAccepted: 0, canAcceptMore: false, remainingSlots: 0 };
    
    const maxInfluencers = campaign.number_of_influencers || 0;
    // Count members who have been accepted via application processing
    const currentAccepted = actionedMembers.filter(m => m.application_status === 'accepted').length;
    const remainingSlots = maxInfluencers - currentAccepted;
    const canAcceptMore = remainingSlots > 0;
    
    return {
      maxInfluencers,
      currentAccepted,
      canAcceptMore,
      remainingSlots
    };
  }, [campaign, actionedMembers]);

  // Get campaign status - keep your existing logic unchanged
  const getCampaignStatus = useCallback(() => {
    if (!campaign) return 'unknown';
    if (isDraft) return 'draft';
    if (campaign.closed_date) return 'closed';
    if (campaign.status) return campaign.status.toLowerCase();
    
    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);
    
    if (now < startDate) return 'planned';
    if (now >= startDate && now <= endDate) return 'active';
    if (now > endDate) return 'expired';
    
    return 'unknown';
  }, [campaign, isDraft]);

  // FIXED: Only draft campaigns can be edited
  const canEditCampaign = useMemo(() => {
    if (!campaign) return false;
    return campaign.status === 'draft';
  }, [campaign]);

  // Keep your existing logic for other actions
  const canActivateCampaign = useMemo(() => {
    if (!campaign) return false;
    const status = getCampaignStatus();
    return status === 'planned';
  }, [campaign, getCampaignStatus]);

  const canDeleteCampaign = useMemo(() => {
    if (!campaign) return false;
    const status = getCampaignStatus();
    return status === 'active';
  }, [campaign, getCampaignStatus]);

  // FIXED: Only draft campaigns can have members added
  const canAddMembers = useMemo(() => {
    if (!campaign) return false;
    return campaign.status === 'draft';
  }, [campaign]);

  // Filter sent invites for current campaign - only non-accepted and non-expired invites
  const sentInvites = useMemo(() => {
    if (!campaign?.campaign_id || !allSentInvites.length) return [];
    
    const filtered = allSentInvites.filter(invite => {
      const isForThisCampaign = invite.campaign_id === campaign.campaign_id;
      const isNotAccepted = invite.invite_status !== 'accepted';
      const isNotExpired = new Date(invite.expiry_date) >= new Date();
      
      return isForThisCampaign && isNotAccepted && isNotExpired;
    });
    
    return filtered;
  }, [allSentInvites, campaign?.campaign_id]);

  // Check if campaign has any invites (sent or accepted)
  const campaignHasInvites = useMemo(() => {
    if (!campaign?.campaign_id || !allSentInvites.length) return false;
    
    return allSentInvites.some(invite => invite.campaign_id === campaign.campaign_id);
  }, [allSentInvites, campaign?.campaign_id]);

  // Helper function to get influencer details - UPDATED FOR NEW RESPONSE STRUCTURE
  const getInfluencerDetails = useCallback(async (userId) => {
    try {
      const response = await get(`users/influencerDetails/${userId}`);
      
      if (response?.status === 200 && response?.data) {
        // Transform the response to include additional computed fields
        const influencerData = {
          // Original response data
          ...response.data,
          
          // Computed fields for compatibility
          full_name: response.data.name,
          country_name: getCountryName(response.data.location),
          
          // Social media stats with proper formatting
          total_followers: Object.values(response.data.socialStats || {}).reduce((sum, count) => {
            return sum + (typeof count === 'number' ? count : 0);
          }, 0),
          
          // Review statistics
          total_reviews: response.data.reviews?.length || 0,
          average_rating: response.data.reviews?.length > 0 
            ? response.data.reviews.reduce((sum, review) => sum + review.rating, 0) / response.data.reviews.length 
            : 0,
          
          // Formatted social stats for display
          formatted_social_stats: Object.entries(response.data.socialStats || {}).map(([platform, count]) => ({
            platform: platform.toLowerCase(),
            followers: count,
            formatted_count: count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString()
          })).filter(stat => stat.followers > 0)
        };
        
        return influencerData;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [getCountryName]);

  // Function to fetch campaign applications - MATCH API STRUCTURE EXACTLY
  const fetchCampaignApplications = useCallback(async (campaignId) => {
    try {
      const response = await get(`campaigns/get-applications/${campaignId}`);
      
      if (response?.status === 200 && response?.data) {
        // Transform the API response to match your exact data structure
        const transformedData = response.data.map(member => {
          return {
            // Original fields from API exactly as they are
            campaign_id: member.campaign_id,
            user_id: member.user_id,
            influencer_rating: member.influencer_rating,
            first_name: member.first_name,
            last_name: member.last_name,
            profile_pic: member.profile_pic,
            iso_code: member.iso_code,
            payable_amount: member.payable_amount,
            invited_on: member.invited_on,
            invite_status: member.invite_status,
            application_status: member.application_status,
            
            // Additional computed fields for component compatibility
            id: member.user_id,
            invite_id: member.user_id, // For backward compatibility
            full_name: `${member.first_name} ${member.last_name}`,
            username: member.username || `${member.first_name.toLowerCase()}_${member.last_name.toLowerCase()}`,
            country_name: getCountryName(member.iso_code),
            
            // Status mappings
            action_status: member.application_status === 'submitted' ? 'completed' : 
                         member.application_status === 'accepted' ? 'completed' : 'pending',
            pay_status: member.application_status === 'accepted' ? 'not_paid' : 'pending',
            
            // FIXED: Ensure tasks array is properly set
            tasks: Array.isArray(member.tasks) ? member.tasks : [],
            
            // Create userProfile object for backward compatibility
            userProfile: {
              profile_pic: member.profile_pic,
              first_name: member.first_name,
              last_name: member.last_name,
              influencer_rating: member.influencer_rating,
              iso_code: member.iso_code,
              username: member.username || `${member.first_name.toLowerCase()}_${member.last_name.toLowerCase()}`
            }
          };
        });
        
        return transformedData;
      } else if (response?.status === 404) {
        return [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }, [getCountryName]);

  // Function to fetch actioned influencers
  const fetchActionedInfluencers = useCallback(async (campaignId) => {
    try {
      const response = await get(`campaigns/getActionedInfluencers/${campaignId}`);
      
      if (response?.status === 200 && response?.data) {
        setActionedInfluencers(response.data);
        return response.data;
      } else {
        setActionedInfluencers([]);
        return [];
      }
    } catch (error) {
      setActionedInfluencers([]);
      return [];
    }
  }, []);

  // Function to fetch campaign tasks separately if needed
  const fetchCampaignTasks = useCallback(async (campaignId) => {
    try {
      setTasksLoading(true);
      
      // Try to get tasks from campaign endpoint
      const response = await get(`campaigns/tasks/${campaignId}`);
      
      if (response?.status === 200 && response?.data) {
        setCampaignTasks(response.data);
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // FIXED: Enhanced task computation - moved before scroll sync to fix initialization error
  const allTasks = useMemo(() => {
    let computedTasks = [];
    
    if (isDraft) {
      // For draft campaigns, prioritize campaign.tasks over campaignTasks
      if (campaign?.tasks && Array.isArray(campaign.tasks) && campaign.tasks.length > 0) {
        computedTasks = campaign.tasks;
      } else if (campaignTasks && Array.isArray(campaignTasks) && campaignTasks.length > 0) {
        computedTasks = campaignTasks;
      } else {
        computedTasks = [];
      }
    } else {
      // For active campaigns, extract tasks from actionedMembers
      const allMemberTasks = [];
      actionedMembers.forEach((member) => {
        if (member.tasks && Array.isArray(member.tasks) && member.tasks.length > 0) {
          member.tasks.forEach((task) => {
            allMemberTasks.push(task);
          });
        }
      });
      
      if (allMemberTasks.length > 0) {
        // Remove duplicate tasks by task_id
        const uniqueTasks = allMemberTasks.reduce((acc, task) => {
          const taskId = task.task_id || task.id || task.campaign_task_id;
          if (taskId && !acc.find(t => (t.task_id || t.id || t.campaign_task_id) === taskId)) {
            acc.push(task);
          }
          return acc;
        }, []);
        
        computedTasks = uniqueTasks;
      } else if (campaignTasks && Array.isArray(campaignTasks) && campaignTasks.length > 0) {
        computedTasks = campaignTasks;
      } else if (campaign?.tasks && Array.isArray(campaign.tasks) && campaign.tasks.length > 0) {
        computedTasks = campaign.tasks;
      } else {
        computedTasks = [];
      }
    }
    
    // Ensure tasks is always an array
    if (!Array.isArray(computedTasks)) {
      computedTasks = [];
    }
    
    return computedTasks;
  }, [isDraft, campaignTasks, actionedMembers, campaign?.tasks]);

  // Calculate stats
  const stats = {
    totalMembers: actionedMembers.length,
    completedActions: actionedMembers.filter(m => m.action_status === 'completed').length,
    paidMembers: actionedMembers.filter(m => m.application_status === 'accepted').length,
    pendingPayments: actionedMembers.filter(m => m.application_status === 'submitted').length,
    totalAmount: actionedMembers.reduce((sum, m) => sum + parseFloat(m.payable_amount || 0), 0)
  };

  // Get user avatars
  const hasActiveInfluencers = actionedMembers && actionedMembers.length > 0;
  const influencerAvatars = hasActiveInfluencers 
    ? actionedMembers.map(user => user.profile_pic || user.userProfile?.profile_pic).filter(Boolean)
    : [];

  // Professional scroll synchronization logic - moved after allTasks definition
  useEffect(() => {
    const calculateScrollBehavior = () => {
      if (!leftColumnRef.current || !rightColumnRef.current) return;

      const leftHeight = leftColumnRef.current.scrollHeight;
      const rightHeight = rightColumnRef.current.scrollHeight;
      
      const leftTaller = leftHeight > rightHeight + 200; // 200px threshold
      const rightTaller = rightHeight > leftHeight + 200; // 200px threshold
      
      setScrollSync({ leftTaller, rightTaller });
    };

    // Calculate on mount and when content changes
    calculateScrollBehavior();
    
    // Recalculate on window resize
    const handleResize = () => {
      setTimeout(calculateScrollBehavior, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Recalculate when tasks accordion opens/closes
    const taskButtons = document.querySelectorAll('[data-task-toggle]');
    taskButtons.forEach(button => {
      button.addEventListener('click', () => {
        setTimeout(calculateScrollBehavior, 350); // After animation
      });
    });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [campaign, actionedMembers, allTasks, hasActiveInfluencers]);

  // Fetch industries and countries data
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [industriesResponse, countriesResponse] = await Promise.all([
          get('users/industries'),
          get('users/countries')
        ]);
        
        if (industriesResponse?.data) {
          setIndustries(industriesResponse.data);
        }
        
        if (countriesResponse?.data) {
          setCountries(countriesResponse.data);
        }
      } catch (error) {
        // Handle error silently
      }
    };

    fetchStaticData();
  }, []);

  // Fetch all sent invites
  useEffect(() => {
    const fetchSentInvites = async () => {
      try {
        setSentInvitesLoading(true);
        
        const response = await get('campaigns/sentInvites');
        
        if (response?.status === 200 && response?.data) {
          setAllSentInvites(response.data);
        } else {
          setAllSentInvites([]);
        }
      } catch (error) {
        setAllSentInvites([]);
      } finally {
        setSentInvitesLoading(false);
      }
    };

    fetchSentInvites();
  }, []);

  // Enhanced campaign and task fetching logic
  useEffect(() => {
    document.title = campaign ? `${campaign.title} | Campaign Details` : 'Campaign Details | Social Gems Admin';
    
    const fetchCampaignAndTasks = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        
        if (!campaign) {
          // First, try to get campaign as draft
          let campaignData = null;
          let isDraftCampaign = false;
          
          try {
            const draftResponse = await get(`campaigns/getDraftCampaign/${id}`);
            
            if (draftResponse?.data) {
              campaignData = draftResponse.data;
              isDraftCampaign = true;
            }
          } catch (draftError) {
            // Not a draft campaign, try regular campaign endpoint
          }
          
          // If not found as draft, try regular campaign endpoint
          if (!campaignData) {
            try {
              const campaignResponse = await get(`campaigns/${id}`);
              
              if (campaignResponse?.data) {
                campaignData = campaignResponse.data;
                isDraftCampaign = false;
              }
            } catch (campaignError) {
              toast.error('Campaign not found');
              return;
            }
          }
          
          if (campaignData) {
            setCampaign(campaignData);
            setIsDraft(isDraftCampaign);
            
            // Enhanced task handling - check multiple sources
            let tasksToSet = [];
            
            // Priority 1: tasks array directly in campaign data
            if (campaignData.tasks && Array.isArray(campaignData.tasks) && campaignData.tasks.length > 0) {
              tasksToSet = campaignData.tasks;
            }
            // Priority 2: tasks in campaign_tasks property
            else if (campaignData.campaign_tasks && Array.isArray(campaignData.campaign_tasks) && campaignData.campaign_tasks.length > 0) {
              tasksToSet = campaignData.campaign_tasks;
            }
            // Priority 3: Try to fetch tasks separately
            else {
              try {
                const separateTasks = await fetchCampaignTasks(campaignData.campaign_id);
                if (separateTasks && separateTasks.length > 0) {
                  tasksToSet = separateTasks;
                }
              } catch (taskError) {
                // Could not fetch tasks separately
              }
            }
            
            // Set the tasks
            setCampaignTasks(tasksToSet);
            
            // If still no tasks, set empty array
            if (tasksToSet.length === 0) {
              setCampaignTasks([]);
            }
          }
        }
        
      } catch (error) {
        toast.error('Failed to load campaign data');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignAndTasks();
  }, [id, campaign, fetchCampaignTasks]);

  // Separate effect to fetch applications and then actioned influencers
  useEffect(() => {
    const fetchApplicationsAndActionedInfluencers = async () => {
      if (campaign?.campaign_id && allSentInvites.length > 0) {
        if (campaignHasInvites) {
          const applicationsData = await fetchCampaignApplications(campaign.campaign_id);
          if (applicationsData && applicationsData.length > 0) {
            setActionedMembers(applicationsData);
          } else {
            setActionedMembers([]);
          }

          // Fetch actioned influencers after applications
          await fetchActionedInfluencers(campaign.campaign_id);
        } else {
          setActionedMembers([]);
          setActionedInfluencers([]);
        }
      }
    };

    fetchApplicationsAndActionedInfluencers();
  }, [campaign?.campaign_id, allSentInvites, campaignHasInvites, fetchCampaignApplications, fetchActionedInfluencers]);

  // Handle edit campaign with proper date and task formatting
  const handleEditCampaign = useCallback(() => {
    if (!canEditCampaign) {
      toast.error('This campaign cannot be edited');
      return;
    }

    // Helper function to format date to YYYY-MM-DD
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        return '';
      }
    };

    // Helper function to properly format tasks for the form
    const formatTasksForForm = (tasks) => {
      if (!tasks || !Array.isArray(tasks)) {
        return [];
      }
      
      return tasks.map((task) => {
        // Handle different possible property names from API
        const formattedTask = {
          task: task.task || task.title || task.name || '',
          description: task.description || '',
          site_id: task.site_id || task.platform_id || 4,
          task_type: task.task_type || task.type || 'repetitive',
          requires_url: task.requires_url === '1' || task.requires_url === true || task.requires_url === 'true',
          repeats_after: task.repeats_after || task.frequency || 'daily'
        };
        
        return formattedTask;
      });
    };

    // Get tasks from the right source - prioritize campaign.tasks for draft
    const tasksToUse = isDraft && campaign?.tasks && campaign.tasks.length > 0
      ? campaign.tasks 
      : (campaignTasks && campaignTasks.length > 0 ? campaignTasks : []);

    // Use the existing campaign data that's already loaded
    const editData = {
      campaign_id: campaign.campaign_id,
      title: campaign.title || '',
      description: campaign.description || '',
      objective: campaign.objective || '',
      start_date: formatDateForInput(campaign.start_date),
      end_date: formatDateForInput(campaign.end_date),
      budget: campaign.budget || 250,
      number_of_influencers: campaign.number_of_influencers || 5,
      industry_ids: campaign.industry_ids || [],
      campaign_image: campaign.image_urls || campaign.campaign_image,
      social_media_requirements: campaign.social_media_requirements || [],
      min_level_id: campaign.min_level_id || 3,
      tasks: formatTasksForForm(tasksToUse)
    };
    
    // Navigate to create campaign with edit data
    navigate('/campaigns/create', {
      state: {
        mode: 'edit',
        editCampaignData: editData,
        openOnStep: 0 // Start from step 0 for editing
      }
    });
    
    toast.success('Opening campaign editor...');
  }, [campaign, campaignTasks, canEditCampaign, navigate, isDraft]);

  // Handle add members with pre-filled filter data (only for draft campaigns)
  const handleAddMembers = useCallback(() => {
    if (!campaign) return;
    
    if (!canAddMembers) {
      toast.error('Members can only be added to draft campaigns');
      return;
    }
    
    // Prepare filter data from current campaign
    const filterData = {
      campaignId: campaign.campaign_id,
      brandBudget: campaign.budget || 250,
      numberOfInfluencers: campaign.number_of_influencers || 5,
      selectedIndustries: campaign.industry_ids || [],
      socialMediaRequirements: campaign.social_media_requirements || [],
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      minLevelId: campaign.min_level_id || 3
    };
    
    navigate('/campaigns/create', { 
      state: { 
        mode: 'addMembers',
        openOnStep: 1, // Step 1 is the filter step (0-indexed)
        existingCampaign: campaign,
        prefilledFilterData: filterData
      } 
    });
  }, [campaign, navigate, canAddMembers]);

  // Handle activate campaign
  const handleActivateCampaign = useCallback(async () => {
    if (!canActivateCampaign) {
      toast.error('This campaign cannot be activated');
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await post('campaigns/activate', {
        campaign_id: campaign.campaign_id
      });
      
      if (response?.status === 200) {
        setCampaign(prev => prev ? { ...prev, status: 'active' } : null);
        toast.success('Campaign activated successfully!');
        setActivateCampaignModal(false);
      } else {
        toast.error(response?.message || 'Failed to activate campaign');
      }
    } catch (error) {
      toast.error('Failed to activate campaign');
    } finally {
      setIsProcessing(false);
    }
  }, [campaign, canActivateCampaign]);

  // Handle batch process applications - USING CORRECT USER_ID
  const handleBatchProcessApplications = async (data) => {
    setIsProcessing(true);
    try {
      const response = await post('campaigns/batch-process-applications', data);
      
      if (response?.status === 200 || response?.status === 204) {
        toast.success('Applications processed successfully!');
        
        // Refresh campaign applications to reflect changes
        if (campaignHasInvites) {
          const applicationsData = await fetchCampaignApplications(campaign.campaign_id);
          if (applicationsData) {
            setActionedMembers(applicationsData);
          }
        }

        // Refresh actioned influencers
        await fetchActionedInfluencers(campaign.campaign_id);
        
        // Refresh sent invites as well
        const invitesResponse = await get('campaigns/sentInvites');
        if (invitesResponse?.status === 200 && invitesResponse?.data) {
          setAllSentInvites(invitesResponse.data);
        }
        
        // Clear selections and exit multi-select mode
        setSelectedApplications(new Set());
        setMultiSelectMode(false);
      } else {
        toast.error('Failed to process applications');
      }
    } catch (error) {
      toast.error('Failed to process applications');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle accept single application from modal
  const handleAcceptApplicationFromModal = useCallback((member) => {
    const influencerInfo = getCampaignInfluencerInfo();
    
    if (!influencerInfo.canAcceptMore) {
      toast.error(`Campaign has reached its limit of ${influencerInfo.maxInfluencers} influencer${influencerInfo.maxInfluencers !== 1 ? 's' : ''}`);
      return;
    }
    
    handleBatchProcessApplications({
      campaign_id: campaign.campaign_id,
      accepted_applications: [member.user_id],
      rejected_applications: []
    });
    
    // Close the modal after accepting
    setUserProfileModal(false);
  }, [campaign, getCampaignInfluencerInfo, handleBatchProcessApplications]);

  // Handle reject single application from modal
  const handleRejectApplicationFromModal = useCallback((member) => {
    handleBatchProcessApplications({
      campaign_id: campaign.campaign_id,
      accepted_applications: [],
      rejected_applications: [member.user_id]
    });
    
    // Close the modal after rejecting
    setUserProfileModal(false);
  }, [campaign, handleBatchProcessApplications]);

  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            {/* Grid Layout for Loading */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="lg:col-span-1 space-y-8">
                <SkeletonStatsCard />
                <SkeletonStatsCard />
                <SkeletonStatsCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-xs">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1, transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.15s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
        }

        /* Professional Scroll Synchronization Styles */
        .scroll-sync-container {
          position: relative;
        }
        
        .column-left {
          ${scrollSync.rightTaller ? `
            position: sticky;
            top: 2rem;
            height: fit-content;
            max-height: calc(100vh - 4rem);
          ` : ''}
        }
        
        .column-right {
          ${scrollSync.leftTaller ? `
            position: sticky;
            top: 5rem;
            height: fit-content;
            max-height: calc(100vh - 4rem);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #00000000;
          ` : ''}
        }
        
        .column-right::-webkit-scrollbar {
          width: 6px;
        }
        
        .column-right::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .column-right::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .column-right::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }

        @media (max-width: 1024px) {
          .column-left,
          .column-right {
            position: static !important;
            height: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
        }
      `}</style>
      
      <div className="w-full min-h-screen">
        <div className="container mx-auto">
          <div className="flex flex-col gap-6">

            {/* Back Button with Campaign Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/campaigns')}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-all duration-200 hover:scale-110 shadow-xl"
              >
                <MdArrowBackIosNew className="w-4 h-4" />
              </button>
                  <p className='text-xl font-bold flex gap-2 items-center'>
                  Campaign Details
                  <span>-</span>
                  <span className='font-semibold text-sm text-gray-500'>
                  {campaign.title}
                  </span>
                  </p>
            </div>

            {/* Professional Scroll Synchronized Grid Layout */}
            <div className="scroll-sync-container grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Side (70%) - Takes 2/3 width */}
              <div ref={leftColumnRef} className="column-left lg:col-span-2 space-y-8">
                
                {/* Campaign Hero Card (image without title) */}
                <CampaignHeroCard 
                  campaign={campaign}
                  stats={stats}
                  isDraft={isDraft}
                  getCampaignStatus={getCampaignStatus}
                  formatDate={formatDate}
                />

                {/* Action Buttons - Moved below the image */}
                <CampaignActionButtons
                  campaign={campaign}
                  isDraft={isDraft}
                  canEditCampaign={canEditCampaign}
                  canActivateCampaign={canActivateCampaign}
                  canDeleteCampaign={canDeleteCampaign}
                  canAddMembers={canAddMembers}
                  getCampaignStatus={getCampaignStatus}
                  stats={stats}
                  isProcessing={isProcessing}
                  loading={loading}
                  onAddMembers={handleAddMembers}
                  onEditCampaign={handleEditCampaign}
                  onActivateCampaign={() => setActivateCampaignModal(true)}
                  onCloseCampaign={() => setCloseCampaignModal(true)}
                  onDeleteCampaign={() => setDeleteCampaignModal(true)}
                />

                {/* Campaign Participants - Full width on right side */}
                {hasActiveInfluencers && (
                  <div className="w-full bg-yellow-50 border border-primary-scale-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AvatarCircles 
                        numPeople={actionedMembers.length}
                        avatarUrls={influencerAvatars}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{actionedMembers.length} participants</span>
                        <span className="text-xs text-gray-600">Active in this campaign</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campaign Description */}
                {campaign.description && (
                  <CampaignDescription description={campaign.description} />
                )}

                {/* Campaign Tasks Accordion */}
                <div className='border border-gray-100 rounded-xl overflow-hidden'>
                  <div className="flex items-center gap-3 p-3 bg-gray-100 border-b border-b-gray-200">
                    <div>
                      <h3 className="text-lg sm:text-xl tracking-tight font-semibold text-gray-900">
                        Campaign Tasks 
                        {tasksLoading && <span className="text-sm font-normal text-gray-500 ml-2">(Loading...)</span>}
                      </h3>
                    </div>
                  </div>

                  {/* Enhanced Tasks Display */}
                  {tasksLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-600 text-sm">Loading tasks...</span>
                    </div>
                  ) : (
                    <TasksAccordion tasks={allTasks} />
                  )}
                </div>

              </div>

              {/* Right Side (30%) - Takes 1/3 width with Professional Scroll Sync */}
              <div ref={rightColumnRef} className="column-right lg:col-span-1 space-y-8 h-fit">
                
                {/* Campaign Objective */}
                {campaign.objective && (
                  <CampaignObjective objective={campaign.objective} />
                )}

                {/* Campaign Overview (contains stats) */}
                <CampaignOverview campaign={campaign} stats={stats} />

                {/* Campaign Members Section */}
                {hasActiveInfluencers && (
                  <MembersSection
                    actionedMembers={actionedMembers}
                    stats={stats}
                    isProcessing={isProcessing}
                    canAddMembers={canAddMembers}
                    campaign={campaign}
                    countries={countries}
                    getCountryName={getCountryName}
                    getCampaignInfluencerInfo={getCampaignInfluencerInfo}
                    multiSelectMode={multiSelectMode}
                    setMultiSelectMode={setMultiSelectMode}
                    selectedApplications={selectedApplications}
                    setSelectedApplications={setSelectedApplications}
                    isApplicationMode={true}
                    onAddMembers={handleAddMembers}
                    onMemberClick={(member) => {
                      setSelectedMember(member);
                      setUserProfileModal(true);
                    }}
                    onAcceptClick={(member) => {
                      const influencerInfo = getCampaignInfluencerInfo();
                      
                      if (!influencerInfo.canAcceptMore) {
                        toast.error(`Campaign has reached its limit of ${influencerInfo.maxInfluencers} influencer${influencerInfo.maxInfluencers !== 1 ? 's' : ''}`);
                        return;
                      }
                      
                      handleBatchProcessApplications({
                        campaign_id: campaign.campaign_id,
                        accepted_applications: [member.user_id], 
                        rejected_applications: []
                      });
                    }}
                    onRejectClick={(member) => {
                      handleBatchProcessApplications({
                        campaign_id: campaign.campaign_id,
                        accepted_applications: [],
                        rejected_applications: [member.user_id] 
                      });
                    }}
                    onViewTasks={(member) => {
                      setSelectedMember(member);
                      setUserProfileModal(true);
                    }}
                    onBatchProcessApplications={handleBatchProcessApplications}
                  />
                )}

              </div>

            </div>

          </div>
        </div>

        <CampaignModals
          userProfileModal={userProfileModal}
          closeCampaignModal={closeCampaignModal}
          deleteCampaignModal={deleteCampaignModal}
          resendInviteModal={resendInviteModal}
          cancelInviteModal={cancelInviteModal}
          activateCampaignModal={activateCampaignModal}
          
          setUserProfileModal={setUserProfileModal}
          setCloseCampaignModal={setCloseCampaignModal}
          setDeleteCampaignModal={setDeleteCampaignModal}
          setResendInviteModal={setResendInviteModal}
          setCancelInviteModal={setCancelInviteModal}
          setActivateCampaignModal={setActivateCampaignModal}
          
          selectedMember={selectedMember}
          selectedInvite={selectedInvite}
          campaign={campaign}
          campaignId={campaign?.campaign_id} // Add this line - pass campaign_id
          stats={stats}
          isProcessing={isProcessing}
          industries={industries}
          countries={countries}
          
          getInfluencerDetails={getInfluencerDetails}
          
          onAcceptClick={handleAcceptApplicationFromModal}
          onRejectFromModal={handleRejectApplicationFromModal}
          
          onResendInvite={async (invite) => {
            setIsProcessing(true);
            try {
              await post('campaigns/resendInvite', {
                invite_id: invite.invite_id
              });
              
              toast.success('Invite resent successfully!');
              setResendInviteModal(false);
              
              // Refresh sent invites
              const response = await get('campaigns/sentInvites');
              if (response?.status === 200 && response?.data) {
                setAllSentInvites(response.data);
              }
            } catch (error) {
              toast.error('Failed to resend invite');
            } finally {
              setIsProcessing(false);
            }
          }}
          onCancelInvite={async (invite) => {
            setIsProcessing(true);
            try {
              await post('campaigns/cancelInvite', {
                invite_id: invite.invite_id
              });
              
              setAllSentInvites(prevInvites =>
                prevInvites.filter(inv => inv.invite_id !== invite.invite_id)
              );
              
              toast.success('Invite cancelled successfully!');
              setCancelInviteModal(false);
            } catch (error) {
              toast.error('Failed to cancel invite');
            } finally {
              setIsProcessing(false);
            }
          }}
          onCloseCampaign={async () => {
            setIsProcessing(true);
            try {
              await post('groups/closeCampaignManually', { campaignId: campaign.campaign_id });
              setCampaign(prev => prev ? { ...prev, closed_date: new Date().toISOString() } : null);
              toast.success('Campaign closed successfully!');
              setCloseCampaignModal(false);
            } catch (error) {
              toast.error('Failed to close campaign');
            } finally {
              setIsProcessing(false);
            }
          }}
          onDeleteCampaign={async () => {
            setIsProcessing(true);
            try {
              await post('campaigns/deleteCampaign', { campaign_id: campaign.campaign_id });
              toast.success('Campaign deleted successfully!');
              setDeleteCampaignModal(false);
              navigate('/campaigns');
            } catch (error) {
              toast.error('Failed to delete campaign');
            } finally {
              setIsProcessing(false);
            }
          }}
          onActivateCampaign={handleActivateCampaign}
        />
      </div>
    </>
  );
}