import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [showRule, setShowRule] = useState<string | null>(null);
  const [scores, setScores] = useState<any>({
    fishing: [],
    maze: [],
    calligraphy: []
  });

  useEffect(() => {
    // 从本地存储加载得分
    const savedScores = localStorage.getItem('gameScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    } else {
      // 初始化默认得分
      const defaultScores = {
        fishing: [
          { name: "玩家1", score: 1200, time: new Date().toISOString() },
          { name: "玩家2", score: 950, time: new Date().toISOString() },
          { name: "玩家3", score: 800, time: new Date().toISOString() }
        ],
        maze: [
          { name: "玩家1", time: 45, date: new Date().toISOString() },
          { name: "玩家2", time: 60, date: new Date().toISOString() },
          { name: "玩家3", time: 75, date: new Date().toISOString() }
        ],
        calligraphy: [
          { name: "玩家1", score: 85, date: new Date().toISOString() },
          { name: "玩家2", score: 70, date: new Date().toISOString() },
          { name: "玩家3", score: 60, date: new Date().toISOString() }
        ]
      };
      localStorage.setItem('gameScores', JSON.stringify(defaultScores));
      setScores(defaultScores);
    }
  }, []);

  const gameRules = {
    fishing: "点击屏幕上的鱼群来捕获它们，不同大小的鱼有不同的分值。游戏时间为60秒，时间结束后显示最终得分。",
    maze: "使用方向键或WASD控制角色在竹林迷宫中移动，找到出口。记录完成迷宫的时间，挑战最佳成绩。",
    calligraphy: "在宣纸上用鼠标或触摸书写指定的汉字，系统会根据笔画流畅度和相似度进行评分。完成后可以保存作品。"
  };

  const games = [
    { id: 'fishing', name: '太湖捕鱼', route: '/fishing', color: 'bg-blue-500', icon: '🎣' },
    { id: 'maze', name: '莫干山竹林探险', route: '/maze', color: 'bg-green-500', icon: '🌲' },
    { id: 'calligraphy', name: '湖笔书法挑战', route: '/calligraphy', color: 'bg-amber-500', icon: '✍️' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-pixel">
      {/* 像素风格背景 */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-10"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-600 pixel-title">湖州创意互动小游戏</h1>
          <p className="text-xl text-gray-600">探索湖州文化，体验趣味游戏</p>
        </div>

        {/* 游戏选择区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {games.map((game) => (
            <div key={game.id} className="relative">
              <div 
                className={`${game.color} hover:opacity-90 transition-opacity duration-300 rounded-lg p-8 text-center cursor-pointer border-4 border-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-300`}
                onClick={() => setShowRule(game.id)}
              >
                <div className="text-6xl mb-4">{game.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2 pixel-text">{game.name}</h2>
                <p className="text-white text-opacity-80">点击查看规则</p>
              </div>
              
              {/* 开始游戏按钮 */}
              <button
                className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded border-2 border-gray-600 shadow-md transform hover:translate-y-[-2px] transition-transform duration-200"
                onClick={() => navigate(game.route)}
              >
                开始游戏
              </button>
            </div>
          ))}
        </div>

        {/* 得分排行区域 */}
        <div className="bg-white rounded-lg border-4 border-gray-800 shadow-lg p-6 mb-8 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-4 text-center pixel-text">得分排行</h2>
          
          <div className="flex flex-col md:flex-row gap-6 min-w-min">
            {/* 太湖捕鱼排行 */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 flex-1 min-w-[280px]">
              <h3 className="text-lg font-bold mb-2 text-blue-600">太湖捕鱼</h3>
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left pb-2 w-12">排名</th>
                    <th className="text-left pb-2">玩家</th>
                    <th className="text-left pb-2 w-16">得分</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.fishing.slice(0, 5).map((score: any, index: number) => (
                    <tr key={index} className="border-b border-blue-100 last:border-0">
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2 truncate max-w-[100px]">{score.name}</td>
                      <td className="py-2 font-bold">{score.score}</td>
                    </tr>
                  ))}
                  {scores.fishing.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-4 text-gray-500">暂无数据</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 莫干山竹林探险排行 */}
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 flex-1 min-w-[280px]">
              <h3 className="text-lg font-bold mb-2 text-green-600">莫干山竹林探险</h3>
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-green-200">
                    <th className="text-left pb-2 w-12">排名</th>
                    <th className="text-left pb-2">玩家</th>
                    <th className="text-left pb-2 w-20">时间(秒)</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.maze.slice(0, 5).map((score: any, index: number) => (
                    <tr key={index} className="border-b border-green-100 last:border-0">
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2 truncate max-w-[100px]">{score.name}</td>
                      <td className="py-2 font-bold">{score.time}</td>
                    </tr>
                  ))}
                  {scores.maze.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-4 text-gray-500">暂无数据</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 湖笔书法挑战排行 */}
            <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200 flex-1 min-w-[280px]">
              <h3 className="text-lg font-bold mb-2 text-amber-600">湖笔书法挑战</h3>
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-amber-200">
                    <th className="text-left pb-2 w-12">排名</th>
                    <th className="text-left pb-2">玩家</th>
                    <th className="text-left pb-2 w-16">得分</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.calligraphy.slice(0, 5).map((score: any, index: number) => (
                    <tr key={index} className="border-b border-amber-100 last:border-0">
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2 truncate max-w-[100px]">{score.name}</td>
                      <td className="py-2 font-bold">{score.score}</td>
                    </tr>
                  ))}
                  {scores.calligraphy.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-4 text-gray-500">暂无数据</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 规则说明弹窗 */}
        {showRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border-4 border-gray-800 shadow-xl p-6 max-w-md">
              <h2 className="text-2xl font-bold mb-4 pixel-text">{games.find(g => g.id === showRule)?.name} 规则</h2>
              <p className="mb-6">{gameRules[showRule as keyof typeof gameRules]}</p>
              <div className="flex justify-end">
                <button
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded border-2 border-gray-600"
                  onClick={() => setShowRule(null)}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}