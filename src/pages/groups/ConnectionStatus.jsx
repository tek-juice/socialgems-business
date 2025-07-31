import { FiWifi, FiWifiOff } from 'react-icons/fi';
import { cn } from '../../lib/utils';

const ConnectionStatus = ({ status, isConnected }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'reconnecting': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Live';
      case 'connecting': return 'Connecting...';
      case 'reconnecting': return 'Reconnecting...';
      case 'error': return 'Error';
      default: return 'Offline';
    }
  };

  return (
    <div className={cn("flex items-center gap-1 text-xs", getStatusColor())}>
      {/* <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} /> */}
      {/* <span>{getStatusText()}</span> */}
    </div>
  );
};

export default ConnectionStatus;