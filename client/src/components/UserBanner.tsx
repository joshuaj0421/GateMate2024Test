import { faBars, faGear, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import React from "react";

type BannerProps = {
  userName: string;
  className?: string;
  children?: React.ReactNode;
};

async function logout() {
  try {
    await axios.get("/api/v1/user/logout");
    window.location.href = "/";
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

export function UserBanner(props: BannerProps) {
  const [showModal, setShowModal] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('userSettings');

  //Example settings

  //User settings
  const [userSetting1, setUserSetting1] = useState(false);
  const [userSetting2, setUserSetting2] = useState(false);
  const [userSetting3, setUserSetting3] = useState(false);

  //Field settings
  const [fieldSetting1, setFieldSetting1] = useState(false);
  const [fieldSetting2, setFieldSetting2] = useState(false);
  const [fieldSetting3, setFieldSetting3] = useState(false);

  //Farm settings
  const [farmSetting1, setFarmSetting1] = useState(false);
  const [farmSetting2, setFarmSetting2] = useState(false);
  const [farmSetting3, setFarmSetting3] = useState(false);

  // Export to PDF
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [fieldExists, setFieldExists] = useState("");
  const [fieldValueField, setFieldValueField] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const fieldOptions = ["temperature", "battery", "waterLevel", "humidity"];

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const options: any = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    if (eventType) options.eventType = eventType;
    if (fieldExists) options.fieldExists = fieldExists;
    if (fieldValueField && fieldValue) {
      options.fieldValue = { field: fieldValueField, value: fieldValue };
    }

    const body = {
      startDate,
      endDate,
      eventType,
      fieldExists,
      fieldValue: fieldValueField && fieldValue
        ? { field: fieldValueField, value: fieldValue }
        : undefined
    };

    try {
      const response = await fetch("/api/v1/export/export-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
  
      if (!response.ok) {
        throw new Error("Export failed");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "event_report.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF export failed.");
    }
  };

  return (
    <div className={"flex flex-row rounded bg-Corp3 gap-2 pr-auto items-center relative" + props.className}
         style={{marginRight: "15px", maxWidth: "15vw"}}>
      <h1>Welcome,<br/>{props.userName}</h1>
      <button className="hover:bg-Corp2 transition-colors rounded-lg"
              onClick={() => setDropdownVisible(!dropdownVisible)}>
        <FontAwesomeIcon icon={faBars} />
      </button>
      {dropdownVisible && (
        <div className="flex flex-col absolute top-20 right-0.5 bg-Corp2 rounded shadow-lg min-w-[12rem] items-center z-50">
          <button className="flex gap-1 items-center"
                  onClick={() => setShowModal(true)}>
            Settings
            <FontAwesomeIcon icon={faGear} />
          </button>
          <button className="flex gap-1 items-center"
                  onClick={() => (setDropdownVisible(false), logout())}>
            Sign Out
            <FontAwesomeIcon icon={faDoorOpen} />
          </button>
        </div>
      )}
      {showModal ? (
        <>
          <div className="fixed w-full h-full flex justify-center items-center overflow-x-hidden overflow-y-auto left-0 top-0 inset-10 z-50">
            <div className="flex flex-col w-full h-full bg-Corp3">
              <div className="flex flex-row flex-1 w-full rounded-lg shadow-lg">
                {/* Left Column with Options */}
                  <div className="flex flex-col w-52 border-r border-r-px justify-between p-5 bg-Corp2 font-Arvo">
                    <button className={`rounded-full mb-2 text-Corp3 p-2 font-Arvo ${selectedCategory==='userSettings'  ? 'bg-Corp1 w-full' : ''}`}
                            onClick={() => setSelectedCategory('userSettings')}>
                      Notification Settings
                    </button>
                    <button className={`rounded-full mb-2 text-Corp3 p-2 font-Arvo ${selectedCategory==='fieldSettings' ? 'bg-Corp1 w-full' : ''}`}
                            onClick={() => setSelectedCategory('fieldSettings')}>
                      Field Settings
                    </button>
                    <button className={`rounded-full mb-2 text-Corp3 p-2 font-Arvo ${selectedCategory==='farmSettings'  ? 'bg-Corp1 w-full' : ''}`}
                            onClick={() => setSelectedCategory('farmSettings')}>
                      Farm Settings
                    </button>
                    <button className={`rounded-full mb-2 text-Corp3 p-2 font-Arvo ${selectedCategory==='exportService'  ? 'bg-Corp1 w-full' : ''}`}
                            onClick={() => setSelectedCategory('exportService')}>
                      Export Data
                    </button>
                  </div>

                  {/* Right Column with Settings*/}
                  <div className="w-full h-full bg-Corp2">
                    {selectedCategory === 'userSettings' && (
                      <div className="p-5 bg-Corp2 rounded-xxl">
                        <h1>Email Settings</h1>
                        <div className="h-4" />
                        <div className="flex items-center mb-3">
                          <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox"
                                  checked={userSetting1}
                                  onChange={() => setUserSetting1(!userSetting1)}
                                  className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                            <span className="ml-2 text-sm text-Corp1 font-arvo">Allow gate status notifications</span>
                          </label>
                        </div>

                        <div className="flex items-center mb-3 ml-12">
                          <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox"
                                  checked={userSetting2}
                                  onChange={() => setUserSetting2(!userSetting2)}
                                  className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                            <span className="ml-2 text-sm text-Corp1">For Connection Status</span>
                          </label>
                        </div>
                        <div className="flex items-center mb-3 ml-12">
                          <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox"
                                  checked={userSetting2}
                                  onChange={() => setUserSetting2(!userSetting2)}
                                  className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                            <span className="ml-2 text-sm text-Corp1">For Water Level</span>
                          </label>
                        </div>
                        <div className="flex items-center mb-3 ml-12">
                          <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox"
                                  checked={userSetting2}
                                  onChange={() => setUserSetting2(!userSetting2)}
                                  className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                            <span className="ml-2 text-sm text-Corp1">For Important Expected Events: Gate Open / Closes, Command Cancelations, ect.</span>
                          </label>
                        </div>

                        <div className="flex items-center mb-3">
                          <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox"
                                  checked={userSetting2}
                                  onChange={() => setUserSetting2(!userSetting2)}
                                  className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                            <span className="ml-2 text-sm text-Corp1">Allow field status notifications</span>
                          </label>
                        </div>

                        <div className="flex items-center mb-3">
                          <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox"
                                  checked={userSetting3}
                                  onChange={() => setUserSetting3(!userSetting3)}
                                  className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                            <span className="ml-2 text-sm text-Corp1">Allow weather notifications</span>
                          </label>
                        </div>

                        <div className="flex items-center mb-3">
                          <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox"
                                  checked={userSetting3}
                                  onChange={() => setUserSetting3(!userSetting3)}
                                  className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                            <span className="ml-2 text-sm text-Corp1">Allow Text Messaging</span>
                          </label>
                        </div>
                        
                    </div>
                  )}
                  {selectedCategory === 'fieldSettings' && (
                    // Field Settings content
                    <div className="p-5 bg-Corp2 rounded">
                      <div className="flex items-center mb-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                                 checked={fieldSetting1}
                                 onChange={() => setFieldSetting1(!fieldSetting1)}
                                 className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                          <span className="ml-2 text-sm text-Corp1">Field Setting 1</span>
                        </label>
                      </div>
                      <div className="flex items-center mb-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                                 checked={fieldSetting2}
                                 onChange={() => setFieldSetting2(!fieldSetting2)}
                                 className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                          <span className="ml-2 text-sm text-Corp1">Field Setting 2</span>
                        </label>
                      </div>
                      <div className="flex items-center mb-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                                 checked={fieldSetting3}
                                 onChange={() => setFieldSetting3(!fieldSetting3)}
                                 className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                          <span className="ml-2 text-sm text-Corp1">Field Setting 3</span>
                        </label>
                      </div>
                    </div>
                  )}
                  {selectedCategory === 'exportService' && (
                    // PDF Export content
                    <div className="p-6 max-w-xl mx-auto">
                    <h2 className="text-xl font-semibold text-center mb-4">Export Event Data</h2>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-white">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 block w-full border rounded p-2"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-white">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 block w-full border rounded p-2"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-white">Event Type</label>
                      <input
                        type="text"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="mt-1 block w-full border rounded p-2"
                        placeholder="e.g. WEATHER"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-white">Field Must Exist</label>
                      <select
                        value={fieldExists}
                        onChange={(e) => setFieldExists(e.target.value)}
                        className="mt-1 block w-full border rounded p-2"
                      >
                        <option value="">-- Optional --</option>
                        {fieldOptions.map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-white">Field Equals</label>
                      <div className="flex gap-2 mt-1">
                        <select
                          value={fieldValueField}
                          onChange={(e) => setFieldValueField(e.target.value)}
                          className="flex-1 border rounded p-2"
                        >
                          <option value="">-- Field --</option>
                          {fieldOptions.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                          placeholder="Value"
                          className="flex-1 border rounded p-2"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={handleExport}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Export Data to PDF
                      </button>
                    </div>
                  </div>
                  )}
                  {selectedCategory === 'farmSettings' && (
                    // Farm Settings content
                    <div className="p-5 bg-Corp2 rounded-full">
                      <div className="flex items-center mb-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                                 checked={farmSetting1}
                                 onChange={() => setFarmSetting1(!farmSetting1)}
                                 className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                          <span className="ml-2 text-sm text-Corp1">Farm Setting 1</span>
                        </label>
                      </div>

                      <div className="flex items-center mb-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                                 checked={farmSetting2}
                                 onChange={() => setFarmSetting2(!farmSetting2)}
                                 className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                          <span className="ml-2 text-sm text-Corp1">Farm Setting 2</span>
                        </label>
                      </div>

                      <div className="flex items-center mb-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                                 checked={farmSetting3}
                                 onChange={() => setFarmSetting3(!farmSetting3)}
                                 className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-gray-200 dark:bg-Corp4 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-Corp3 peer-checked:bg-Corp1 rounded-full"></div>
                          <span className="ml-2 text-sm text-Corp1">Farm Setting 3</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
                <button className="text-white background-transparent font-bold uppercase px-6 py-2 rounded-full text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setShowModal(false)}>
                    Close
                </button>
                <button className="bg-Corp1 text-Corp3 active:bg-Corp2 font-bold uppercase text-sm px-6 py-2 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setShowModal(false)}>
                    Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default UserBanner;
