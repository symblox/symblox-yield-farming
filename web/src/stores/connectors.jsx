import {InjectedConnector} from "@web3-react/injected-connector";
// import { NetworkConnector } from "@web3-react/network-connector";
import {WalletConnectConnector} from "@web3-react/walletconnect-connector";
import {WalletLinkConnector} from "@web3-react/walletlink-connector";

const POLLING_INTERVAL = 12000;

const RPC_URLS = {
    106: "https://rpc.symblox.net",
    111: "https://explorer.testnet.veladev.net/rpc"
};
export const injected = new InjectedConnector({
    supportedChainIds: [106, 111]
});

// export const network = new NetworkConnector({
//   urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
//   defaultChainId: 1,
//   pollingInterval: POLLING_INTERVAL
// });

export const walletconnect = new WalletConnectConnector({
    rpc: {106: RPC_URLS[106]},
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
    pollingInterval: POLLING_INTERVAL
});

export const walletlink = new WalletLinkConnector({
    url: RPC_URLS[106],
    appName: "symblox"
});
