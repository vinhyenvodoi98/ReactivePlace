import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';

import CountdownTimer from '../countdown';
import reactivePlaceContract from '../../../../reactive-contract/contract.json';

type ColorOptions = {
  red: string;
  orange: string;
  yellow: string;
  green: string;
  blue: string;
  purple: string;
  white: string;
  black: string;
};
type Props = {
  colorOptions: ColorOptions;
  coordinates: { x: number; y: number };
  setSelectedColor: Dispatch<SetStateAction<string>>;
  placePixel: (() => void) | undefined;
  selectedColor: string;
  isPlaced: boolean;
  setPlaced: Dispatch<SetStateAction<boolean>>;
};

const ColorPalette = ({
  colorOptions,
  setSelectedColor,
  coordinates,
  placePixel,
  selectedColor,
  isPlaced,
  setPlaced,
}: Props) => {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const { data: currentRound, refetch } = useContractRead({
    address: reactivePlaceContract.ReactivePlaceCallback.address as `0x${string}`,
    abi: reactivePlaceContract.ReactivePlaceCallback.abi,
    functionName: 'currentRound',
    chainId: 5318008,
    cacheTime: 10_000,
    staleTime: 10_000,
  });

  useEffect(() => {
    // Call fetchData immediately when the component renders
    refetch?.();

    // Set up an interval to call fetchData every 10 seconds
    const interval = setInterval(() => {
      refetch?.();
    }, 20000); // 20000 milliseconds = 20 seconds

    // Cleanup khi component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      setRemainingTime(Number(currentRound?.toString()) + 180 - currentTime);
      if (Number(currentRound?.toString()) + 180 - currentTime === 0) {
        setPlaced(false);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-gray-800 bg-white border-2 border-gray-900 rounded-lg'>
      <button
        style={{ backgroundColor: `${isPlaced ? '#C0C0C0' : '#DC2626'}` }}
        className='text-center mb-2 w-full rounded-lg py-2 text-white border-2 border-black hover:cursor-pointer hover:bg-red-500'
        onClick={placePixel}
        disabled={isPlaced}
      >
        {isPlaced ? (
          <CountdownTimer remainingTime={remainingTime} />
        ) : (
          `Place (${coordinates.x + ',' + coordinates.y})`
        )}
      </button>
      <div>
        {Object.entries(colorOptions).map(([colorName, colorCode]) => (
          <button
            key={colorName}
            style={{
              backgroundColor: colorCode,
              boxShadow:
                selectedColor === colorCode
                  ? 'inset 0 0 0 3px rgba(0, 0, 0, 5)'
                  : '0 0 0 0 rgba(0, 0, 0, 0)',
            }}
            onClick={() => setSelectedColor(colorCode)}
            className='w-16 h-12 border-black border-2 mx-1 hover:opacity-75 hover:cursor-pointer'
          ></button>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
