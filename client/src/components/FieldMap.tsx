import { Layer, Map, Marker, Source } from "react-map-gl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ClipLoader from "react-spinners/ClipLoader";
import { useState } from "react";
import { Feature } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCircle, faCircleXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import { SiLinuxcontainers } from "react-icons/si";
import { TiBatteryFull, TiBatteryLow } from "react-icons/ti";
import axios from "axios";

import { c2s } from "../components/Status";

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

type MapType = {
  className?: string;
  fieldGates: GateInfoType[];
};

function Field(cords: number[][]): Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [cords],
    },
  };
}

async function createGate(cords: number[], fieldId: string) {
  return (await axios.post(
    `/api/v1/gate/create/${fieldId}`,
    { idealWaterLevel: 1.5,
      threshold: 2,
      actualWaterLevel: 1.6,
      connectionError: false,
      lowBattery: false,
      status: "Green",
      location: { lon: cords[0], lat: cords[1] } },
    { withCredentials: true })).data;
}

async function updateGate(
  fieldId: string, gateId: number, idealWaterLevel: number,
  threshold: number, actualWaterLevel: number, connectionError: boolean,
  lowBattery: boolean, status: string, location: any) {
  return (await axios.put(
    `/api/v1/gate/${fieldId}/${gateId}`,
    { idealWaterLevel, threshold, actualWaterLevel,
      connectionError, lowBattery, status, location },
    { withCredentials: true })).data;
}

async function deleteGate(fieldId: string, gateId: number) {
  return (await axios.delete(`/api/v1/gate/${fieldId}/${gateId}`,
    { withCredentials: true })).data;
}

function getField(fieldId: string) {
  return useQuery({
    queryKey: ["field"],
    queryFn: async () => (await axios.get(
      `/api/v1/field/${fieldId}`, { withCredentials: true })).data
  });
}

function FieldGLMap({ className, fieldGates, the }) {
  const params = new URLSearchParams(window.location.search);
  const fieldId = params.get("id");

  const [showSettings     , setShowSettings     ] = useState(false);
  const [showEdit         , setShowEdit         ] = useState(false);
  const [addGate          , setAddGate          ] = useState(false);
  const [gateCords        , setGateCords        ] = useState<number[]>([]);
  const [activeGate       , setActiveGate       ] = useState<GateInfoType>();
  const [refetch          , setRefetch          ] = useState(false);
  const [currentWaterLevel, setCurrentWaterLevel] = useState('');
  const [idealWaterLevel  , setIdealWaterLevel  ] = useState('');
  const [threshold        , setThreshold        ] = useState('');
  
  const gatePopup = the.activator = g => (setShowSettings(true),setActiveGate(g));
  
  const bareGate = {
    gateId: -1, idealWaterLevel: -1, threshold: -1, actualWaterLevel: -1,
    connectionError: false, lowBattery: false, status: '',
    location: { lat: -1, lon: -1 } };

  const queryClient = useQueryClient();

  if (refetch) {
    queryClient.invalidateQueries({
      queryKey: ["gates"],
      refetchType: "all", // refetch both active and inactive queries
    });
    setRefetch(!refetch);
  }

  const field = getField(fieldId ?? '');

  if (field.isLoading || field.data.message === undefined)
    return <ClipLoader/>;

  if (field.data.status === "200") { // why is status a string
    const selectedField: FieldInfoType = field.data.message;
    const cords: number[][] = [];
    selectedField.location.forEach(loc => {
      if (!cords.find(c => c[0]===loc.lat && c[1]===loc.lon))
        cords.push([loc.lat, loc.lon]);
    });

    const fieldFeature = Field(cords);

    let [VPLon, VPLat] = [-94.160583, 32.061932];
    const geo = fieldFeature.geometry;
    // TODO? following doesn't make sense if the centroid is outside the polygon [tbf that'd'e' weird for land plots]
    if (geo.type === "Polygon" && geo.coordinates[0][0][0] && geo.coordinates[0][0][1]) {
      const verts = geo.coordinates[0];
      [VPLon, VPLat] = [0,1].map(i => verts.reduce((x,y)=>x+y[i], 0)).map(x => x/verts.length);
    }

    // TODO Make zoom variable, and this needs to be based off the area of the field. Calculate area and make size's
      // and these size's need to be correlated with zoom
    return (
      <div className={ "relative " + className }>
        <Map
          onClick={e => setGateCords(addGate ?[e.lngLat.lng, e.lngLat.lat]: [])}
          mapboxAccessToken={import.meta.env.VITE_MAP_BOX_KEY}
          mapLib={import("mapbox-gl")}
          initialViewState={{
            longitude: VPLon,
            latitude: VPLat,
            zoom: 16,
          }}
          style={{
            width: "100%",
            height: "100vh",
            aspectRatio: 1 / 1,
            overflow: '',
          }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12">
          <Source type="geojson" data={fieldFeature}>
            <Layer id={`polygon`}
                   type="fill"
                   paint={{
                     "fill-color": "#088",
                     "fill-opacity": 0.5,
                     "fill-outline-color": "black" }}/>
            {fieldGates.map((gate: GateInfoType) => {
              const p = c2s(gate.status);
              let gateStatus = { color: p.c, icon: p.i };
              
              return (
                <Marker key={gate.gateId}
                        style={{ position: "absolute" }}
                        longitude={gate.location.lon}
                        latitude={gate.location.lat}>
                  <button className={gateStatus.color}
                          onClick={() => gatePopup(gate)}>
                    <div className="flex flex-row gap-1 items-center">
                      <FontAwesomeIcon icon={gateStatus.icon} size="2x"/>
                      <p className="text-xl text-black font-Arvo">
                        {"Gate " + gate.gateId}
                      </p>
                    </div>
                    <SiLinuxcontainers size="5em"/>
                  </button>
                </Marker>
              );
            })}
          </Source>
          <Marker key={gateCords[0]}
                  style={{ position: "absolute" }}
                  longitude={gateCords[0] ?? 0}
                  latitude={gateCords[1] ?? 0}>
            <FontAwesomeIcon icon={faCircle} size="2x"/>
          </Marker>
        </Map>
        <div className="absolute top-4 right-4 border rounded-xl p-2 bg-Corp3 border-Corp2 text-Corp1 flex flex-col gap-2">
          {addGate ? (
            <div className="flex flex-col items-center gap-2">
              <p>Place gate on map with a click</p>

              {gateCords.length > 1 ? (
                <table>
                  <tbody>
                    <tr className="text-xs border border-white">
                      <td className="p-1">{gateCords[0].toFixed(3)}</td>
                      <td className="p-1">{gateCords[1].toFixed(3)}</td>
                    </tr>
                  </tbody>
                </table>
              ) : null}

              <div className="flex flex-row gap-2 items-center">
                <button className="hover:border-Corp3 hover:bg-Corp2 transition-colors rounded-xl flex flex-row gap-2 p-2"
                        onClick={async () => {
                          gateCords.length < 1 ? setAddGate(!addGate) : await createGate(gateCords, fieldId ?? '');
                          setGateCords([]), setAddGate(!addGate);
                          setRefetch(true); }}>
                  <p>Submit Gate</p>
                  <FontAwesomeIcon icon={faCheckCircle} size="lg"/>
                </button>
                <button className="hover:border-Corp3 hover:bg-Corp2 transition-colors rounded-xl flex flex-row gap-2 p-2"
                        onClick={() => {
                          setGateCords([]);
                          setAddGate(!addGate); }}>
                  <p>Cancel</p>
                  <FontAwesomeIcon icon={faCircleXmark} size="lg"/>
                </button>
              </div>
            </div>
          ) : (
            <button className="flex flex-row gap-2 items-center hover:border-Corp3 hover:bg-Corp2 transition-colors rounded-xl p-3"
                    onClick={() => {
                      { addGate ? null : setGateCords([]); }
                      setAddGate(!addGate); }}>
              <p>Add Gate</p>
              <FontAwesomeIcon icon={faPlus} size="lg"/>
            </button>
          )}

          {showSettings ? (
            <>
              <div className="fixed -translate-y-10 w-full h-full justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-10 z-50 outline-none focus:outline-none">
                <div className="bg-Corp3 rounded-xl p-12 items-center flex flex-col gap-6 border-Corp2 border">
                  <div className="flex flex-col gap-2 items-center">
                    <h1>Gate Settings</h1>
                    <h2>{`Gate: ${activeGate?.gateId}`}</h2>
                    <p>
                       Latitude: {activeGate?.location.lat.toFixed(3)}
                      &nbsp;
                      Longitude: {activeGate?.location.lon.toFixed(3)}
                    </p>
                  </div>

                  <table className="rounded-xl bg-Corp2">
                    <tbody>
                      <tr>
                        <td className="p-3">Gate Health</td>
                        <td className="p-3">
                          <div
                            className={`flex flex-row gap-2 items-center ${c2s(activeGate?.status??'').t}`}>
                            <FontAwesomeIcon
                              icon={ c2s(activeGate?.status??'').i }
                              size="lg"/>
                            <p>{ c2s(activeGate?.status??'').t } </p>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3">Connection Error</td>
                        <td className="p-3">
                          <div
                            className={`flex flex-row gap-2 items-center ${c2s(activeGate?.connectionError?-1:1).c}`}>
                            <FontAwesomeIcon
                              icon={ c2s(activeGate?.connectionError?-1:1).i }
                              size="lg"/>
                            <p>{ c2s(activeGate?.connectionError?-1:1).t }</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">Current Water Level</td>
                        <td className="p-3">{activeGate?.actualWaterLevel + " inches"}</td>
                      </tr>
                      <tr>
                        <td className="p-3">Ideal Water Level</td>
                        <td className="p-3">{activeGate?.idealWaterLevel + " inches"}</td>
                      </tr>
                      <tr>
                        <td className="p-3">Water Threshold</td>
                        <td className="p-3">{activeGate?.threshold + " inches"}</td>
                      </tr>
                      <tr>
                        <td className="p-3">Battery Status</td>
                        <td className="p-3">
                          <div
                            className={`flex flex-row gap-2 items-center text-${activeGate?.lowBattery?"red":"green"}-500`}>
                            <p className="pb-1">
                              {activeGate?.lowBattery ?<TiBatteryLow size="2em"/>: <TiBatteryFull size="2em"/>}
                            </p>
                            <p>{activeGate?.lowBattery ?"Low": "Good"}</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex flex-row gap-2">
                    <button className="p-3 bg-Corp2 hover:bg-Corp4 transition-colors rounded-xl items-center"
                            onClick={() => {
                              setActiveGate(bareGate);
                              setShowSettings(false);
                            }}>
                      <p>Close</p>
                    </button>
                    <button className="p-3 bg-Corp2 hover:bg-Corp4 transition-colors rounded-xl items-center justify-between"
                            onClick={() => {
                              if (!activeGate) return;
                              setShowSettings(false);
                              setShowEdit(true);
                            }}>
                      <p>Edit Gate</p>
                    </button>
                    <button className="p-3 bg-red-500 hover:bg-red-300 text-Corp3 transition-colors rounded-xl items-center justify-between"
                            onClick={async () => {
                              if (!activeGate) return;
                              await deleteGate(fieldId ?? '', activeGate.gateId);
                              setActiveGate(bareGate);
                              setShowSettings(false);
                              setRefetch(true);
                            }}>
                      <p>Delete Gate</p>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {showEdit ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-10 z-50 outline-none focus:outline-none">
                <div className="bg-Corp3 rounded-xl p-12 items-center flex flex-col gap-6 border-Corp2 border">
                  <div className="flex flex-col gap-2 items-center">
                    <h1>Gate Editing</h1>
                    <h2>{`Gate: ${activeGate?.gateId}`}</h2>
                  </div>
                  <table className="rounded-xl bg-Corp2">
                    <tbody>
                      <tr>
                        <td className="p-3">Current Water Level</td>
                        <td className="p-3">
                          <input id="waterLevel"
                                 placeholder="# inches"
                                 className="rounded-lg p-2 bg-Corp4 text-Corp1"
                                 value={currentWaterLevel}
                                 onChange={ e => setCurrentWaterLevel(e.target.value) }/>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">Ideal Water Level</td>
                        <td className="p-3">
                          <input id="idealLevel"
                                 placeholder="# inches"
                                 className="rounded-lg p-2 bg-Corp4 text-Corp1"
                                 value={idealWaterLevel}
                                 onChange={ e => setIdealWaterLevel(e.target.value) }/>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">Water Threshold</td>
                        <td className="p-3">
                          <input id="threshold"
                                 placeholder="# inches"
                                 className="rounded-lg p-2 bg-Corp4 text-Corp1"
                                 value={threshold}
                                 onChange={e => setThreshold(e.target.value) }/>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex flex-row gap-2">
                    <button
                      className="p-3 bg-Corp2 hover:bg-Corp3 transition-colors rounded-xl items-center"
                      onClick={() => {
                        setShowEdit(false);
                        setShowSettings(true); }}>
                      <p>Close</p>
                    </button>
                    <button
                      className="p-3 bg-green-500 hover:bg-green-300 text-Corp4 transition-colors rounded-xl items-center justify-between"
                      onClick={ async() => {
                        if (activeGate) {
                          try {
                            const updatedGate = await updateGate(
                                fieldId ?? '', activeGate.gateId, +idealWaterLevel,
                                +threshold, +currentWaterLevel, activeGate.connectionError,
                                activeGate.lowBattery, activeGate.status, activeGate.location);
                            setActiveGate(updatedGate);
                            setRefetch(true);
                            setShowEdit(false);
                            setShowSettings(true);
                          } catch (error) { console.error("Failed to update gate:", error); }
                        }
                      } }>
                      <p>Save Edits</p>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }
}
export default FieldGLMap;
