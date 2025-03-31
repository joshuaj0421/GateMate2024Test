// @ts-nocheck

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareCheck,
  faCircleExclamation,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

import { c2s, StatusInfo, toReact } from "../components/Status";

type analysisType = {
  className?: string;
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

type FieldInfoType = {
  fieldId: number;
  location: { lat: number; lon: number }[];
  Gates: GateInfoType[];
};

function getFields() {
  return useQuery({
    queryKey: ["fields"],
    queryFn: async () => (await axios.get(
      "/api/v1/field/fieldInfo", { withCredentials: true })).data
  });
}

function HomeAnalysisBox({ className }: analysisType) {
  const fields = getFields();

  if (fields.isLoading || fields.data.message === undefined)
    return <ClipLoader />;
  
  const userFields: FieldInfoType[] = fields.data.message;
  return (
    <div className={ className + " flex flex-col justify-between bg-Corp3" }>
      <div className={ "flex flex-col p-4 gap-4 items-center overflow-y-auto max-h-[70rem]" }>
        {userFields.map((field: FieldInfoType, i) => {
          let [yGates, rGates] = [0, 0];
          field.Gates.forEach((gate: GateInfoType) => {
            yGates += gate.status === "Yellow";
            rGates += gate.status ===    "Red"; });

          const fieldStatus = c2s(rGates ?-1: yGates ?0: 1);
          return <button key={i}
                   className="rounded-xl p-4 bg-Corp2 flex flex-row gap-2 items-center min-w-full hover:bg-Corp4 transition-colors"
                   onClick={() => (window.location.href = `/field?id=${field.fieldId}`)}>
                   <FontAwesomeIcon className={fieldStatus.c} icon={fieldStatus.i} size="2x"/>
                   <p className="text-white">{"Field " + field.fieldId}</p>
                 </button>;
        })}
      </div>
      {toReact(StatusInfo())}
    </div>);
}

export default HomeAnalysisBox;
