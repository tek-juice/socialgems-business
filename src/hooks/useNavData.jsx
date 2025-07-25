// src/hooks/useNavData.jsx
import { useMemo } from 'react';
import { 
  FiHome, 
  FiCreditCard, 
  FiBriefcase, 
  FiPlus, 
  FiLogOut 
} from 'react-icons/fi';

export const navData = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <FiHome />,
  },
  {
    title: 'Wallet',
    path: '/wallet',
    icon: <FiCreditCard />,
  },
  {
    title: 'Campaigns',
    icon: <FiBriefcase />,
    children: [
      {
        title: 'My Campaigns',
        path: '/campaigns',
        icon: <FiBriefcase />,
      },
      {
        title: 'Create Campaign',
        path: '/campaigns/create',
        icon: <FiPlus />,
      }
    ],
  },
  {
    title: 'Log Out',
    path: '/logout',
    icon: <FiLogOut />,
  },
];

export default function useNavData() {
  const data = useMemo(() => navData, []);
  return data;
}