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
// import superPlaceAbi from '../../../../contract/artifacts/contracts/SuperPlace.sol/SuperPlace.json';
// import senderAbi from '../../../../contract/artifacts/contracts/SuperPlaceSender.sol/superPlaceSender.json';
// import superPlaceAddress from '../../../../contract/contract-address.json';
// import goerliSenderAddress from '../../../../contract/goerli-sender-address.json';

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
  const [cid, setCid] = useState('');

  // const { data: grid, refetch } = useContractReads({
  //   contracts: rowIds.map((id) => ({
  //     address: superPlaceAddress.address as `0x${string}`,
  //     abi: superPlaceAbi.abi as any,
  //     functionName: 'getCanvas',
  //     args: [id as any],
  //     chainId: 420, // only call from op-goerli
  //   })),
  //   cacheTime: 10_000,
  //   staleTime: 10_000,
  // });

  // const { data: quoteGasPayment, refetch: senderRefetch } = useContractRead({
  //   address: (chain?.id === 5
  //     ? goerliSenderAddress.addess
  //     : goerliSenderAddress.addess) as `0x${string}`,
  //   abi: senderAbi.abi as any,
  //   functionName: 'quoteGasPayment',
  //   chainId: chain?.id,
  //   cacheTime: 10_000,
  //   staleTime: 10_000,
  // });

  useEffect(() => {
    // Call fetchData immediately when the component renders
    // if (chain?.id !== 420) senderRefetch?.();

    // Set up an interval to call fetchData every 10 seconds
    const interval = setInterval(() => {
      // if (chain?.id !== 420) senderRefetch?.();
    }, 10000); // 10000 milliseconds = 10 seconds

    // Cleanup khi component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Call fetchData immediately when the component renders
    // refetch?.();

    // Set up an interval to call fetchData every 10 seconds
    const interval = setInterval(() => {
      // refetch?.();
    }, 10000); // 10000 milliseconds = 10 seconds

    // Cleanup khi component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  const gridColors: any = useMemo(() => {
    return Array.from({ length: 100 }, () => new Array(200).fill('white'));
  }, []);

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

  ////////////// zora
  const name = `super/Place ${new Date()
    .toISOString()
    .replace(/T/, ':')
    .replace(/\..+/, '')}`;
  const symbol = 'S/P';
  const defaultAdmin = address as `0x${string}`;
  const editionSize = BigInt(50);
  const royaltyBPS = 0;
  const fundsRecipient = address as `0x${string}`;
  const saleConfig = {
    maxSalePurchasePerAddress: 100,
    presaleEnd: BigInt(0),
    presaleStart: BigInt(0),
    presaleMerkleRoot:
      '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
    publicSaleEnd: BigInt(1844673709551615),
    publicSalePrice: BigInt(0),
    publicSaleStart: BigInt(0),
  };

  const { config: zoraConfig } = usePrepareContractWrite({
    abi: zoraNftCreatorV1Config.abi,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    address: zoraNftCreatorV1Config.address[chain?.id] as `0x${string}`,
    functionName: 'createDrop',
    args: [
      name,
      symbol,
      defaultAdmin,
      editionSize,
      royaltyBPS,
      fundsRecipient,
      saleConfig,
      cid,
      cid,
    ],
  });

  const { write: writeZora } = useContractWrite(zoraConfig);

  // const { config } = usePrepareContractWrite({
  //   address: superPlaceAddress.address as `0x${string}`,
  //   abi: superPlaceAbi.abi,
  //   enabled: proof != null && address != null,
  //   functionName: 'place',
  //   args: [
  //     {
  //       signal: address!,
  //       root: proof?.merkle_root
  //         ? decode<BigNumber>('uint256', proof?.merkle_root ?? '')
  //         : (BigNumber.from(0) as any),
  //       nullifierHash: proof?.nullifier_hash
  //         ? decode<BigNumber>('uint256', proof?.nullifier_hash ?? '')
  //         : BigNumber.from(0),
  //       proof: proof?.proof
  //         ? decode<
  //             [
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber
  //             ]
  //           >('uint256[8]', proof?.proof ?? '')
  //         : [
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //           ],
  //       x: coordinates.x, //x
  //       y: coordinates.y, //y
  //       color: selectedColor, //color
  //     },
  //   ] as any,
  // });

  // const { write, isLoading, isSuccess } = useContractWrite(config);

  // const { config: senderConfig } = usePrepareContractWrite({
  //   address: (chain?.id === 5
  //     ? goerliSenderAddress.addess
  //     : goerliSenderAddress.addess) as `0x${string}`,
  //   abi: senderAbi.abi,
  //   enabled: proof != null && address != null,
  //   functionName: 'sendAndPayForMessage',
  //   args: [
  //     {
  //       signal: address!,
  //       root: proof?.merkle_root
  //         ? decode<BigNumber>('uint256', proof?.merkle_root ?? '')
  //         : (BigNumber.from(0) as any),
  //       nullifierHash: proof?.nullifier_hash
  //         ? decode<BigNumber>('uint256', proof?.nullifier_hash ?? '')
  //         : BigNumber.from(0),
  //       proof: proof?.proof
  //         ? decode<
  //             [
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber,
  //               BigNumber
  //             ]
  //           >('uint256[8]', proof?.proof ?? '')
  //         : [
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //             BigNumber.from(0),
  //           ],
  //       x: coordinates.x, //x
  //       y: coordinates.y, //y
  //       color: selectedColor, //color
  //     },
  //   ] as any,
  //   value: quoteGasPayment as any,
  // });

  // const {
  //   write: senderWrite,
  //   isLoading: senderIsLoading,
  //   isSuccess: senderIsSuccess,
  // } = useContractWrite(senderConfig);

  // useEffect(() => {
  //   if (isLoading) {
  //     toast.info('⏳ Place is processing!', {
  //       position: 'top-right',
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       theme: 'light',
  //     });
  //   }
  // }, [isLoading]);

  // useEffect(() => {
  //   if (!isLoading && !!proof) {
  //     if (isSuccess) {
  //       toast.success('✅ Place successfully!', {
  //         position: 'top-right',
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         theme: 'light',
  //       });
  //       setPlaced(true);
  //     } else {
  //       toast.error('🛑 Place failed!', {
  //         position: 'top-right',
  //         autoClose: 5000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         theme: 'light',
  //       });
  //     }
  //   }
  // }, [isLoading, isSuccess]);

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
          placePixel={()=>console.log("test")}
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
