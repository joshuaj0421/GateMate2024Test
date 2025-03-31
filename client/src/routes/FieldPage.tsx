//@ts-nocheck
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import "@reach/combobox/styles.css";
import { flushSync } from 'react-dom';

import FieldGLMap from "../components/FieldMap";
import GateAnalysisBox from "../components/GateAnalysis";
import GateBanner from "../components/GateBanner";

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

function checkSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const data = await axios.get("/api/v1/user/session");
      return data.data;
    },
  });
}

function getGates(fieldId: string) {
  return useQuery({
    queryKey: ["gates"],
    queryFn: async () => {
      const data = await axios.get(`/api/v1/gate/find/${fieldId}`, {
        withCredentials: true,
      });
      return data.data;
    },
  });
}

function Home() {
  const params = new URLSearchParams(window.location.search);
  const fieldId = params.get("id");
  const gates = getGates(fieldId ?? "");
  const session = checkSession();

  if( session.isLoading ||       session.data === undefined
     || gates.isLoading || gates.data.message === undefined)
        return <ClipLoader />;
  
  if(session.data.status === "200" && !gates.isLoading) {
    const fieldGates: GateInfoType[] = gates.data.message;
    const the = {};
    const field = <FieldGLMap className="basis-10/12" fieldGates={fieldGates} the={the}/>;
    return <div className="flex flex-row font-Arvo font-bold">
             <div className="flex flex-col basis-2/12">
               <GateBanner />
               <GateAnalysisBox fieldGates={fieldGates} the={the} />
             </div>
             {field}
           </div>;
  }

  if(session.data.status === "404") window.location.href = `/`;
}

export default Home;
