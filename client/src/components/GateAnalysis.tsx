// @ts-nocheck
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { c2s, StatusInfo, toReact } from "../components/Status";

type analysisType = {
  className?: string;
  fieldGates: GateInfoType[];
};

type GateInfoType = {
  gateId: number;
  idealWaterLevel: number;
  threshold: number;
  actualWaterLevel: number;
  connectionError: boolean;
  lowBattery: boolean;
  status: string;
  location: { lat: number; lon: number };
};

function GateAnalysisBox({ fieldGates, the }) {
  return (
    <div className="flex flex-col space-between bg-Corp3 h-full">
      <div className="flex flex-col p-4 gap-4 items-center overflow-y-auto">
        {fieldGates.map((gate: GateInfoType, index: number) => {
          const stat = c2s(gate.status);
          return <button key={index}
                   className="rounded-xl p-4 bg-Corp2 flex flex-row gap-2 items-center min-w-full hover:bg-Corp4 transition-colors"
                   onClick={() => the.activator(gate)}>
                   <FontAwesomeIcon className={stat.c} icon={stat.i} size="2x"/>
                   <p className="text-white">{"Gate " + gate.gateId}</p>
                 </button>;
        })}
      </div>
      {(_=>{let t=StatusInfo(); console.log("t", t); t.style.marginTop="auto"; return toReact(t)})()}
    </div>
  );
}

export default GateAnalysisBox;
