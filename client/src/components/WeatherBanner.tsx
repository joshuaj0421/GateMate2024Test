import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faCloudSun, faCloudRain, faSnowflake, faCloudBolt,
         faCloudShowersHeavy } from "@fortawesome/free-solid-svg-icons";
import "@reach/combobox/styles.css";

type BannerProps = {
  className?: string;
};
type dailyWeather = {
  date: number;
  temp: {
    day: number;
    min: number;
    max: number;
  };
  description: string;
  main: string;
  rain: number;
  pop: number;
};
type weatherData = dailyWeather[];
type weatherIconType = {
  weather: string;
};

function fetchWeather(weatherArea: string, queryKey: string) {
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => (await axios.get(`/api/v1/home/weather?input=${weatherArea}`)).data
  });
}

function WeatherIcon({ weather }: weatherIconType) {
  if (weather === "Thunderstorm") return <FontAwesomeIcon icon={faCloudBolt}/>;
  if (weather ===      "Drizzle") return <FontAwesomeIcon icon={faCloudRain}/>;
  if (weather ===         "Rain") return <FontAwesomeIcon icon={faCloudShowersHeavy}/>;
  if (weather ===         "Snow") return <FontAwesomeIcon icon={faSnowflake}/>;
  if (weather ===        "Clear") return <FontAwesomeIcon icon={faSun}/>;
                                  return <FontAwesomeIcon icon={faCloudSun}/>; }

function WeatherBar(weather: weatherData) {
  const weathers = [...Array(7)].map((_,i)=>weather[i]).map(w => ({...w,
      header: new Date(w.date * 1000).toLocaleDateString("en-US", { weekday: "short" })}));

  const colClassName = "flex flex-col items-center gap-1";
  return (
    <div className="flex flex-row items-center justify-between"
         style={{maxWidth:"85vw",gap:"10px",overflowX:"auto",flexShrink:"1"}}> {
      weathers.map((w,i) =>
        <div key={i} className="w-full flex flex-row text-sm items-center gap-3 rounded-md p-2 bg-Corp2">
          <div className={colClassName}>
            <p>{w.header}</p>
            <WeatherIcon weather={w.main} />
            <p>{w.temp.day + " ℉"}</p>
          </div>
          <div className={colClassName}>
            <p>{(w.pop * 100).toFixed(1) + "% of rain"}</p>
            <p>{w.rain.toFixed(2) + " inches"}</p>
          </div>
        </div>) }
    </div>);
}

export function WeatherBanner(props: BannerProps) {
  const [weatherArea, setWeatherArea] = useState("Fayetteville");
  const fayettevilleWeather = fetchWeather("Fayetteville", "fay");
  const simsboroWeather = fetchWeather("Simsboro", "sim");
  const magnoliaWeather = fetchWeather("Magnolia", "mag");

  // If results are loading or undefined we can not rende r the data, therefore we need to return some sort of "loading" component to the user
  if (fayettevilleWeather.isLoading || fayettevilleWeather === undefined ||
          simsboroWeather.isLoading ||     simsboroWeather === undefined ||
          magnoliaWeather.isLoading ||     magnoliaWeather === undefined)
    return <ClipLoader />;

  const fayWeather: weatherData = fayettevilleWeather.data;
  const simWeather: weatherData = simsboroWeather.data;
  const magWeather: weatherData = magnoliaWeather.data;
  //TODO Chevron actually does NOT make a clickable dropdown, but its there for show fix this :)
  return (
    <div className={props.className + " w-full mx-auto bg-Corp3 shadow-md"}>
        <select className="bg-transparent text-white text-sm outline-none"
                value={weatherArea}
                onChange={(e) => setWeatherArea(e.target.value)}>
          <option className="text-black" value="Fayetteville">Fayetteville</option>
          <option className="text-black" value="Simsboro">Simsboro</option>
          <option className="text-black" value="Magnolia">Magnolia</option>
        </select>
      {weatherArea === "Fayetteville" ? <WeatherBar {...fayWeather} /> : null}
      {weatherArea === "Simsboro"     ? <WeatherBar {...simWeather} /> : null}
      {weatherArea === "Magnolia"     ? <WeatherBar {...magWeather} /> : null}
    </div>
    );
}

export default WeatherBanner;
