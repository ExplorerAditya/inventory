import React, { useState } from "react";
import Header from "../components/Header";

const mockSettings = [
  { label: "Username", value: "john_doe", type: "text" },
  { label: "Email", value: "john.doe@example.com", type: "text" },
  { label: "Notification", value: true, type: "toggle" },
  { label: "Dark Mode", value: false, type: "toggle" },
  { label: "Language", value: "English", type: "text" },
];

const Settings = () => {
  const [userSettings, setUserSettings] = useState(mockSettings);

  const handleToggleChange = (index) => {
    const settingsCopy = [...userSettings];

    settingsCopy[index].value = !settingsCopy[index].value;

    setUserSettings(settingsCopy);
  };

  const handleInputChange = (index, value) => {
    const settingsCopy = [...userSettings];

    settingsCopy[index].value = value;

    setUserSettings(settingsCopy);
  };

  return (
    <div className="w-full">
      <Header name="User Settings" />

      <div className="mt-5 overflow-x-auto shadow-md">
        <table className="min-w-full rounded-lg bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase">
                Setting
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase">
                Value
              </th>
            </tr>
          </thead>

          <tbody>
            {userSettings.map((setting, index) => (
              <tr
                key={setting.label}
                className="hover:bg-blue-50"
              >
                <td className="px-4 py-2">
                  {setting.label}
                </td>

                <td className="px-4 py-2">
                  {setting.type === "toggle" ? (
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={setting.value}
                        onChange={() =>
                          handleToggleChange(index)
                        }
                      />

                      <div
                        className="
                          h-6 w-11 rounded-full bg-gray-200
                          transition
                          peer-focus:ring-4 peer-focus:ring-blue-400
                          peer-checked:bg-blue-600
                          after:absolute after:left-[2px] after:top-[2px]
                          after:h-5 after:w-5 after:rounded-full
                          after:border after:border-gray-300
                          after:bg-white after:transition-all
                          after:content-['']
                          peer-checked:after:translate-x-full
                          peer-checked:after:border-white
                        "
                      />
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          e.target.value
                        )
                      }
                      className="rounded-lg border px-4 py-2 text-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;