import { useState, useEffect, useRef } from "react";

const StatisticCard = ({ percentage, description }) => {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateCount();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percentage]);

  const animateCount = () => {
    // Extract numeric value and suffix (e.g. "85%" → 85, "%")
    const match = String(percentage).match(/^(\d+\.?\d*)(.*)/);
    if (!match) {
      setDisplayValue(percentage);
      return;
    }

    const target = parseFloat(match[1]);
    const suffix = match[2];
    const duration = 2000;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      // Preserve decimal places from original value
      const decimals = (match[1].split(".")[1] || "").length;
      setDisplayValue(current.toFixed(decimals) + suffix);

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <h3 className="text-7xl sm:text-8xl lg:text-9xl 2xl:text-10xl leading-none font-semibold text-[#FFA731] mb-2">
        {displayValue}
      </h3>

      <p className="text-sm md:text-xl 2xl:text-2xl leading-relaxed font-normal text-[#FCF4E9] max-w-[200px] md:max-w-[300px] md:max-w-[320px]">
        {description}
      </p>
    </div>
  );
};

export default StatisticCard;