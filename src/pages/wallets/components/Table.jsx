function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  
  export const Table = ({ className, children, ...props }) => (
    <div className="relative w-full overflow-auto scrollbar-hide">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props}>
        {children}
      </table>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
  
  export const TableHeader = ({ className, children, ...props }) => (
    <thead className={cn(className)} {...props}>
      {children}
    </thead>
  );
  
  export const TableBody = ({ className, children, ...props }) => (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
      {children}
    </tbody>
  );
  
  export const TableRow = ({ className, children, ...props }) => (
    <tr
      className={cn(
        "border-b border-gray-200 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
  
  export const TableHead = ({ className, children, ...props }) => (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-gray-600 bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
  
  export const TableCell = ({ className, children, ...props }) => (
    <td
      className={cn("p-4 align-middle", className)}
      {...props}
    >
      {children}
    </td>
  );