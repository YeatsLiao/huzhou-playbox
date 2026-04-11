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
  type: 'small' | 'medium' | 'large';
}

interface Tool {
  type: 'rod' | 'net';
  name: string;
  range: number;
  cooldown: number;
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
  const [fishingRod, setFishingRod] = useState({ x: 0, y: 0, active: false, angle: 0 });
  const [net, setNet] = useState({ x: 0, y: 0, active: false, size: 0 });
  const [currentTool, setCurrentTool] = useState<'rod' | 'net'>('rod');
  const [toolCooldown, setToolCooldown] = useState(0);
  const [caughtFishes, setCaughtFishes] = useState<number[]>([]);
  const [waveEffects, setWaveEffects] = useState<Array<{ id: number, x: number, y: number, size: number, opacity: number }>>([]);

  // 工具配置
  const tools: Record<'rod' | 'net', Tool> = {
    rod: { type: 'rod', name: '鱼竿', range: 50, cooldown: 500 },
    net: { type: 'net', name: '渔网', range: 100, cooldown: 1000 }
  };

  // 初始化鱼群
  useEffect(() => {
    const initialFishes: Fish[] = [];
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 40 + 20;
      const fishType = size < 30 ? 'small' : size < 45 ? 'medium' : 'large';
      initialFishes.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.7 + 100,
        size,
        speed: Math.random() * 2 + 1,
        score: Math.floor(Math.random() * 30) + 10,
        direction: Math.random() > 0.5 ? 'left' : 'right',
        type: fishType
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
          let newY = fish.y + (Math.sin(Date.now() / 1000 + fish.id) * 0.5);
          
          // 边界检测
          if (newX < -100) {
            newX = window.innerWidth + 100;
            fish.direction = 'left';
          } else if (newX > window.innerWidth + 100) {
            newX = -100;
            fish.direction = 'right';
          }
          
          // 垂直边界
          if (newY < 100) newY = 100;
          if (newY > window.innerHeight - 100) newY = window.innerHeight - 100;
          
          return { ...fish, x: newX, y: newY };
        });
      });

      // 更新波浪效果
      setWaveEffects(prev => 
        prev.filter(effect => effect.opacity > 0).map(effect => ({
          ...effect,
          size: effect.size + 1,
          opacity: effect.opacity - 0.02
        }))
      );
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

  // 工具冷却
  useEffect(() => {
    if (toolCooldown > 0) {
      const timer = setTimeout(() => {
        setToolCooldown(prev => prev - 100);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [toolCooldown]);

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    setFishingRod(prev => ({
      ...prev,
      x: e.clientX,
      y: e.clientY
    }));
    setNet(prev => ({
      ...prev,
      x: e.clientX,
      y: e.clientY
    }));
  };

  // 创建波浪效果
  const createWaveEffect = (x: number, y: number) => {
    setWaveEffects(prev => [...prev, {
      id: Date.now(),
      x,
      y,
      size: 0,
      opacity: 1
    }]);
  };

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    if (gameOver || toolCooldown > 0) return;

    const clickX = e.clientX;
    const clickY = e.clientY;

    // 工具冷却
    setToolCooldown(tools[currentTool].cooldown);

    if (currentTool === 'rod') {
      // 鱼竿动画
      setFishingRod(prev => ({ ...prev, active: true, angle: -30 }));
      setTimeout(() => setFishingRod(prev => ({ ...prev, active: false, angle: 0 })), 300);

      // 检测是否钓到鱼
      setFishes(prevFishes => {
        return prevFishes.filter(fish => {
          const distance = Math.sqrt(
            Math.pow(clickX - fish.x, 2) + Math.pow(clickY - fish.y, 2)
          );
          
          if (distance < tools.rod.range) {
            setScore(prev => prev + fish.score);
            setCaughtFishes(prev => [...prev, fish.id]);
            createWaveEffect(fish.x, fish.y);
            return false; // 移除被捕获的鱼
          }
          return true;
        });
      });
    } else if (currentTool === 'net') {
      // 渔网动画
      setNet(prev => ({ ...prev, active: true, size: 0 }));
      
      // 渔网展开动画
      const netAnimation = setInterval(() => {
        setNet(prev => {
          if (prev.size < tools.net.range * 2) {
            return { ...prev, size: prev.size + 5 };
          } else {
            clearInterval(netAnimation);
            return prev;
          }
        });
      }, 20);

      // 检测是否网到鱼
      setTimeout(() => {
        setFishes(prevFishes => {
          return prevFishes.filter(fish => {
            const distance = Math.sqrt(
              Math.pow(clickX - fish.x, 2) + Math.pow(clickY - fish.y, 2)
            );
            
            if (distance < tools.net.range) {
              setScore(prev => prev + fish.score);
              setCaughtFishes(prev => [...prev, fish.id]);
              createWaveEffect(fish.x, fish.y);
              return false; // 移除被捕获的鱼
            }
            return true;
          });
        });
        
        // 收起渔网
        setTimeout(() => {
          setNet(prev => ({ ...prev, active: false, size: 0 }));
        }, 500);
      }, 300);
    }

    // 定期添加新鱼
    if (fishes.length < 20) {
      setTimeout(() => {
        const size = Math.random() * 40 + 20;
        const fishType = size < 30 ? 'small' : size < 45 ? 'medium' : 'large';
        setFishes(prev => [...prev, {
          id: Date.now(),
          x: Math.random() > 0.5 ? -100 : window.innerWidth + 100,
          y: Math.random() * window.innerHeight * 0.7 + 100,
          size,
          speed: Math.random() * 2 + 1,
          score: Math.floor(Math.random() * 30) + 10,
          direction: Math.random() > 0.5 ? 'left' : 'right',
          type: fishType
        }]);
      }, 500);
    }
  };

  // 切换工具
  const switchTool = (tool: 'rod' | 'net') => {
    if (toolCooldown === 0) {
      setCurrentTool(tool);
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
      className="min-h-screen bg-gradient-to-b from-blue-300 to-blue-500 cursor-none"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      {/* 游戏状态 */}
      <div className="fixed top-0 left-0 w-full p-4 bg-blue-900 bg-opacity-80 text-white flex justify-between items-center z-10">
        <div className="text-xl font-bold">太湖捕鱼</div>
        <div className="flex space-x-8">
          <div className="text-xl">得分: {score}</div>
          <div className="text-xl">时间: {timeLeft}s</div>
          <div className="text-xl">鱼群: {fishes.length}</div>
        </div>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded border-2 border-gray-600"
          onClick={() => navigate('/')}
        >
          返回首页
        </button>
      </div>

      {/* 工具选择 */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-8 z-10">
        <button
          className={`px-6 py-3 rounded-lg border-4 ${currentTool === 'rod' ? 'bg-blue-600 border-blue-800' : 'bg-gray-600 border-gray-800'} text-white font-bold transition-all duration-200 ${toolCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => switchTool('rod')}
          disabled={toolCooldown > 0}
        >
          🎣 鱼竿
        </button>
        <button
          className={`px-6 py-3 rounded-lg border-4 ${currentTool === 'net' ? 'bg-green-600 border-green-800' : 'bg-gray-600 border-gray-800'} text-white font-bold transition-all duration-200 ${toolCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => switchTool('net')}
          disabled={toolCooldown > 0}
        >
          🕸️ 渔网
        </button>
      </div>

      {/* 工具冷却指示器 */}
      {toolCooldown > 0 && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-40 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-400 transition-all duration-100"
              style={{ width: `${(toolCooldown / (currentTool === 'rod' ? tools.rod.cooldown : tools.net.cooldown)) * 100}%` }}
            ></div>
          </div>
          <div className="text-center text-white mt-1">冷却中...</div>
        </div>
      )}

      {/* 游戏区域 */}
      <div className="relative h-screen">
        {/* 背景元素 */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-green-600 to-transparent"></div>
        
        {/* 波浪效果 */}
        {waveEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute pointer-events-none"
            style={{
              left: effect.x - effect.size / 2,
              top: effect.y - effect.size / 4,
              width: effect.size,
              height: effect.size / 4,
              border: '2px solid white',
              borderRadius: '50%',
              opacity: effect.opacity,
              background: 'rgba(255, 255, 255, 0.2)'
            }}
          ></div>
        ))}
        
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
              backgroundColor: fish.type === 'large' ? '#ff6b6b' : fish.type === 'medium' ? '#4ecdc4' : '#45b7d1',
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              transform: fish.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
              transition: 'transform 0.1s ease',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
            }}
          >
            {/* 鱼眼睛 */}
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full"></div>
            {/* 鱼鳍 */}
            <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            {/* 鱼尾 */}
            <div className="absolute top-1/2 right-0 w-1/4 h-1/2 bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          </div>
        ))}
        
        {/* 鱼竿 */}
        {currentTool === 'rod' && (
          <>
            {/* 鱼竿指示器 */}
            <div
              className="absolute pointer-events-none z-20"
              style={{
                left: fishingRod.x - 15,
                top: fishingRod.y - 15,
                width: 30,
                height: 30,
                border: '2px solid white',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.1s ease'
              }}
            ></div>
            
            {/* 鱼竿 */}
            <div
              className="absolute pointer-events-none z-20"
              style={{
                left: fishingRod.x,
                top: fishingRod.y,
                transform: `rotate(${fishingRod.angle}deg)`,
                transition: 'transform 0.1s ease'
              }}
            >
              {/* 鱼竿 */}
              <div className="w-3 h-60 bg-amber-800 transform -translate-y-full origin-bottom-left rounded-full"></div>
              {/* 鱼线 */}
              <div className="w-0.5 h-100 bg-gray-300 absolute bottom-0 left-1.5 transform -translate-y-full"></div>
              {/* 鱼钩 */}
              <div className="w-4 h-4 border-2 border-gray-800 absolute top-0 left-[-6px] transform rotate(45deg) bg-gray-200"></div>
            </div>
          </>
        )}
        
        {/* 渔网指示器 */}
        {currentTool === 'net' && (
          <div
            className="absolute pointer-events-none z-20"
            style={{
              left: net.x - 25,
              top: net.y - 25,
              width: 50,
              height: 50,
              border: '2px solid white',
              borderRadius: '50%',
              background: net.active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              transition: 'all 0.1s ease'
            }}
          >
            {/* 渔网网格 */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="border border-white border-opacity-30"></div>
              ))}
            </div>
          </div>
        )}
        
        {/* 渔网展开动画 */}
        {currentTool === 'net' && net.active && (
          <div
            className="absolute pointer-events-none z-20"
            style={{
              left: net.x - net.size / 2,
              top: net.y - net.size / 2,
              width: net.size,
              height: net.size,
              border: '3px solid white',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.1s ease'
            }}
          >
            {/* 渔网网格 */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
              {Array(25).fill(0).map((_, i) => (
                <div key={i} className="border border-white border-opacity-30"></div>
              ))}
            </div>
          </div>
        )}

        {/* 游戏结束弹窗 */}
        {showScoreInput && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border-4 border-gray-800 shadow-xl p-8 max-w-md">
              <h2 className="text-3xl font-bold mb-4 text-center">游戏结束！</h2>
              <p className="text-2xl mb-6 text-center">最终得分: {score}</p>
              <p className="text-lg mb-6 text-center">捕获鱼数: {caughtFishes.length}</p>
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