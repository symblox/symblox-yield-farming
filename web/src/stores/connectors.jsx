import {InjectedConnector} from "@web3-react/injected-connector";
// import { NetworkConnector } from "@web3-react/network-connector";
import {WalletConnectConnector} from "@web3-react/walletconnect-connector";
import {WalletLinkConnector} from "@web3-react/walletlink-connector";

const POLLING_INTERVAL = 12000;

const RPC_URLS = {
    1: "https://tn.yopta.net",
    111: "https://tn.yopta.net"
};
export const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42]
});

// export const network = new NetworkConnector({
//   urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
//   defaultChainId: 1,
//   pollingInterval: POLLING_INTERVAL
// });

export const walletconnect = new WalletConnectConnector({
    rpc: {1: RPC_URLS[1]},
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
    pollingInterval: POLLING_INTERVAL
});

export const walletlink = new WalletLinkConnector({
    url: RPC_URLS[1],
    appName: "ygov.finance"
});
