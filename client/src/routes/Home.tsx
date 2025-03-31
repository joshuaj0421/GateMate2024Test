import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import UserBanner from "../components/UserBanner";
import WeatherBanner from "../components/WeatherBanner";
import MainGLMap from "../components/MainMap";
import ClipLoader from "react-spinners/ClipLoader";
import HomeAnalysisBox from "../components/FieldAnalysis";
import "@reach/combobox/styles.css";

type UserData = {
  firstName: string;
  lastName: string;
  email: string;
};

type HeaderProps = {
  user: UserData;
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

function getTraffic() {
  return useQuery({
    queryKey: ["traffic"],
    queryFn: async () => {
      const traffic = await axios.get("/api/v1/traffic/gen1");
      return traffic.data
    }
  })
}

function getUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const data = await axios.get("/api/v1/user/getUser", {
        withCredentials: true,
      });
      return data.data;
    },
  });
}

// We only want to render the data, so we create a new component called Weather that will handle the logic and rendering of the data (This keeps organzation clean, and debugging easy)
//TODO Dark and Light mode for theme
function Home() {
  const session = checkSession();
  const userData = getUser();
  const traffic = getTraffic();

  useEffect(() => {
    if(session.isLoading || session.data === undefined) return;
    if(session.data.status === "200") {
      if(traffic.isLoading || traffic.data === undefined) return;

      if(traffic.data.status === "200")
        console.log(traffic.data);
      else
        window.location.href = `/`;
    }else{
      window.location.href = `/`;
    }
  }, [session, userData, traffic]);

  if(session.isLoading || userData.isLoading || traffic.isLoading)
    return <ClipLoader />;
  
  const Header = ({ user }: HeaderProps) => 
    <div className="w-full flex flex-row font-Arvo font-bold px-2 py-2">
      <WeatherBanner className={"flex-1"} />
      <UserBanner userName={user.firstName} className={"w-1/12"}/>
    </div>;
  
  const Body = () => 
    <div className={"w-full h-full flex flex-row font-Arvo font-bold"}>
      <HomeAnalysisBox className="w-2/12" />
      <MainGLMap className="w-10/12 grow-1" />
    </div>;
  
  return <div className="flex flex-col w-full h-full grow-1">
           <div className="w-full">
             <Header user={userData.data} />
           </div>
           <div className="flex flex-col w-full h-full grow-1">
             <Body />
           </div>
         </div>;
}

export default Home;
