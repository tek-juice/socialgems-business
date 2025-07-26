import React from "react";
import { FiCheck } from "react-icons/fi";

const StepperComponent = ({ steps, activeStep }) => {
  return (
    <div className="w-full py-6 border-b border-gray-200">
      <div className="w-full mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-center ${index === steps.length - 1 ? 'flex-grow-0' : 'flex-grow'}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    index < activeStep
                      ? "bg-green-500 text-white"
                      : index === activeStep
                      ? "bg-secondary text-xs text-white font-semibold"
                      : "border-2 border-gray-300 text-gray-500 text-xs font-normal"
                  }`}
                >
                  {index < activeStep ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    step.id + 1
                  )}
                </div>
                {index === activeStep && (
                  <div className="ml-2 whitespace-nowrap">
                    <div className="font-semibold text-xs text-black">
                      {step.title}
                    </div>
                  </div>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-grow mx-2">
                  <div
                    className={`h-0.5 w-full transition-all ${
                      index < activeStep ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepperComponent;