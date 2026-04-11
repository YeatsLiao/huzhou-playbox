import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Fish {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  score: number;
  direction: 'left' | 'right';
}

export default function FishingGame() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showScoreInput, setShowScoreInput] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);

  // 初始化鱼群
  useEffect(() => {
    const initialFishes: Fish[] = [];
    for (let i = 0; i < 10; i++) {
      initialFishes.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.7 + 100,
        size: Math.random() * 30 + 20,
        speed: Math.random() * 2 + 1,
        score: Math.floor(Math.random() * 30) + 10,
        direction: Math.random() > 0.5 ? 'left' : 'right'
      });
    }
    setFishes(initialFishes);
  }, []);

  // 游戏主循环
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setFishes(prevFishes => {
        return prevFishes.map(fish => {
          let newX = fish.direction === 'left' ? fish.x - fish.speed : fish.x + fish.speed;
          
          // 边界检测
          if (newX < -100) {
            newX = window.innerWidth + 100;
            fish.direction = 'left';
          } else if (newX > window.innerWidth + 100) {
            newX = -100;
            fish.direction = 'right';
          }
          
          return { ...fish, x: newX };
        });
      });
    }, 16);

    return () => clearInterval(interval);
  }, [gameOver]);

  // 倒计时
  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
      setShowScoreInput(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    if (gameOver) return;

    const clickX = e.clientX;
    const clickY = e.clientY;

    setFishes(prevFishes => {
      return prevFishes.filter(fish => {
        const distance = Math.sqrt(
          Math.pow(clickX - fish.x, 2) + Math.pow(clickY - fish.y, 2)
        );
        
        if (distance < fish.size / 2) {
          setScore(prev => prev + fish.score);
          return false; // 移除被捕获的鱼
        }
        return true;
      });
    });

    // 定期添加新鱼
    if (fishes.length < 15) {
      setTimeout(() => {
        setFishes(prev => [...prev, {
          id: Date.now(),
          x: Math.random() > 0.5 ? -100 : window.innerWidth + 100,
          y: Math.random() * window.innerHeight * 0.7 + 100,
          size: Math.random() * 30 + 20,
          speed: Math.random() * 2 + 1,
          score: Math.floor(Math.random() * 30) + 10,
          direction: Math.random() > 0.5 ? 'left' : 'right'
        }]);
      }, 500);
    }
  };

  // 保存得分
  const saveScore = () => {
    const savedScores = localStorage.getItem('gameScores');
    let scores = savedScores ? JSON.parse(savedScores) : {
      fishing: [],
      maze: [],
      calligraphy: []
    };

    scores.fishing.push({
      name: playerName || "匿名玩家",
      score: score,
      time: new Date().toISOString()
    });

    // 按得分排序并保留前10名
    scores.fishing.sort((a: any, b: any) => b.score - a.score);
    scores.fishing = scores.fishing.slice(0, 10);

    localStorage.setItem('gameScores', JSON.stringify(scores));
    navigate('/');
  };

  return (
    <div 
      ref={gameRef}
      className="min-h-screen bg-blue-400 cursor-crosshair"
      onClick={handleClick}
    >
      {/* 游戏状态 */}
      <div className="fixed top-0 left-0 w-full p-4 bg-blue-900 text-white flex justify-between items-center z-10">
        <div className="text-xl font-bold">太湖捕鱼</div>
        <div className="flex space-x-8">
          <div className="text-xl">得分: {score}</div>
          <div className="text-xl">时间: {timeLeft}s</div>
        </div>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded border-2 border-gray-600"
          onClick={() => navigate('/')}
        >
          返回首页
        </button>
      </div>

      {/* 游戏区域 */}
      <div className="relative h-screen">
        {/* 背景元素 */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-green-600 to-transparent"></div>
        
        {/* 鱼群 */}
        {fishes.map(fish => (
          <div
            key={fish.id}
            className="absolute cursor-pointer"
            style={{
              left: fish.x - fish.size / 2,
              top: fish.y - fish.size / 2,
              width: fish.size,
              height: fish.size / 2,
              backgroundColor: fish.score > 25 ? '#ff6b6b' : fish.score > 15 ? '#4ecdc4' : '#45b7d1',
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              transform: fish.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
              transition: 'transform 0.1s ease'
            }}
          >
            {/* 鱼眼睛 */}
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full"></div>
            {/* 鱼鳍 */}
            <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        ))}

        {/* 游戏结束弹窗 */}
        {showScoreInput && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border-4 border-gray-800 shadow-xl p-8 max-w-md">
              <h2 className="text-3xl font-bold mb-4 text-center">游戏结束！</h2>
              <p className="text-2xl mb-6 text-center">最终得分: {score}</p>
              <div className="mb-6">
                <label className="block mb-2 font-bold">输入你的名字:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded"
                  placeholder="请输入名字"
                />
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded border-2 border-blue-700"
                  onClick={saveScore}
                >
                  保存得分
                </button>
                <button
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded border-2 border-gray-600"
                  onClick={() => navigate('/')}
                >
                  不保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}