// Helper functions for HTML processing
export const decodeHtmlEntities = (text) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };
  
  export const formatHtmlContent = (htmlContent) => {
    if (!htmlContent) return '';
    
    let decodedContent = decodeHtmlEntities(htmlContent);
    
    decodedContent = decodedContent.replace(/<h>/g, '<h3 class="text-xs font-bold text-gray-900 mt-4 mb-2 first:mt-0">');
    decodedContent = decodedContent.replace(/<\/h>/g, '</h3>');
    
    decodedContent = decodedContent.replace(/<li>/g, '<div class="flex items-start gap-2 mb-1"><span class="text-xs text-gray-600 mt-0.5">•</span><span class="text-xs text-gray-700 flex-1">');
    decodedContent = decodedContent.replace(/<\/li>/g, '</span></div>');
    
    decodedContent = decodedContent.replace(/<p>/g, '<p class="text-xs text-gray-700 mb-2">');
    
    decodedContent = decodedContent.replace(/<strong>/g, '<strong class="font-semibold text-gray-900">');
    
    decodedContent = decodedContent.replace(/<p class="text-xs text-gray-700 mb-2"><br><\/p>/g, '');
    decodedContent = decodedContent.replace(/<p class="text-xs text-gray-700 mb-2">\s*<\/p>/g, '');
    
    return decodedContent;
  };
  
  export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  };
  
  export const getPaymentStatusBadge = (status, Badge) => {
    const statusConfig = {
      not_paid: { label: 'Not Paid', variant: 'warning' },
      paid: { label: 'Paid', variant: 'success' },
      in_review: { label: 'In Review', variant: 'info' },
      rejected: { label: 'Rejected', variant: 'error' }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  
  export const getActionStatusBadge = (status, Badge) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'started':
        return <Badge variant="info">Started</Badge>;
      case 'not_started':
        return <Badge variant="default">Not Started</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  export const getStatusBadge = (campaign, Badge) => {
    if (campaign.status === 'draft') return <Badge variant="warning">Draft</Badge>;
    if (campaign.status === 'completed') return <Badge variant="info">Completed</Badge>;
    if (campaign.closed_date) return <Badge variant="error">Closed</Badge>;
    const endDate = new Date(campaign.end_date);
    const startDate = new Date(campaign.start_date);
    const now = new Date();
    
    if (now < startDate) return <Badge variant="warning">Open to Applications</Badge>;
    if (now > endDate) return <Badge variant="info">Completed</Badge>;
    return <Badge variant="success">Active</Badge>;
  };