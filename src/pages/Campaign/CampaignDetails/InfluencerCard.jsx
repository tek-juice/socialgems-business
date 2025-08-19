import { FiChevronRight, FiCheck, FiX, FiXCircle, FiCheckSquare, FiSquare, FiUserPlus, FiUser } from 'react-icons/fi';
import { motion } from "framer-motion";
import { cn } from '../../../lib/utils';
import { Badge, Button } from './UIComponents';
import { formatDate, getActionStatusBadge, getPaymentStatusBadge } from './utils';

export const InfluencerCard = ({ 
  member, 
  onClick, 
  onPayClick, 
  onRejectClick, 
  onViewTasks,
  onAcceptApplication,
  onRejectApplication,
  isLastOdd = false,
  isSelected = false,
  onSelectionChange,
  showBatchActions = false,
  showApplicationActions = false,
  showAcceptedIcon = false
}) => {
  const getActionStatus = (status) => {
    return getActionStatusBadge(status, Badge);
  };
  
  const getPaymentStatus = (status) => {
    return getPaymentStatusBadge(status, Badge);
  };

  const getApplicationStatusBadge = () => {
    if (member.application_status === 'accepted') {
      return <Badge variant="success">Application Accepted</Badge>;
    }
    if (member.application_status === 'submitted' || member.application_status === 'pending') {
      return <Badge variant="warning">Application Submitted</Badge>;
    }
    return null;
  };

  // Generate username from first and last name if not provided
  const username = member.username || `${member.first_name?.toLowerCase()}_${member.last_name?.toLowerCase()}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-white rounded-xl border border-gray-300 p-4 hover:shadow-md transition-all duration-200 cursor-pointer relative",
        isLastOdd ? "sm:col-span-2" : "",
        isSelected ? "ring-2 ring-primary" : ""
      )}
      onClick={() => onClick && onClick(member)}
    >
      {/* Selection Checkbox for Batch Actions */}
      {showBatchActions && (
        <div className="absolute top-3 left-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectionChange(); // This now calls the handler that uses user_id
            }}
            className="flex items-center justify-center w-5 h-5 rounded border-2 border-gray-300 hover:border-primary transition-colors"
          >
            {isSelected ? (
              <FiCheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <FiSquare className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-3 ${showBatchActions ? 'ml-8' : ''}`}>
          <div className="relative">
            {/* Profile Picture with Placeholder */}
            {member.profile_pic ? (
              <img
                src={member.profile_pic}
                alt={`${member.first_name} ${member.last_name}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-scale-300"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-primary-scale-300 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">
              {member.first_name} {member.last_name}
            </h3>
            <p className="text-xs text-gray-600">@ {username}</p>
          </div>
        </div>
        
        <div className={`flex items-center justify-center gap-2 `}>

          {/* Application Action Buttons - Check for submitted status */}
          {showApplicationActions && (member.application_status === 'submitted' || member.application_status === 'pending') && (
            <div className="flex gap-2">
              <button
                variant="success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAcceptApplication(member);
                }}
                className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <FiUserPlus className="w-4 h-4" />
              </button>
              <button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRejectApplication(member);
                }}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <FiX className="w-4 h-4 " />
              </button>
              
          </div>
          )}

          {/* Accepted Icon - Professional Yellow Circle with White Checkmark - SAME DESIGN FOR ALL */}
          {showAcceptedIcon && (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md ">
                <FiCheck className="w-5 h-5 text-secondary font-bold stroke-2" />
              </div>
          )}

          <FiChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
    </motion.div>
  );
};