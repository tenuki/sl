import styled from 'styled-components';
import { rainbowWallet } from '@rainbow-me/rainbowkit/wallets';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { abi } from './SomeToken.json';


// export const Landing = () => {
//   // const result = useReadContract({
//   //   abi,
//   //   address: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
//   //   functionName: 'totalSupply',
//   // });
//   // console.log(result.data);
//   return (
//     <LandingContainer>
//       <h1 data-testid='boilerplate-title'>Web3 React Boilerplate</h1>
//       <button onClick={()=>alert(' hola ')}>hello</button>
//       <button onClick={()=>alert(' chau ')}>bye</button>
//
//
//       {!useAccount().address && (
//             <div>connect wallet</div>
//         )}
//
//         {useAccount().address && (
//             <div>tu direccion es: {useAccount().address} </div>
//         )}
//
//
//
//     </LandingContainer>
//   );
// };
//
//
// const LandingContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   height: calc(100vh - 16rem);
//   padding: 0 8rem;
//   align-items: center;
//   justify-content: center;
//   width: 100%;
// `;


import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'YOUR_PROJECT_ID'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum] as const
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ...wagmiOptions // Optional - Override createConfig parameters
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

export function Landing({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}