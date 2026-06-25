import { useRef, useEffect, useState, useCallback } from 'react';
import socket from '../socket/socket';

export default function Canvas({ isDrawer, roomCode }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'

  const COLORS = [
    '#000000', '#e53e3e', '#ed8936', '#ecc94b',
    '#48bb78', '#4299e1', '#805ad5', '#d53f8c',
    '#a0522d', '#d3d3d3',
  ];

  // Draw locally
  const drawLine = useCallback((ctx, x0, y0, x1, y1, penColor, size) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, []);

  // Receive remote draw events
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleDraw = (data) => {
      drawLine(ctx, data.x0, data.y0, data.x1, data.y1, data.color, data.size);
    };
    const handleClear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('draw', handleDraw);
    socket.on('clearCanvas', handleClear);
    return () => {
      socket.off('draw', handleDraw);
      socket.off('clearCanvas', handleClear);
    };
  }, [drawLine]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e) => {
    if (!isDrawer) return;
    isDrawing.current = true;
    const pos = getPos(e, canvasRef.current);
    lastPos.current = pos;
  };

  const onMouseMove = (e) => {
    if (!isDrawer || !isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    const penColor = tool === 'eraser' ? '#ffffff' : color;
    const penSize = tool === 'eraser' ? brushSize * 4 : brushSize;

    drawLine(ctx, lastPos.current.x, lastPos.current.y, pos.x, pos.y, penColor, penSize);

    socket.emit('Draw', {
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: pos.x,
      y1: pos.y,
      color: penColor,
      size: penSize,
    });

    lastPos.current = pos;
  };

  const onMouseUp = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clearCanvas');
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Canvas */}
      <div
        className="flex-1 rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid #e5e7eb' }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{
            width: '100%',
            height: '100%',
            cursor: isDrawer ? (tool === 'eraser' ? 'cell' : 'crosshair') : 'default',
            display: 'block',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
        />
      </div>

      {/* Drawing toolbar — only visible to drawer */}
      {isDrawer && (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Color palette */}
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background: '#fff', border: '1px solid #e5e7eb' }}
          >
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('pen'); }}
                className="rounded-full transition-all hover:scale-110 flex-shrink-0"
                style={{
                  width: 22,
                  height: 22,
                  background: c,
                  border: color === c && tool === 'pen' ? '3px solid #1d4ed8' : '2px solid rgba(0,0,0,0.15)',
                }}
              />
            ))}
          </div>

          {/* Tool buttons */}
          <div
            className="flex items-center gap-1 px-2 py-2 rounded-xl"
            style={{ background: '#fff', border: '1px solid #e5e7eb' }}
          >
            <ToolBtn active={tool === 'pen'} onClick={() => setTool('pen')} title="Pen">
              ✏️
            </ToolBtn>
            <ToolBtn active={tool === 'eraser'} onClick={() => setTool('eraser')} title="Eraser">
              🧹
            </ToolBtn>
          </div>

          {/* Brush sizes */}
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-xl"
            style={{ background: '#fff', border: '1px solid #e5e7eb' }}
          >
            {[2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                className="rounded-full bg-gray-800 flex-shrink-0 transition-all hover:scale-110"
                style={{
                  width: s * 2 + 8,
                  height: s * 2 + 8,
                  opacity: brushSize === s ? 1 : 0.3,
                  border: brushSize === s ? '2px solid #1d4ed8' : 'none',
                }}
              />
            ))}
          </div>

          {/* Clear button */}
          <button
            onClick={clearCanvas}
            className="p-2.5 rounded-xl transition hover:bg-red-50 hover:text-red-500"
            style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#6b7280' }}
            title="Clear canvas"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition"
      style={{
        background: active ? '#eff6ff' : 'transparent',
        border: active ? '2px solid #bfdbfe' : '2px solid transparent',
      }}
    >
      {children}
    </button>
  );
}
