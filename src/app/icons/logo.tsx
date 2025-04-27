function LogoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="auto"
      height="auto"
      viewBox="0 0 200 240"
      className="brain-logo"
    >
      {/* 外部发光背景 */}
      <circle
        cx="100"
        cy="120"
        r="90"
        className="logo-background"
        fill="rgba(0, 0, 0, 0.7)"
        filter="blur(8px)"
      />
      
      {/* 更圆润的大脑外形轮廓 - 去掉上下凸起 */}
      <path
        className="brain-outline"
        d="M100,210 C60,210 30,175 30,120 C30,65 60,30 100,30 
           C140,30 170,65 170,120 C170,175 140,210 100,210"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="drop-shadow(0 0 5px var(--logo-shadow))"
      />
      
      {/* 左脑区域 - 调整为更圆润的形状 */}
      <path
        className="brain-left"
        d="M50,60 C45,80 40,100 40,120 C40,140 45,160 55,180"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* 右脑区域 - 调整为更圆润的形状 */}
      <path
        className="brain-right"
        d="M150,60 C155,80 160,100 160,120 C160,140 155,160 145,180"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* 脑区连接 - 水平连接线条 */}
      <path
        className="brain-connection-1"
        d="M55,70 C75,60 125,60 145,70"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      <path
        className="brain-connection-2"
        d="M50,120 C75,110 125,110 150,120"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      <path
        className="brain-connection-3"
        d="M55,170 C75,160 125,160 145,170"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* 星星发光底层 - 添加额外的发光效果 */}
      <circle className="star-glow star-glow-1" cx="60" cy="60" r="5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-2" cx="90" cy="50" r="5.5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-3" cx="130" cy="60" r="5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-4" cx="70" cy="90" r="6" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-5" cx="100" cy="70" r="5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-6" cx="140" cy="90" r="4.5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-7" cx="80" cy="130" r="5.5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-8" cx="120" cy="130" r="5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-9" cx="65" cy="170" r="5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-10" cx="100" cy="160" r="5.5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-11" cx="135" cy="170" r="5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-12" cx="60" cy="120" r="5.5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-13" cx="100" cy="50" r="5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-14" cx="140" cy="120" r="5" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      <circle className="star-glow star-glow-15" cx="100" cy="125" r="6" fill="rgba(255, 255, 255, 0.2)" filter="blur(3px)" />
      
      {/* 大星星的发光底层 */}
      <circle className="big-star-glow big-star-glow-1" cx="75" cy="75" r="10" fill="rgba(255, 255, 255, 0.3)" filter="blur(5px)" />
      <circle className="big-star-glow big-star-glow-2" cx="125" cy="105" r="12" fill="rgba(255, 255, 255, 0.3)" filter="blur(5px)" />
      <circle className="big-star-glow big-star-glow-3" cx="95" cy="145" r="10" fill="rgba(255, 255, 255, 0.3)" filter="blur(5px)" />
      
      {/* 星星背景 - 调整位置适应新形状 */}
      <circle className="star star-1" cx="60" cy="60" r="2.2" fill="#ffffff" />
      <circle className="star star-2" cx="90" cy="50" r="2.4" fill="#ffffff" />
      <circle className="star star-3" cx="130" cy="60" r="2" fill="#ffffff" />
      <circle className="star star-4" cx="70" cy="90" r="2.7" fill="#ffffff" />
      <circle className="star star-5" cx="100" cy="70" r="2.2" fill="#ffffff" />
      <circle className="star star-6" cx="140" cy="90" r="1.9" fill="#ffffff" />
      <circle className="star star-7" cx="80" cy="130" r="2.5" fill="#ffffff" />
      <circle className="star star-8" cx="120" cy="130" r="2.2" fill="#ffffff" />
      <circle className="star star-9" cx="65" cy="170" r="2.1" fill="#ffffff" />
      <circle className="star star-10" cx="100" cy="160" r="2.3" fill="#ffffff" />
      <circle className="star star-11" cx="135" cy="170" r="2" fill="#ffffff" />
      <circle className="star star-12" cx="60" cy="120" r="2.4" fill="#ffffff" />
      <circle className="star star-13" cx="100" cy="50" r="2.2" fill="#ffffff" />
      <circle className="star star-14" cx="140" cy="120" r="2.1" fill="#ffffff" />
      <circle className="star star-15" cx="100" cy="125" r="2.6" fill="#ffffff" />
      
      {/* 添加一些更大的星星与不同的闪烁效果 */}
      <circle className="big-star big-star-1" cx="75" cy="75" r="4.5" fill="#ffffff" />
      <circle className="big-star big-star-2" cx="125" cy="105" r="5" fill="#ffffff" />
      <circle className="big-star big-star-3" cx="95" cy="145" r="4.5" fill="#ffffff" />
      
      {/* CSS样式 - 添加星星闪烁动画 */}
      <style>
        {`
          .brain-logo {
            transform-origin: center;
            animation: breathe 8s ease-in-out infinite;
            filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.7));
          }
          
          .logo-background {
            animation: pulse 4s ease-in-out infinite;
          }
          
          .brain-outline {
            animation: outline-glow 3s infinite alternate;
          }
          
          .star-glow {
            animation: glow-pulse 4s infinite alternate ease-in-out;
            transform-origin: center;
          }
          
          .big-star-glow {
            animation: big-glow-pulse 5s infinite alternate ease-in-out;
            transform-origin: center;
          }
          
          .star {
            animation: twinkle 3s infinite ease-in-out;
            transform-origin: center;
            opacity: 1;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.6));
          }
          
          .star-2, .star-7, .star-10, .star-13 {
            animation-delay: 0.5s;
            animation-duration: 4s;
          }
          
          .star-3, .star-6, .star-9, .star-14 {
            animation-delay: 1s;
            animation-duration: 3.5s;
          }
          
          .star-4, .star-8, .star-12, .star-15 {
            animation-delay: 1.5s;
            animation-duration: 4.5s;
          }
          
          .star-5, .star-11 {
            animation-delay: 2s;
            animation-duration: 5s;
          }
          
          .big-star {
            animation: glow 5s infinite alternate;
            filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 24px rgba(255, 255, 255, 0.7));
            opacity: 1;
          }
          
          .big-star-1 {
            animation-delay: 0.7s;
          }
          
          .big-star-2 {
            animation-delay: 1.7s;
          }
          
          .big-star-3 {
            animation-delay: 2.7s;
          }
          
          @keyframes outline-glow {
            0% {
              stroke-width: 4;
              filter: drop-shadow(0 0 5px var(--logo-shadow));
            }
            100% {
              stroke-width: 5;
              filter: drop-shadow(0 0 15px var(--logo-shadow)) drop-shadow(0 0 25px var(--logo-shadow));
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 0.6;
              r: 90;
            }
            50% {
              opacity: 0.8;
              r: 92;
            }
          }
          
          @keyframes glow-pulse {
            0% {
              opacity: 0.3;
              filter: blur(3px);
            }
            100% {
              opacity: 0.6;
              filter: blur(6px);
            }
          }
          
          @keyframes big-glow-pulse {
            0% {
              opacity: 0.4;
              filter: blur(5px);
            }
            100% {
              opacity: 0.7;
              filter: blur(10px);
            }
          }
          
          @keyframes twinkle {
            0%, 100% {
              opacity: 0.9;
              transform: scale(0.8);
              filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
            }
            50% {
              opacity: 1;
              transform: scale(1.4);
              filter: drop-shadow(0 0 15px white) drop-shadow(0 0 30px white);
            }
          }
          
          @keyframes glow {
            0% {
              opacity: 0.9;
              filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
              transform: scale(1);
            }
            100% {
              opacity: 1;
              filter: drop-shadow(0 0 20px white) drop-shadow(0 0 40px white) drop-shadow(0 0 60px white);
              transform: scale(1.3);
            }
          }
          
          @keyframes breathe {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.08);
            }
          }
        `}
      </style>
    </svg>
  );
}

export default LogoIcon; 