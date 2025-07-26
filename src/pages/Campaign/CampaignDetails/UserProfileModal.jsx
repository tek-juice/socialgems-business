import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiCheck,
  FiXCircle,
  FiActivity,
  FiStar,
  FiUsers,
  FiMapPin,
  FiUser,
} from "react-icons/fi";

import { LuGem } from "react-icons/lu";

import { RiVerifiedBadgeFill } from "react-icons/ri";

import { MdCampaign } from "react-icons/md";

import { Badge, Button } from "./UIComponents";
import { TasksAccordion } from "./TasksAccordion";
import { formatDate } from "./utils";
import { get, post } from "../../../utils/service";
import { toast } from "sonner";

export const UserProfileModal = ({
  isOpen,
  onClose,
  member,
  onPayClick,
  onRejectClick,
  onAcceptClick,
  industries,
  countries,
  getInfluencerDetails,
  campaignId, // Add this prop to pass campaign_id
}) => {
  const [showFullBio, setShowFullBio] = useState(false);
  const [influencerDetails, setInfluencerDetails] = useState(null);
  const [socialSites, setSocialSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch social sites data
  useEffect(() => {
    const fetchSocialSites = async () => {
      try {
        const response = await get("users/socialSites");
        if (response?.status === 200 && response?.data) {
          setSocialSites(response.data);
        }
      } catch (error) {
        console.error("❌ Error fetching social sites:", error);
      }
    };

    fetchSocialSites();
  }, []);

  // Fetch detailed influencer data when modal opens
  useEffect(() => {
    const fetchInfluencerData = async () => {
      if (isOpen && member?.user_id) {
        setLoading(true);
        setError(null);

        try {
          // Direct API call if getInfluencerDetails is not available
          let details = null;

          if (getInfluencerDetails) {
            details = await getInfluencerDetails(member.user_id);
          } else {
            const response = await get(
              `users/influencerDetails/${member.user_id}`
            );

            if (response?.status === 200 && response?.data) {
              details = response.data;
            }
          }

          setInfluencerDetails(details);
        } catch (error) {
          console.error("❌ Error fetching influencer details:", error);
          setError("Failed to load influencer details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInfluencerData();
  }, [isOpen, member?.user_id, getInfluencerDetails]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInfluencerDetails(null);
      setShowFullBio(false);
      setError(null);
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewText("");
    }
  }, [isOpen]);

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewText.trim()) {
      toast.error("Please provide both rating and review text");
      return;
    }

    if (!campaignId || !member?.user_id) {
      toast.error("Missing campaign or user information");
      return;
    }

    setSubmittingReview(true);
    
    try {
      const reviewData = {
        campaign_id: campaignId,
        user_id: member.user_id,
        rating: reviewRating,
        review: reviewText.trim()
      };

      const response = await post("campaigns/addReview", reviewData);
      
      if (response?.status === 200) {
        toast.success("Review submitted successfully!");
        setShowReviewForm(false);
        setReviewRating(0);
        setReviewText("");
        
        // Optionally refresh influencer details to show new review
        if (getInfluencerDetails) {
          const updatedDetails = await getInfluencerDetails(member.user_id);
          setInfluencerDetails(updatedDetails);
        }
      } else {
        toast.error("Failed to submit review");
      }
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!isOpen || !member) return null;

  // Get country name using the fetched countries data
  const getCountryName = (isoCode) => {
    if (!countries.length || !isoCode) return null;
    const country = countries.find((c) => c.iso_code === isoCode);
    return country ? country.name : null;
  };

  // Get social media icon URL
  const getSocialIcon = (platform) => {
    const socialSite = socialSites.find(
      (site) => site.sm_name.toLowerCase() === platform.toLowerCase()
    );
    return socialSite ? socialSite.logo : null;
  };

  // Format follower count
  const formatFollowerCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Get level badge color
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "gold":
        return "text-secondary";
      case "silver":
        return "text-gray-800";
      case "bronze":
        return "text-orange-800";
      case "platinum":
        return "text-purple-800";
      default:
        return "text-gray-800";
    }
  };

  // Check if bio is long enough to need "Read more"
  const bioNeedsReadMore =
    influencerDetails?.about && influencerDetails.about.length > 150;

  // Get active social stats (only platforms with followers > 0)
  const getActiveSocialStats = () => {
    if (!influencerDetails?.socialStats) return [];

    return Object.entries(influencerDetails.socialStats)
      .filter(([platform, count]) => count > 0)
      .map(([platform, count]) => ({
        platform,
        count,
        icon: getSocialIcon(platform),
      }))
      .slice(0, 4); // Show max 4 platforms
  };

  const activeSocialStats = getActiveSocialStats();

  // Check if we have reviews
  const hasReviews = influencerDetails?.reviews && influencerDetails.reviews.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 shadow-xl backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-all duration-200 "
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto max-h-[80vh]">
          {/* Header Section */}
          <div className="p-6 bg-white">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={member.profile_pic || "/api/placeholder/64/64"}
                  alt={influencerDetails?.name || member.full_name || "Profile"}
                  className="w-16 h-16 rounded-full object-cover shadow-md"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    {influencerDetails?.name ||
                      member.full_name ||
                      `${member.first_name} ${member.last_name}`}
                  </h2>
                  {influencerDetails?.verified && (
                    <RiVerifiedBadgeFill className="w-4 h-4 text-secondary" />
                  )}
                </div>

                {influencerDetails?.level && (
                  <span
                    className={`inline-block text-xs font-medium ${getLevelColor(
                      influencerDetails.level
                    )}`}
                  >
                    {influencerDetails.level} level
                  </span>
                )}

                {/* Category Tags */}
                {influencerDetails?.categories &&
                  Array.isArray(influencerDetails.categories) &&
                  influencerDetails.categories.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {influencerDetails.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-scale-100 text-secondary rounded-full text-xs font-medium uppercase"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mx-6 py-8 text-center">
              <div className="w-8 h-8 border-2 border-primary-scale-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
              <p className="text-sm text-gray-600">
                Loading profile details...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="mx-6 py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-red-600 hover:text-red-700 underline mt-2"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid - Only show if we have influencer details */}
          {influencerDetails && !loading && (
            <div className="mx-6 py-4 bg-yellow-50 rounded-lg border border-primary-scale-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <LuGem className="w-4 h-4 text-primary-scale-600" />
                    <span className="text-sm font-bold text-gray-900">
                      {influencerDetails?.gemPoints || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Gem points</p>
                </div>
                <div className="border-x border-dotted border-primary-scale-600">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MdCampaign className="w-4 h-4 text-primary-scale-600" />
                      <span className="text-lg font-bold text-gray-900">
                        {influencerDetails?.campaigns || 0}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Campaigns</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FiStar className="w-4 h-4 text-primary-scale-600" />
                    <span className="text-lg font-bold text-gray-900">
                      {influencerDetails?.sgRating || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">SG Rating</p>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Stats */}
          {activeSocialStats.length > 0 && !loading && (
            <div className="mx-6 py-4">
              <div className="grid grid-cols-4 gap-3">
                {activeSocialStats.map(({ platform, count, icon }) => (
                  <div
                    key={platform}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    {icon ? (
                      <img
                        src={icon}
                        alt={platform}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <FiUsers className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatFollowerCount(count)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {platform}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Me */}
          {influencerDetails?.about && !loading && (
            <div className="mx-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">👋</span>
                <h3 className="text-sm font-semibold text-gray-900">
                  About me
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {bioNeedsReadMore && !showFullBio
                  ? `${influencerDetails.about.substring(0, 150)}...`
                  : influencerDetails.about}
                {bioNeedsReadMore && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-primary-scale-600 hover:text-primary-scale-700 ml-2 font-medium text-sm"
                  >
                    {showFullBio ? "Read less" : "Read more"}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Location */}
          {influencerDetails &&
            (influencerDetails?.address || influencerDetails?.location) &&
            !loading && (
              <div className="mx-6 py-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <FiMapPin className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Location
                  </h3>
                </div>
                <p className="text-sm text-gray-700">
                  {influencerDetails.address &&
                  getCountryName(influencerDetails.location)
                    ? `${influencerDetails.address}, ${getCountryName(
                        influencerDetails.location
                      )}`
                    : influencerDetails.address ||
                      getCountryName(influencerDetails.location)}
                </p>
              </div>
            )}

          {/* Reviews Section - Show if there are reviews OR if we can write a review */}
          {(hasReviews || campaignId) && !loading && (
            <div className="mx-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiStar className="w-4 h-4 text-primary-scale-500" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    {hasReviews ? "Reviews" : "Write Review"}
                  </h3>
                </div>
                {campaignId && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-xs font-medium text-primary-scale-600 hover:text-primary-scale-700"
                  >
                    {showReviewForm ? "Cancel" : "Write Review"}
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Write a Review</h4>
                  
                  {/* Rating Stars */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="p-1"
                        >
                          <FiStar
                            className={`w-5 h-5 ${
                              star <= reviewRating
                                ? "text-primary-scale-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Review</p>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience working with this influencer..."
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-scale-500 focus:border-transparent"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {reviewText.length}/500 characters
                    </p>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewRating || !reviewText.trim()}
                      className="flex-1 px-4 py-2 bg-primary-scale-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-scale-600 transition-colors"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewRating(0);
                        setReviewText("");
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Show existing reviews if they exist */}
              {hasReviews && (
                <div className="space-y-4">
                  {influencerDetails.reviews
                    .slice(0, 3)
                    .map((review, index) => (
                      <div key={index} className="p-4 bg-gray-100 rounded-xl">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1  border-b border-gray-300">
                          <div className="flex items-center justify-between mb-3">
                              <div className="flex gap-2 items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                  <FiUser className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex gap-1 items-center">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {review.reviewer}
                                    </p>
                                    <span>-</span>
                                    <p className="text-xs text-gray-500">
                                      {review.reviewerTitle}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <FiStar
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.rating
                                            ? "text-primary-scale-500 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-xs font-medium text-gray-700 ml-1">
                                      {review.rating}.0
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-gray-500 mt-2">
                                {(() => {
                                  const now = new Date();
                                  const reviewDate = new Date(review.date);
                                  const diffInSeconds = Math.floor((now - reviewDate) / 1000);
                                  
                                  if (diffInSeconds < 60) {
                                    return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
                                  }
                                  
                                  const diffInMinutes = Math.floor(diffInSeconds / 60);
                                  if (diffInMinutes < 60) {
                                    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
                                  }
                                  
                                  const diffInHours = Math.floor(diffInMinutes / 60);
                                  if (diffInHours < 24) {
                                    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
                                  }
                                  
                                  const diffInDays = Math.floor(diffInHours / 24);
                                  if (diffInDays < 7) {
                                    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
                                  }
                                  
                                  const diffInWeeks = Math.floor(diffInDays / 7);
                                  if (diffInWeeks < 4) {
                                    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
                                  }
                                  
                                  const diffInMonths = Math.floor(diffInDays / 30);
                                  if (diffInMonths < 12) {
                                    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
                                  }
                                  
                                  const diffInYears = Math.floor(diffInDays / 365);
                                  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>

                        <p className="text-xs mt-2 text-gray-700">
                        {formatDate(review.date)}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              {/* Show message when no reviews exist but review form is available */}
              {!hasReviews && !showReviewForm && campaignId && (
                <div className="text-center py-6">
                  <FiStar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">No reviews yet</p>
                  <p className="text-xs text-gray-400">Be the first to review this influencer's work!</p>
                </div>
              )}
            </div>
          )}

          {/* Tasks Section */}
          {member.tasks && member.tasks.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <FiActivity className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Campaign Tasks
                </h3>
              </div>
              <TasksAccordion tasks={member.tasks} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};