import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwkOkcsESUubHlJnBoSkSpo8SYowYa2eZbIOpLCAc94qbJlbE9dcqi04mYeTQmb7fwi/exec";

type TemperatureHumidityData = {
  timestamp: string;
  temperature: number;
  humidity: number;
  originalDate: Date;
};

type TimeRange = '1hour' | '6hours' | '24hours' | '7days' | 'all';
type DisplayType = 'both' | 'temperature' | 'humidity';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<TemperatureHumidityData[]>([]);
  const [filteredData, setFilteredData] = useState<TemperatureHumidityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('24hours');
  const [displayType, setDisplayType] = useState<DisplayType>('both');

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
            originalDate: date
          };
        });

        setData(formattedData);
        setLoading(false);
      } catch (err) {
        setError("データの取得に失敗しました");
        setLoading(false);
      }
    };

    fetchData();
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
                  <a href="#" className={`flex items-center justify-center lg:justify-start p-3 rounded-lg ${darkMode ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                    <span className="text-xl lg:mr-3">🏠</span>
                    <span className="hidden lg:inline">ホーム</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="w-full lg:ml-64 p-4 lg:p-6 mb-16 lg:mb-0">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 lg:mb-8">
            <h2 className="text-2xl font-semibold mb-4 sm:mb-0">ダッシュボード</h2>
            <div className="flex items-center space-x-4">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200">
                {darkMode ? "☀️" : "🌙"}
              </button>
              <button onClick={() => window.location.reload()} className="p-2 rounded-full bg-blue-500 text-white">
                ↻
              </button>
            </div>
          </div>

          {/* グラフ */}
          <div className={`p-4 lg:p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"} mb-6 lg:mb-8`}>
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
            <div className="h-[300px] lg:h-[400px] relative">
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
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#eee"} />
                    <XAxis dataKey="timestamp" angle={-30} textAnchor="end" height={50} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    {(displayType === 'both' || displayType === 'temperature') && (
                      <Line type="monotone" dataKey="temperature" name="温度 (°C)" stroke="#ef4444" strokeWidth={2} />
                    )}
                    {(displayType === 'both' || displayType === 'humidity') && (
                      <Line type="monotone" dataKey="humidity" name="湿度 (%)" stroke="#3b82f6" strokeWidth={2} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* データテーブル */}
          <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold">最近のデータ</h3>
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
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium uppercase">日時</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium uppercase">温度 (°C)</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium uppercase">湿度 (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(-5).map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? (darkMode ? "bg-gray-700" : "bg-gray-50") : ""}>
                        <td className="px-4 lg:px-6 py-3 text-sm">{item.timestamp}</td>
                        <td className="px-4 lg:px-6 py-3 text-sm">{item.temperature.toFixed(1)}</td>
                        <td className="px-4 lg:px-6 py-3 text-sm">{item.humidity.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;