import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export default function CalligraphyGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showScoreInput, setShowScoreInput] = useState(false);
  
  // 湖州名诗：《吴兴杂诗》 - 阮元
  const poem = "交流四水抱城斜，散作千溪遍万家。深处种菱浅种稻，不深不浅种荷花。";
  // 过滤掉标点符号，只保留汉字
  const [poemCharacters] = useState<string[]>(poem.split('').filter(char => /[\u4e00-\u9fa5]/.test(char)));

  // 初始化游戏
  useEffect(() => {
    const randomChar = poemCharacters[Math.floor(Math.random() * poemCharacters.length)];
    setCurrentCharacter(randomChar);
    clearCanvas();
  }, []);

  // 清除画布
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
      }
    }
    setStrokes([]);
    setCurrentStroke([]);
    setScore(null);
    setGameOver(false);
  };

  // 绘制背景
  const drawBackground = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 绘制宣纸背景
        ctx.fillStyle = '#F5E6D3';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格线
        ctx.strokeStyle = '#E8D7C3';
        ctx.lineWidth = 1;
        
        // 水平线
        for (let y = 50; y < canvas.height; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        // 垂直线
        for (let x = 50; x < canvas.width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        // 绘制目标字符（增大字体大小）
        ctx.fillStyle = '#E8D7C3';
        // 根据画布大小动态调整字体大小
        const fontSize = Math.min(canvas.width, canvas.height) * 0.4;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentCharacter, canvas.width / 2, canvas.height / 2);
      }
    }
  };

  // 调整画布大小
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // 获取容器尺寸
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawBackground();
      }
    }
  }, [currentCharacter]);

  // 开始绘画
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameOver) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      let x, y;
      
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      
      setCurrentStroke([{ x, y, pressure: 1 }]);
    }
  };

  // 绘画中
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      let x, y;
      
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      
      setCurrentStroke(prev => [...prev, { x, y, pressure: 1 }]);
      
      // 实时绘制
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        const lastPoint = currentStroke[currentStroke.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  // 结束绘画
  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      setStrokes(prev => [...prev, {
        points: currentStroke,
        color: '#000',
        width: 5
      }]);
      setCurrentStroke([]);
      setIsDrawing(false);
    }
  };

  // 评分
  const calculateScore = () => {
    // 简单的评分逻辑：根据笔画数量和画布覆盖率
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 计算画布上的黑色像素数量
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let blackPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a > 0 && r < 100 && g < 100 && b < 100) {
            blackPixels++;
          }
        }
        
        // 计算覆盖率
        const totalPixels = canvas.width * canvas.height;
        const coverage = (blackPixels / totalPixels) * 100;
        
        // 计算得分（0-100）
        let calculatedScore = Math.min(Math.round(coverage * 3), 100);
        
        // 根据笔画数量调整得分
        if (strokes.length < 2) {
          calculatedScore = Math.max(calculatedScore - 30, 0);
        } else if (strokes.length > 10) {
          calculatedScore = Math.max(calculatedScore - 20, 0);
        }
        
        setScore(calculatedScore);
        setGameOver(true);
        setShowScoreInput(true);
      }
    }
  };

  // 保存作品
  const saveWork = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `calligraphy_${currentCharacter}_${Date.now()}.png`;
      link.href = dataURL;
      link.click();
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

    scores.calligraphy.push({
      name: playerName || "匿名玩家",
      score: score || 0,
      date: new Date().toISOString()
    });

    // 按得分排序并保留前10名
    scores.calligraphy.sort((a: any, b: any) => b.score - a.score);
    scores.calligraphy = scores.calligraphy.slice(0, 10);

    localStorage.setItem('gameScores', JSON.stringify(scores));
    navigate('/');
  };

  // 重新开始
  const restartGame = () => {
    const randomChar = poemCharacters[Math.floor(Math.random() * poemCharacters.length)];
    setCurrentCharacter(randomChar);
    clearCanvas();
  };

  // 选择指定字符
  const selectCharacter = (char: string) => {
    setCurrentCharacter(char);
    clearCanvas();
  };

  return (
    <div className="min-h-screen bg-amber-50 font-pixel">
      {/* 游戏状态 */}
      <div className="fixed top-0 left-0 w-full p-4 bg-amber-800 text-white flex justify-between items-center z-10">
        <div className="text-xl font-bold">湖笔书法挑战</div>
        <div className="flex space-x-8">
          <div className="text-xl">当前字: {currentCharacter}</div>
          {score !== null && <div className="text-xl">得分: {score}</div>}
        </div>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded border-2 border-gray-600"
          onClick={() => navigate('/')}
        >
          返回首页
        </button>
      </div>

      {/* 游戏区域 */}
      <div className="w-full pt-20 pb-10">
        <div className="flex flex-col items-center">
          {/* 游戏说明和名诗 */}
          {!gameOver && (
            <div className="bg-white rounded-lg border-4 border-gray-800 shadow-lg p-6 mb-4 w-full max-w-4xl text-center">
              <h2 className="text-2xl font-bold mb-4">游戏说明</h2>
              <p className="mb-4">在宣纸上用鼠标或触摸书写下方的汉字，尽量写得规范美观。</p>
              <p className="mb-4">书写完成后点击"评分"按钮，系统会根据你的书写质量进行评分。</p>
              
              {/* 湖州名诗 */}
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-2">湖州名诗：《吴兴杂诗》 - 阮元</h3>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {poemCharacters.map((char, index) => (
                    <button
                      key={index}
                      className={`text-xl p-2 rounded ${currentCharacter === char ? 'bg-amber-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      onClick={() => selectCharacter(char)}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 画布 */}
          <div className="border-4 border-gray-800 bg-white p-4 mb-6 w-full mx-4 max-w-4xl">
            <div className="relative" style={{ height: '60vh' }}>
              <canvas
                ref={canvasRef}
                className="border-2 border-gray-300 bg-[#F5E6D3] cursor-crosshair w-full h-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              ></canvas>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex flex-wrap justify-center space-x-4 mb-6 w-full max-w-4xl">
            <button
              className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded border-2 border-amber-700"
              onClick={clearCanvas}
            >
              重写
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded border-2 border-blue-700"
              onClick={calculateScore}
              disabled={gameOver}
            >
              评分
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded border-2 border-green-700"
              onClick={saveWork}
            >
              保存作品
            </button>
            <button
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded border-2 border-purple-700"
              onClick={restartGame}
            >
              随机选字
            </button>
          </div>

          {/* 游戏结束弹窗 */}
          {showScoreInput && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg border-4 border-gray-800 shadow-xl p-8 max-w-md">
                <h2 className="text-3xl font-bold mb-4 text-center">评分结果</h2>
                <p className="text-2xl mb-6 text-center">得分: {score}</p>
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
                    className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded border-2 border-amber-700"
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
    </div>
  );
}