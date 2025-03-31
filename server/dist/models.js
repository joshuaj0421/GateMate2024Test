"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficReturn = exports.Field = exports.Gate = exports.User = exports.WeatherData = exports.DailyWeather = void 0;
const mongoose_1 = require("mongoose");
/*
* IF YOU WANT TO ADD A TYPE:
  Suppose you want to add a type with name <type>. Then:
    In ./interfaces.ts:
    [1] Define the interface with name I<type>
    [2] Define the Document interface by extending both Document and the interface with name I<type>Doc
    [3] Define the Model interface by extending Model with generic parameter equal to your document
        interface and name it I<type>Model. Declare a builder function which takes a single argument of
        your interface from [1], and returns an instance of your document interface from [2].
    In ./models.ts:
    [1] Import your interfaces from ./interfaces.ts
    [2] Define the Schema using generic parameter equal to your document interface with name <type>Schema
    [3] Define a static Schema method which
    [4] Define the Model using the generic parameters equal to your document interface and model
        interface with arguments equal to the collection name (should be the plural of <type>) and the
        schema from [2], and name the model <type>

    Alternatively:

    [1] Send Ben a message on Discord to add it

* See ./datasources/db.ts for information on how to use these types in code
*/
// * Schema Definitions
const DailyWeatherSchema = new mongoose_1.Schema({
    dt: Date,
    sunrise: Number,
    sunset: Number,
    temp: {
        day: Number,
        min: Number,
        max: Number,
        night: Number,
        eve: Number,
        morn: Number,
    },
    feels_like: {
        day: Number,
        night: Number,
        eve: Number,
        morn: Number,
    },
    pressure: Number,
    humidity: Number,
    dew_point: Number,
    wind_speed: Number,
    wind_deg: Number,
    weather: [
        {
            id: Number,
            main: String,
            description: String,
            icon: String,
        },
    ],
    clouds: Number,
    pop: Number,
    rain: Number,
    uvi: Number,
}, {
    strict: "throw",
    strictQuery: false,
});
// bruh
const WeatherDataSchema = new mongoose_1.Schema({
    presentDay: { weather: DailyWeatherSchema, },
    day1: { weather: DailyWeatherSchema },
    day2: { weather: DailyWeatherSchema },
    day3: { weather: DailyWeatherSchema },
    day4: { weather: DailyWeatherSchema },
    day5: { weather: DailyWeatherSchema },
    day6: { weather: DailyWeatherSchema },
    day7: { weather: DailyWeatherSchema },
}, {
    strict: "throw",
    strictQuery: false,
});
const GateSchema = new mongoose_1.Schema({
    gateId: Number,
    idealWaterLevel: Number,
    threshold: Number,
    actualWaterLevel: Number,
    connectionError: mongoose_1.Schema.Types.Boolean,
    lowBattery: mongoose_1.Schema.Types.Boolean,
    status: String,
    location: { lat: Number, lon: Number },
}, {
    strict: "throw",
    strictQuery: false,
});
const FieldSchema = new mongoose_1.Schema({
    fieldId: Number,
    location: [
        {
            _id: false,
            lat: Number,
            lon: Number,
        },
    ],
    Gates: [GateSchema],
}, {
    strict: "throw",
    strictQuery: false,
});
const UserSchema = new mongoose_1.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    fields: [FieldSchema],
}, {
    strict: "throw",
    strictQuery: false,
});
const TrafficReturnSchema = new mongoose_1.Schema({
    userId: Number,
    fieldId: Number,
    gates: [GateSchema],
}, {
    strict: "throw",
    strictQuery: false,
});
// * Static Method Definitions
DailyWeatherSchema.statics.buildDailyWeather = (args) => {
    return new exports.DailyWeather(args);
};
WeatherDataSchema.statics.buildWeatherData = (args) => {
    return new exports.WeatherData(args);
};
UserSchema.statics.buildUser = (args) => {
    return new exports.User(args);
};
FieldSchema.statics.buildField = (args) => {
    return new exports.Field(args);
};
GateSchema.statics.buildGate = (args) => {
    return new exports.Gate(args);
};
TrafficReturnSchema.statics.buildTrafficReturn = (args) => {
    return new exports.TrafficReturn(args);
};
//* Model Instantiations
exports.DailyWeather = (0, mongoose_1.model)("daily_weather", DailyWeatherSchema);
exports.WeatherData = (0, mongoose_1.model)("weather_data", WeatherDataSchema);
exports.User = (0, mongoose_1.model)("users", UserSchema);
exports.Gate = (0, mongoose_1.model)("gates", GateSchema);
exports.Field = (0, mongoose_1.model)("fields", FieldSchema);
exports.TrafficReturn = (0, mongoose_1.model)("traffic_returns", TrafficReturnSchema);
