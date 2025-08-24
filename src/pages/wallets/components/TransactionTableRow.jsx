import { FiArrowDownLeft, FiArrowUpRight, FiDollarSign } from "react-icons/fi";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { FaCheckCircle } from "react-icons/fa";
import { MdAccessTimeFilled, MdError } from "react-icons/md";
import { Badge, Button } from "./UIComponents";
import { TableRow, TableCell } from "./Table";

const TransactionTableRow = ({ transaction, onClick }) => {
  const getTransactionIcon = (type) => {
    switch (type.toUpperCase()) {
      case "DEPOSIT":
        return <FiArrowDownLeft className="w-5 h-5 text-green-600" />;
      case "WITHDRAWAL":
      case "WITHDRAW":
        return <FiArrowUpRight className="w-5 h-5 text-red-600" />;
      case "CAMPAIGN_PAYMENT":
        return <HiArrowsRightLeft className="w-5 h-5 text-primary" />;
      default:
        return <FiDollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return (
          <Badge variant="success">
            <FaCheckCircle style={{ marginRight: 5 }} />
            Success
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="warning">
            <MdAccessTimeFilled style={{ marginRight: 5 }} />
            Pending
          </Badge>
        );
      case "FAILED":
      case "ERROR":
        return (
          <Badge variant="error">
            <MdError style={{ marginRight: 5 }} />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getAmountColor = (type) => {
    if (
      type.toLowerCase().includes("deposit") ||
      type.toLowerCase().includes("credit") ||
      type.toLowerCase().includes("campaign")
    ) {
      return "text-green-600 font-semibold";
    } else if (
      type.toLowerCase().includes("withdrawal") ||
      type.toLowerCase().includes("withdraw") ||
      type.toLowerCase().includes("debit")
    ) {
      return "text-red-600 font-semibold";
    }
    return "text-gray-800 font-medium";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-gray-50" 
      onClick={() => onClick(transaction)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getTransactionIcon(transaction.trans_type)}
          </div>
          <div>
            <div className="font-medium text-sm">
              {transaction.trans_type === "CAMPAIGN_PAYMENT" ? "Campaign Payment" : 
               transaction.trans_type === "DEPOSIT" ? "Deposit" : 
               transaction.trans_type === "WITHDRAWAL" ? "Withdrawal" : 
               transaction.trans_type}
            </div>
            <div className="text-xs text-gray-500">ID: {transaction.trans_id}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-900">{formatDate(transaction.created_on)}</div>
      </TableCell>
      <TableCell>
        <div className={`text-sm ${getAmountColor(transaction.trans_type)}`}>
          {transaction.currency} {Number(transaction.amount).toFixed(2)}
        </div>
      </TableCell>
      <TableCell>
        {getStatusBadge(transaction.status)}
      </TableCell>
      <TableCell>
        {transaction.narration && (
          <div className="text-sm text-gray-600 max-w-xs truncate">
            {transaction.narration}
          </div>
        )}
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-3 text-xs text-secondary text-semibold hover:text-bold hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            onClick(transaction);
          }}
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default TransactionTableRow;