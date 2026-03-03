const FloatingEmojis = () => {
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 0.3,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
      <svg className="w-full h-full">
        {/* Neural network connections */}
        {nodes.map((node, i) => (
          nodes.slice(i + 1).map((target, j) => (
            Math.random() > 0.7 && (
              <line
                key={`${i}-${j}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke="currentColor"
                strokeWidth="0.5"
                className="opacity-30"
              />
            )
          ))
        ))}
        
        {/* Neural nodes */}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="3"
              fill="currentColor"
              className="opacity-40 transition-all duration-300 hover:opacity-100 hover:r-5"
              style={{
                animation: `pulse 3s ease-in-out infinite ${node.delay}s`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default FloatingEmojis;
