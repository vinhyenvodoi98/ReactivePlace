interface CountdownTimerProps {
  remainingTime: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ remainingTime }) => {
  const minutes = Math.floor((remainingTime % 3600) / 60);
  const seconds = remainingTime % 60;

  return (
    <div>{remainingTime <= 0 ? '' : `Place in ${minutes}:${seconds}`}</div>
  );
};

export default CountdownTimer;
