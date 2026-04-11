import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface Position {
  x: number;
  y: number;
}

type CellType = 'wall' | 'path' | 'start' | 'end' | 'player';

type MazeCell = CellType;

type Maze = MazeCell[][];

export default function MazeGame() {
  const navigate = useNavigate();
  const [maze, setMaze] = useState<Maze>([]);
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 });
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showScoreInput, setShowScoreInput] = useState(false);

  // 迷宫大小
  const mazeWidth = 25;
  const mazeHeight = 20;

  // 生成迷宫
  const generateMaze = useCallback(() => {
    // 初始化迷宫，全部为墙
    const newMaze: Maze = Array(mazeHeight).fill(null).map(() => 
      Array(mazeWidth).fill('wall')
    );

    // 深度优先搜索生成迷宫
    const stack: Position[] = [];
    const start: Position = { x: 0, y: 0 };
    newMaze[start.y][start.x] = 'start';
    stack.push(start);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = getUnvisitedNeighbors(current, newMaze);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        removeWall(current, next, newMaze);
        newMaze[next.y][next.x] = 'path';
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    // 设置终点
    newMaze[mazeHeight - 1][mazeWidth - 1] = 'end';
    
    return newMaze;
  }, []);

  // 获取未访问的邻居
  const getUnvisitedNeighbors = (position: Position, maze: Maze): Position[] => {
    const neighbors: Position[] = [];
    const directions = [
      { x: 0, y: -2 }, // 上
      { x: 2, y: 0 },  // 右
      { x: 0, y: 2 },  // 下
      { x: -2, y: 0 }  // 左
    ];

    for (const dir of directions) {
      const newX = position.x + dir.x;
      const newY = position.y + dir.y;

      if (
        newX >= 0 && newX < mazeWidth &&
        newY >= 0 && newY < mazeHeight &&
        maze[newY][newX] === 'wall'
      ) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  };

  // 移除墙
  const removeWall = (current: Position, next: Position, maze: Maze) => {
    const wallX = (current.x + next.x) / 2;
    const wallY = (current.y + next.y) / 2;
    maze[wallY][wallX] = 'path';
  };

  // 初始化游戏
  useEffect(() => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayerPosition({ x: 0, y: 0 });
    setTime(0);
    setGameStarted(false);
    setGameOver(false);
  }, [generateMaze]);

  // 游戏计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // 移动逻辑提取为独立函数，以便复用
  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameStarted || gameOver) return;

    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch (direction) {
        case 'up':
          newY -= 1;
          break;
        case 'down':
          newY += 1;
          break;
        case 'left':
          newX -= 1;
          break;
        case 'right':
          newX += 1;
          break;
      }

      // 边界检查和碰撞检测
      if (
        newX >= 0 && newX < mazeWidth &&
        newY >= 0 && newY < mazeHeight &&
        maze[newY][newX] !== 'wall'
      ) {
        // 检查是否到达终点
        if (maze[newY][newX] === 'end') {
          setGameOver(true);
          setShowScoreInput(true);
        }
        return { x: newX, y: newY };
      }
      return prev;
    });
  }, [gameStarted, gameOver, maze, mazeWidth, mazeHeight]);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      switch (key) {
        case 'w':
        case 'arrowup':
          movePlayer('up');
          break;
        case 's':
        case 'arrowdown':
          movePlayer('down');
          break;
        case 'a':
        case 'arrowleft':
          movePlayer('left');
          break;
        case 'd':
        case 'arrowright':
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  // 保存得分
  const saveScore = () => {
    const savedScores = localStorage.getItem('gameScores');
    let scores = savedScores ? JSON.parse(savedScores) : {
      fishing: [],
      maze: [],
      calligraphy: []
    };

    scores.maze.push({
      name: playerName || "匿名玩家",
      time: time,
      date: new Date().toISOString()
    });

    // 按时间排序并保留前10名
    scores.maze.sort((a: any, b: any) => a.time - b.time);
    scores.maze = scores.maze.slice(0, 10);

    localStorage.setItem('gameScores', JSON.stringify(scores));
    navigate('/');
  };

  // 开始游戏
  const startGame = () => {
    setGameStarted(true);
  };

  // 重新开始
  const restartGame = () => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayerPosition({ x: 0, y: 0 });
    setTime(0);
    setGameStarted(false);
    setGameOver(false);
    setShowScoreInput(false);
  };

  return (
    <div className="min-h-screen bg-green-100 font-pixel">
      {/* 游戏状态 */}
      <div className="fixed top-0 left-0 w-full p-4 bg-green-800 text-white flex justify-between items-center z-10">
        <div className="text-xl font-bold">莫干山竹林探险</div>
        <div className="flex space-x-8">
          <div className="text-xl">时间: {time}s</div>
          <div className="text-xl">位置: ({playerPosition.x}, {playerPosition.y})</div>
        </div>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded border-2 border-gray-600"
          onClick={() => navigate('/')}
        >
          返回首页
        </button>
      </div>

      {/* 游戏区域 */}
      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="flex flex-col items-center">
          {/* 游戏说明 */}
          {!gameStarted && !gameOver && (
            <div className="bg-white rounded-lg border-4 border-gray-800 shadow-lg p-8 mb-8 max-w-md text-center">
              <h2 className="text-2xl font-bold mb-4">游戏说明</h2>
              <p className="mb-6">使用方向键或WASD控制角色在竹林迷宫中移动，找到出口。</p>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-8 rounded border-2 border-green-700 text-lg"
                onClick={startGame}
              >
                开始游戏
              </button>
            </div>
          )}

          {/* 迷宫 */}
          <div 
            className="border-4 border-gray-800 bg-green-500 p-4 mb-4"
            style={{ 
              width: '90vw',
              maxWidth: '1000px',
              height: '50vh'
            }}
          >
            <div
              style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${mazeWidth}, 1fr)`,
                gridTemplateRows: `repeat(${mazeHeight}, 1fr)`,
                gap: '2px',
                width: '100%',
                height: '100%'
              }}
            >
            {maze.map((row, y) => 
              row.map((cell, x) => {
                const isPlayer = x === playerPosition.x && y === playerPosition.y;
                let cellClass = '';
                
                if (isPlayer) {
                  cellClass = 'bg-yellow-400';
                } else {
                  switch (cell) {
                    case 'wall':
                      cellClass = 'bg-green-800';
                      break;
                    case 'path':
                      cellClass = 'bg-green-300';
                      break;
                    case 'start':
                      cellClass = 'bg-blue-500';
                      break;
                    case 'end':
                      cellClass = 'bg-red-500';
                      break;
                  }
                }
                
                return (
                  <div 
                    key={`${x}-${y}`}
                    className={`${cellClass} rounded-sm`}
                  ></div>
                );
              })
            )}
            </div>
          </div>

          {/* 移动端虚拟方向键 */}
          {gameStarted && !gameOver && (
            <div className="mb-8 grid grid-cols-3 gap-2 w-48 mx-auto md:hidden">
              <div className="col-start-2">
                <button 
                  className="w-full aspect-square bg-gray-800 text-white rounded-lg active:bg-gray-600 shadow-[0_4px_0_rgb(55,65,81)] active:shadow-[0_0px_0_rgb(55,65,81)] active:translate-y-1 flex items-center justify-center text-2xl font-bold touch-manipulation"
                  onClick={(e) => { e.preventDefault(); movePlayer('up'); }}
                  onTouchStart={(e) => { e.preventDefault(); movePlayer('up'); }}
                >
                  ↑
                </button>
              </div>
              <div className="col-start-1 row-start-2">
                <button 
                  className="w-full aspect-square bg-gray-800 text-white rounded-lg active:bg-gray-600 shadow-[0_4px_0_rgb(55,65,81)] active:shadow-[0_0px_0_rgb(55,65,81)] active:translate-y-1 flex items-center justify-center text-2xl font-bold touch-manipulation"
                  onClick={(e) => { e.preventDefault(); movePlayer('left'); }}
                  onTouchStart={(e) => { e.preventDefault(); movePlayer('left'); }}
                >
                  ←
                </button>
              </div>
              <div className="col-start-2 row-start-2">
                <button 
                  className="w-full aspect-square bg-gray-800 text-white rounded-lg active:bg-gray-600 shadow-[0_4px_0_rgb(55,65,81)] active:shadow-[0_0px_0_rgb(55,65,81)] active:translate-y-1 flex items-center justify-center text-2xl font-bold touch-manipulation"
                  onClick={(e) => { e.preventDefault(); movePlayer('down'); }}
                  onTouchStart={(e) => { e.preventDefault(); movePlayer('down'); }}
                >
                  ↓
                </button>
              </div>
              <div className="col-start-3 row-start-2">
                <button 
                  className="w-full aspect-square bg-gray-800 text-white rounded-lg active:bg-gray-600 shadow-[0_4px_0_rgb(55,65,81)] active:shadow-[0_0px_0_rgb(55,65,81)] active:translate-y-1 flex items-center justify-center text-2xl font-bold touch-manipulation"
                  onClick={(e) => { e.preventDefault(); movePlayer('right'); }}
                  onTouchStart={(e) => { e.preventDefault(); movePlayer('right'); }}
                >
                  →
                </button>
              </div>
            </div>
          )}

          {/* 游戏结束弹窗 */}
          {showScoreInput && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg border-4 border-gray-800 shadow-xl p-8 max-w-md">
                <h2 className="text-3xl font-bold mb-4 text-center">恭喜完成！</h2>
                <p className="text-2xl mb-6 text-center">用时: {time}秒</p>
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
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded border-2 border-green-700"
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

          {/* 重新开始按钮 */}
          {gameOver && (
            <button
              className="mt-8 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded border-2 border-green-700"
              onClick={restartGame}
            >
              重新开始
            </button>
          )}
        </div>
      </div>
    </div>
  );
}