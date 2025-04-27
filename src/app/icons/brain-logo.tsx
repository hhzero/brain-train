function LogoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 200 180"
      className="brain-logo"
    >
      {/* 大脑外形轮廓 */}
      <path
        className="brain-outline"
        d="M100,180 C60,180 25,150 25,100 C25,75 35,55 50,45 C55,42 65,35 65,25 C65,15 75,10 85,10 
        C95,10 105,15 105,25 C105,35 115,42 120,45 C135,55 145,75 145,100 
        C145,120 135,140 120,155 C115,158 105,165 105,175 C105,185 95,190 85,190 
        C75,190 65,185 65,175 C65,165 55,158 50,155 C35,140 25,120 25,100"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* 左脑区域 */}
      <path
        className="brain-left"
        d="M50,45 C45,55 40,70 40,100 C40,120 45,140 55,155"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* 右脑区域 */}
      <path
        className="brain-right"
        d="M120,45 C125,55 130,70 130,100 C130,120 125,140 115,155"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* 脑区连接 */}
      <path
        className="brain-connection-1"
        d="M55,70 C75,60 95,60 115,70"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      <path
        className="brain-connection-2"
        d="M55,100 C75,90 95,90 115,100"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      <path
        className="brain-connection-3"
        d="M55,130 C75,120 95,120 115,130"
        fill="none"
        stroke="var(--logo-shadow)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* 星星背景 - 使用圆形代表星星 */}
      <circle className="star star-1" cx="60" cy="60" r="1" fill="var(--logo-body)" />
      <circle className="star star-2" cx="90" cy="40" r="1.2" fill="var(--logo-body)" />
      <circle className="star star-3" cx="110" cy="50" r="0.8" fill="var(--logo-body)" />
      <circle className="star star-4" cx="70" cy="90" r="1.5" fill="var(--logo-body)" />
      <circle className="star star-5" cx="100" cy="70" r="1" fill="var(--logo-body)" />
      <circle className="star star-6" cx="120" cy="90" r="0.7" fill="var(--logo-body)" />
      <circle className="star star-7" cx="80" cy="110" r="1.3" fill="var(--logo-body)" />
      <circle className="star star-8" cx="110" cy="120" r="1" fill="var(--logo-body)" />
      <circle className="star star-9" cx="65" cy="140" r="0.9" fill="var(--logo-body)" />
      <circle className="star star-10" cx="95" cy="135" r="1.1" fill="var(--logo-body)" />
      <circle className="star star-11" cx="130" cy="130" r="0.8" fill="var(--logo-body)" />
      <circle className="star star-12" cx="75" cy="75" r="1.2" fill="var(--logo-body)" />
      <circle className="star star-13" cx="85" cy="50" r="1" fill="var(--logo-body)" />
      <circle className="star star-14" cx="115" cy="75" r="0.9" fill="var(--logo-body)" />
      <circle className="star star-15" cx="90" cy="105" r="1.4" fill="var(--logo-body)" />
      
      {/* 添加一些更大的星星与不同的闪烁效果 */}
      <circle className="big-star big-star-1" cx="75" cy="65" r="2" fill="var(--logo-body)" />
      <circle className="big-star big-star-2" cx="105" cy="85" r="2.2" fill="var(--logo-body)" />
      <circle className="big-star big-star-3" cx="95" cy="125" r="1.8" fill="var(--logo-body)" />
      
      {/* CSS样式 - 添加星星闪烁动画 */}
      <style>
        {`
          .brain-logo {
            transform-origin: center;
            animation: breathe 8s ease-in-out infinite;
          }
          
          .star {
            animation: twinkle 3s infinite ease-in-out;
            transform-origin: center;
            opacity: 0.7;
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
            filter: drop-shadow(0 0 2px var(--logo-body));
            opacity: 0.9;
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
          
          @keyframes twinkle {
            0%, 100% {
              opacity: 0.4;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
          
          @keyframes glow {
            0% {
              opacity: 0.6;
              filter: drop-shadow(0 0 1px var(--logo-body));
            }
            100% {
              opacity: 1;
              filter: drop-shadow(0 0 5px var(--logo-body)) drop-shadow(0 0 8px var(--logo-body));
            }
          }
          
          @keyframes breathe {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.03);
            }
          }
        `}
      </style>
    </svg>
  );
}

export default LogoIcon; 