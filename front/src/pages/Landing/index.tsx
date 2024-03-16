import styled from 'styled-components';
import { rainbowWallet } from '@rainbow-me/rainbowkit/wallets';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { abi } from '../../../../sl/artifacts/contracts/SomeToken.sol/SomeToken.json';


export const Landing = () => {
  const result = useReadContract({
    abi,
    address: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    functionName: 'totalSupply',
  })
  console.log(result.data);
  return (
    <LandingContainer>
      <h1 data-testid='boilerplate-title'>Web3 React Boilerplate</h1>
      <button onClick={()=>alert(' hola ')}>hello</button>
      <button onClick={()=>alert(' chau ')}>bye</button>

      
      {!useAccount().address && (
            <div>connect wallet</div>
        )}

        {useAccount().address && (
            <div>tu direccion es: {useAccount().address} </div>
        )}



    </LandingContainer>
  );
};


const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 16rem);
  padding: 0 8rem;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
