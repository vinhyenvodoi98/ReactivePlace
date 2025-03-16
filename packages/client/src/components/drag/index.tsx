import { zoraNftCreatorV1Config } from '@zoralabs/zora-721-contracts';
import { BigNumber } from 'ethers';
import { toPng } from 'html-to-image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useContractRead,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from 'wagmi';
import { useAccount } from 'wagmi';


import { saveToIPFS } from '@/utils/saveToIPFS';

import CustomButton from '../button';
import Canvas from '../canvas';
import ColorPalette from '../colourpalette';
import reactivePlaceContract from '../../../../reactive-contract/contract.json';

const colorOptions = {
  red: '#FF0000',
  orange: '#FFA500',
  yellow: '#FFFF00',
  green: '#00FF00',
  blue: '#0000FF',
  purple: '#800080',
  white: '#FFFFFF',
  black: '#000000',
};

const DraggableBox = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [cid, setCid] = useState('');

  // create row index to call contract
  const rowIds = Array.from({ length: 100 }, (_, index) => index);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [placed, setPlaced] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#FF0000');
  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const { data: grid, refetch } = useContractReads({
    contracts: rowIds.map((id) => ({
      address: reactivePlaceContract.ReactivePlaceCallback.address as `0x${string}`,
      abi: reactivePlaceContract.ReactivePlaceCallback.abi as any,
      functionName: 'getCanvas',
      args: [id],
      chainId: 5318008, // only call from kopli
    })),
    cacheTime: 10_000,
    staleTime: 10_000,
  });

  useEffect(() => {
    // Call fetchData immediately when the component renders
    refetch?.();

    // Set up an interval to call fetchData every 10 seconds
    const interval = setInterval(() => {
      refetch?.();
    }, 10000); // 10000 milliseconds = 10 seconds

    // Cleanup khi component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  const gridColors: any = useMemo(() => {
    return grid
      ? grid.map((obj) =>
          obj.result?.map((value) => (value === '' ? 'white' : value))
        )
      : Array.from({ length: 100 }, () => new Array(200).fill('white'));
  }, [grid])

  const dataUrlToFile = async (dataUrl: string) => {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeString });

    const file = new File([blob], 'Canvas.png', { type: mimeString });
    return file;
  };

  const onGenerateNFT = useCallback(() => {
    if (canvasRef.current === null) {
      return;
    }

    toPng(canvasRef.current, { cacheBust: true })
      .then(async (dataUrl: any) => {
        const file = await dataUrlToFile(dataUrl);
        const cid = await saveToIPFS(file);
        setCid(`https://${cid}.ipfs.nftstorage.link`);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }, [canvasRef]);

  const { config } = usePrepareContractWrite({
    address: reactivePlaceContract.ReactivePlaceCallback.address as `0x${string}`,
    abi: reactivePlaceContract.ReactivePlaceCallback.abi as any,
    enabled: address != null,
    functionName: 'place',
    args: [
      {
        x: coordinates.x, //x
        y: coordinates.y, //y
        color: selectedColor, //color
      },
    ],
  });

  const { write, isLoading, isSuccess, isIdle, data } = useContractWrite(config);

  const { config: senderConfig } = usePrepareContractWrite({
    address: reactivePlaceContract.ReactivePlaceL1Contract.address as `0x${string}`,
    abi: reactivePlaceContract.ReactivePlaceL1Contract.abi,
    functionName: 'sendPlace',
    chainId: 11155111,
    args: [
      {
        x: coordinates.x, //x
        y: coordinates.y, //y
        color: selectedColor, //color
      },
    ],
  });

  const {
    write: senderWrite,
    isLoading: senderIsLoading,
    isSuccess: senderIsSuccess,
  } = useContractWrite(senderConfig);

  useEffect(() => {
    if (isLoading) {
      toast.info('⏳ Place is processing!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !isIdle) {
      if (isSuccess) {
        toast.success('✅ Place successfully!. Transaction hash: ' + data?.hash, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
        setPlaced(true);
      } else {
        toast.error('🛑 Place failed!. Transaction hash: ' + data?.hash, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
      }
    }
  }, [isLoading, isSuccess, isIdle, data]);

  const handleMouseDown = (e: any) => {
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e: any) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleWheel = (e: any) => {
    e.preventDefault();
    const newScale = Math.max(0.1, Math.min(scale + e.deltaY * -0.001, 3));
    setScale(newScale);
  };

  return (
    <div>

        {/* <div>
          <div className='z-50 flex items-center justify-center h-36 gap-4'>
            <CustomButton open={onGenerateNFT}>
              <span className='relative flex'>Take snapshot</span>
            </CustomButton>
          </div>
          <div className='flex items-center justify-center h-12'>
            {cid.length > 0 && (
              <Link href={cid}>
                IPFS links: <a>{cid}</a>
              </Link>
            )}
          </div>
        </div> */}

      <div
        className='relative'
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {gridColors && (
          <Canvas
            ref={canvasRef}
            gridColors={gridColors}
            setCoordinates={setCoordinates}
          />
        )}
      </div>
      <div className='z-50 flex items-center justify-center h-36'>
        <ColorPalette
          colorOptions={colorOptions}
          coordinates={coordinates}
          placePixel={chain?.id === 5318008 ? write : senderWrite}
          setSelectedColor={setSelectedColor}
          selectedColor={selectedColor}
          isPlaced={placed}
          setPlaced={setPlaced}
        />
      </div>
    </div>
  );
};

export default DraggableBox;
