import * as React from "react"
import { cn } from "../../../../lib/utils"
import { Button } from "../Tables/button"

const EmptyState = ({
  title,
  description,
  icons = [],
  action,
  className
}) => {
  return (
    <div className={cn(
      "bg-white/80 border-primary/30 hover:border-primary/50 text-center",
      "border-2 border-dashed rounded-xl p-14 w-full max-w-full mx-auto",
      "group hover:bg-primary/5 transition duration-500 hover:duration-200",
      className
    )}>
      <div className="flex justify-center isolate">
        {icons.length === 3 ? (
          <>
            <div className="bg-white size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-primary/20 group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[0], {
                className: "w-6 h-6 text-secondary/70"
              })}
            </div>
            <div className="bg-white size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-primary/20 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[1], {
                className: "w-6 h-6 text-secondary/70"
              })}
            </div>
            <div className="bg-white size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-primary/20 group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[2], {
                className: "w-6 h-6 text-secondary/70"
              })}
            </div>
          </>
        ) : (
          <div className="bg-white size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-primary/20 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
            {icons[0] && React.createElement(icons[0], {
              className: "w-6 h-6 text-secondary/70"
            })}
          </div>
        )}
      </div>
      <h2 className="text-secondary font-semibold text-lg mt-6">{title}</h2>
      <p className="text-sm text-secondary/70 mt-2 whitespace-pre-line">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className={cn(
            "mt-6 bg-gradient-to-r from-primary to-[#E8C547] border-primary text-secondary hover:from-[#E8C547] hover:to-primary",
            "shadow-sm active:shadow-none"
          )}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }