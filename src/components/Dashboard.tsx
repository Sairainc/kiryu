import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import TableChartIcon from '@mui/icons-material/TableChart';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxW89i7C6XuiJYKFkq2RbPQkKgrXRE5ugDSPW8VIN9apXgaZ1t6DgBgDk52KMMA_WhY/exec";

type TemperatureHumidityData = {
  timestamp: string;
  temperature: number;
  humidity: number;
  originalDate: Date;
  doorStatus?: 'open' | 'closed';
  imageData?: {
    reading: number;
  };
};

type TimeRange = '1hour' | '6hours' | '24hours' | '7days' | 'all';
type DisplayType = 'both' | 'temperature' | 'humidity';
type View = 'dashboard' | 'devices' | 'table';
type TableDataType = 'temperature' | 'image';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<TemperatureHumidityData[]>([]);
  const [filteredData, setFilteredData] = useState<TemperatureHumidityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('24hours');
  const [displayType, setDisplayType] = useState<DisplayType>('both');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [doorStatus, setDoorStatus] = useState<'open' | 'closed'>('closed');
  const [tableDataType, setTableDataType] = useState<TableDataType>('temperature');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(GAS_API_URL);
        const json = await response.json();
        
        const formattedData = json.map((item: any) => {
          const date = new Date(item.time);
          const formattedTime = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
          return {
            timestamp: formattedTime,
            temperature: item.temperature || 0,
            humidity: item.humidity || 0,
            originalDate: date,
            doorStatus: item.doorStatus || 'closed',
            imageData: item.imageData || {
              reading: 0
            }
          };
        });

        setData(formattedData);
        if (formattedData.length > 0) {
          setDoorStatus(formattedData[formattedData.length - 1].doorStatus);
        }
        setLoading(false);
      } catch (err) {
        setError("データの取得に失敗しました");
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filterData = () => {
      const now = new Date();
      const filtered = data.filter(item => {
        const diff = now.getTime() - item.originalDate.getTime();
        switch (timeRange) {
          case '1hour':
            return diff <= 60 * 60 * 1000;
          case '6hours':
            return diff <= 6 * 60 * 60 * 1000;
          case '24hours':
            return diff <= 24 * 60 * 60 * 1000;
          case '7days':
            return diff <= 7 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });
      setFilteredData(filtered);
    };

    filterData();
  }, [data, timeRange]);

  const getLatestReadings = () => {
    if (filteredData.length === 0) return { temp: "--", humid: "--" };
    const latest = filteredData[filteredData.length - 1];
    return {
      temp: latest.temperature.toFixed(1),
      humid: latest.humidity.toFixed(1)
    };
  };

  const { temp, humid } = getLatestReadings();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <p className="text-sm font-medium mb-1">{label}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: pld.color }}>
              {pld.name}: {pld.value}
              {pld.name.includes('温度') ? '°C' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
      <div className="flex flex-col lg:flex-row">
        {/* サイドバー */}
        <div className={`w-full lg:w-64 fixed bottom-0 lg:bottom-auto lg:h-screen z-10 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg lg:shadow-none`}>
          <div className="p-4 lg:p-6">
            <h1 className="text-xl font-bold mb-4 lg:mb-8 hidden lg:block">温度・湿度モニター</h1>
            <nav>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 lg:mb-4 hidden lg:block">メニュー</p>
              <ul className="flex lg:flex-col justify-around lg:space-y-2">
                <li className="flex-1 lg:flex-none">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg ${
                      currentView === 'dashboard'
                        ? (darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600")
                        : (darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100")
                    }`}
                  >
                    <DashboardIcon className="text-xl lg:mr-3" />
                    <span className="hidden lg:inline">ホーム</span>
                  </button>
                </li>
                <li className="flex-1 lg:flex-none">
                  <button
                    onClick={() => setCurrentView('devices')}
                    className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg ${
                      currentView === 'devices'
                        ? (darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600")
                        : (darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100")
                    }`}
                  >
                    <DevicesIcon className="text-xl lg:mr-3" />
                    <span className="hidden lg:inline">デバイス</span>
                  </button>
                </li>
                <li className="flex-1 lg:flex-none">
                  <button
                    onClick={() => setCurrentView('table')}
                    className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg ${
                      currentView === 'table'
                        ? (darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600")
                        : (darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100")
                    }`}
                  >
                    <TableChartIcon className="text-xl lg:mr-3" />
                    <span className="hidden lg:inline">テーブル</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="w-full lg:ml-64 p-4 lg:p-6 mb-16 lg:mb-0">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 lg:mb-8">
            <h2 className="text-2xl font-semibold mb-4 sm:mb-0">
              {currentView === 'dashboard' && 'ダッシュボード'}
              {currentView === 'devices' && 'デバイス'}
              {currentView === 'table' && 'テーブル'}
            </h2>
            <div className="flex items-center space-x-4">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200">
                {darkMode ? <WbSunnyIcon /> : <DarkModeIcon />}
              </button>
              <button onClick={() => window.location.reload()} className="p-2 rounded-full bg-blue-500 text-white">
                <RefreshIcon />
              </button>
            </div>
          </div>

          {currentView === 'dashboard' && (
            <>
              {/* 最新データカード */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">最新の温度</p>
                      <h3 className="text-3xl font-bold mt-1">{temp}°C</h3>
                    </div>
                    <div className={`p-3 rounded-full ${darkMode ? "bg-red-500/10" : "bg-red-100"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-red-400" : "text-red-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5v6m0 0v6m0-6h6m-6 0H3" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      最終更新: {filteredData[filteredData.length - 1]?.timestamp || '--'}
                    </p>
                  </div>
                </div>

                <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">最新の湿度</p>
                      <h3 className="text-3xl font-bold mt-1">{humid}%</h3>
                    </div>
                    <div className={`p-3 rounded-full ${darkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-blue-400" : "text-blue-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      最終更新: {filteredData[filteredData.length - 1]?.timestamp || '--'}
                    </p>
                  </div>
                </div>

                <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ドアの状態</p>
                      <h3 className="text-3xl font-bold mt-1">
                        {doorStatus === 'open' ? '開' : '閉'}
                      </h3>
                    </div>
                    <div className={`p-3 rounded-full ${doorStatus === 'open' ? (darkMode ? "bg-green-500/10" : "bg-green-100") : (darkMode ? "bg-gray-500/10" : "bg-gray-100")}`}>
                      {doorStatus === 'open' ? (
                        <LockOpenIcon className={`h-6 w-6 ${darkMode ? "text-green-400" : "text-green-500"}`} />
                      ) : (
                        <LockIcon className={`h-6 w-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      最終更新: {filteredData[filteredData.length - 1]?.timestamp || '--'}
                    </p>
                  </div>
                </div>
              </div>

              {/* グラフ */}
              <div className={`p-4 lg:p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
                  <h3 className="text-xl font-semibold">温度・湿度の推移</h3>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <select
                      value={displayType}
                      onChange={(e) => setDisplayType(e.target.value as DisplayType)}
                      className={`px-3 py-2 rounded-lg ${
                        darkMode 
                          ? "bg-gray-700 text-white border-gray-600" 
                          : "bg-white text-gray-700 border-gray-300"
                      } border w-full sm:w-auto`}
                    >
                      <option value="both">温度と湿度</option>
                      <option value="temperature">温度のみ</option>
                      <option value="humidity">湿度のみ</option>
                    </select>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                      className={`px-3 py-2 rounded-lg ${
                        darkMode 
                          ? "bg-gray-700 text-white border-gray-600" 
                          : "bg-white text-gray-700 border-gray-300"
                      } border w-full sm:w-auto`}
                    >
                      <option value="1hour">1時間</option>
                      <option value="6hours">6時間</option>
                      <option value="24hours">24時間</option>
                      <option value="7days">7日間</option>
                      <option value="all">すべて</option>
                    </select>
                  </div>
                </div>
                <div className="h-[400px] lg:h-[500px] relative">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500">
                      <p>{error}</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={filteredData}
                        margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="timestamp"
                          angle={-30}
                          textAnchor="end"
                          height={60}
                          tick={{
                            fill: darkMode ? "#9CA3AF" : "#4B5563",
                            fontSize: 12
                          }}
                          stroke={darkMode ? "#4B5563" : "#9CA3AF"}
                        />
                        <YAxis
                          tick={{
                            fill: darkMode ? "#9CA3AF" : "#4B5563",
                            fontSize: 12
                          }}
                          stroke={darkMode ? "#4B5563" : "#9CA3AF"}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{
                            paddingTop: "20px"
                          }}
                        />
                        {(displayType === 'both' || displayType === 'temperature') && (
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            name="温度 (°C)"
                            stroke="#F87171"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        )}
                        {(displayType === 'both' || displayType === 'humidity') && (
                          <Line
                            type="monotone"
                            dataKey="humidity"
                            name="湿度 (%)"
                            stroke="#60A5FA"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}

          {currentView === 'devices' && (
            <div className={`p-4 lg:p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h3 className="text-xl font-semibold mb-4">接続されているデバイス</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <ThermostatIcon className="text-3xl text-red-500" />
                      <WaterDropIcon className="text-3xl text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">温度・湿度センサー</h4>
                      <p className="text-sm text-gray-500">ステータス: オンライン</p>
                      <p className="text-sm text-gray-500">最終更新: {filteredData[filteredData.length - 1]?.timestamp || '--'}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="flex items-center space-x-4">
                    {doorStatus === 'open' ? (
                      <LockOpenIcon className="text-3xl text-green-500" />
                    ) : (
                      <LockIcon className="text-3xl text-gray-500" />
                    )}
                    <div>
                      <h4 className="font-semibold">ドアセンサー</h4>
                      <p className="text-sm text-gray-500">ステータス: オンライン</p>
                      <p className="text-sm text-gray-500">状態: {doorStatus === 'open' ? '開' : '閉'}</p>
                      <p className="text-sm text-gray-500">最終更新: {filteredData[filteredData.length - 1]?.timestamp || '--'}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="flex items-center space-x-4">
                    <CameraAltIcon className="text-3xl text-purple-500" />
                    <div>
                      <h4 className="font-semibold">イメージセンサー</h4>
                      <p className="text-sm text-gray-500">ステータス: オンライン</p>
                      <p className="text-sm text-gray-500">解像度: 1920x1080</p>
                      <p className="text-sm text-gray-500">最終更新: {filteredData[filteredData.length - 1]?.timestamp || '--'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'table' && (
            <div className={`p-4 lg:p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
                <h3 className="text-xl font-semibold">すべてのデータ</h3>
                <select
                  value={tableDataType}
                  onChange={(e) => setTableDataType(e.target.value as TableDataType)}
                  className={`px-3 py-2 rounded-lg ${
                    darkMode 
                      ? "bg-gray-700 text-white border-gray-600" 
                      : "bg-white text-gray-700 border-gray-300"
                  } border`}
                >
                  <option value="temperature">温度・湿度データ</option>
                  <option value="image">イメージセンサーデータ</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center p-8 text-red-500">
                    <p>{error}</p>
                  </div>
                ) : tableDataType === 'temperature' ? (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium uppercase">日時</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium uppercase">温度 (°C)</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium uppercase">湿度 (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? (darkMode ? "bg-gray-700" : "bg-gray-50") : ""}>
                          <td className="px-4 lg:px-6 py-3 text-sm">{item.timestamp}</td>
                          <td className="px-4 lg:px-6 py-3 text-sm">{item.temperature.toFixed(1)}</td>
                          <td className="px-4 lg:px-6 py-3 text-sm">{item.humidity.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium uppercase">日時</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium uppercase">Reading値</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? (darkMode ? "bg-gray-700" : "bg-gray-50") : ""}>
                          <td className="px-4 lg:px-6 py-3 text-sm">{item.timestamp}</td>
                          <td className="px-4 lg:px-6 py-3 text-sm">{item.imageData?.reading.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;