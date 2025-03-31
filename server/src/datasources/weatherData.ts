/*

This file is responsible for fetching weather data from the OpenWeather API.
It takes a location as a string and returns the weather data for that location.

We are returning a cleaned version of the weather data for each day.
This includes a 7-day forecast for the specified location including:
- date (in Unix time)
- lat (latitude)
- lon (longitude)
- temp: day, min, max
- text description of each day's weather conditions
- rain (in inches)
- pop (probability of precipitation)

Example of accessing the returned data, you can use the following code:

cleanedWeather.daily.forEach((day: any) => {
  console.log(day.date, day.lat, day.lon, day.temp, day.description, day.rain, day.pop);
});

Example of accessing the returned data for the first day:
console.log(cleanedWeather.daily[0].date, cleanedWeather.daily[0].lat, cleanedWeather.daily[0].lon, cleanedWeather.daily[0].temp, cleanedWeather.daily[0].description, cleanedWeather.daily[0].rain, cleanedWeather.daily[0].pop);


*/

async function getWeather(location: string) {
  const apiKey: string = process.env.weather_api_key ?? "";
  const apiUrl: string = process.env.weather_api_url ?? "";

  const places: { [key: string]: [number, number] } = {
    Fayetteville: [36.061932, -94.160583],
        Simsboro: [35.025371, -90.373155],
        Magnolia: [33.267076, -93.239384] }
  let [lat, lon] = places[location] ?? places["Fayetteville"];

  try {
    const response = await fetch(
      `${apiUrl}?lat=${lat}&lon=${lon}&cnt=7&appid=${apiKey}&units=imperial`);
    if (!response.ok) throw `Bad Response: ${response.status}`;

    const weatherJson: any = await response.json();
    // Returning a cleaned version of weather for each day
    const cleanedWeather = {
      daily: weatherJson.list.map((day: any) => {
        return {
          date: day.dt,
          lat: lat,
          lon: lon,
          temp: {
            day: day.temp.day,
            min: day.temp.min,
            max: day.temp.max,
          },
          description: day.weather[0].description,
          main: day.weather[0].main,
          //Converting rain to inches each day
          rain: day.rain / 25.4 || 0,
          pop: day.pop,
        };
      }),
    };

    return cleanedWeather;
  } catch (error: any) {
    console.error("Error fetching weather data:", error.message);
  }
}

export default getWeather;
