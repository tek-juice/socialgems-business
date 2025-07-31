import { formatDateSeparator } from './helpers';

const DateSeparator = ({ timestamp }) => (
  <div className="flex items-center justify-center my-4">
    <div className="bg-white backdrop-blur-sm rounded-full px-3 py-0.5 shadow-sm border border-primary/20">
      <span className="text-xs text-secondary font-semibold">
        {formatDateSeparator(timestamp)}
      </span>
    </div>
  </div>
);

export default DateSeparator;