import React, {useCallback, useEffect, useState} from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {ethers} from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";

import {nodeConfigs, networkOptions} from "../constants/constants";
import Store from "../stores";

import {
    GET_BALANCES_PERPETUAL
} from "../constants";

const store = Store.store;
const emitter = Store.emitter;

export const Web3Context = React.createContext({});

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: nodeConfigs.infuraId,
            rpc: {
                106: "https://explorer.velas.com/rpc",
                111: "https://explorer.testnet.veladev.net/rpc"
            }
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const Web3Provider = ({children}) => {
    const [providerNetwork, setProviderNetwork] = useState();
    const [providerLoading, setProviderLoading] = useState(false);
    const [ethersProvider, setEthersProvider] = useState();
    const [account, setAccount] = useState();

    const subscribeProvider = async (provider) => {
        if (!provider.on) {
            return;
        }

        provider.on("close", () => {});
        provider.on("accountsChanged", async (accounts) => {
            setAccount(accounts[0]);
            store.setStore({account: {address: accounts[0]}});
            emitter.emit("accountsChanged");
        });
        provider.on("chainChanged", async (chainId) => {
            
        });
        provider.on("networkChanged", async (networkId) => {
        
        });
    }

    const connectWeb3 = useCallback(async () => {
        setProviderLoading(true);
        try {
            const modalProvider = await web3Modal.connect();
            await subscribeProvider(modalProvider);
            const web3Provider = new Web3(modalProvider);
            const provider = new ethers.providers.Web3Provider(
                web3Provider.currentProvider
            );

            setEthersProvider(provider);
            const network = await provider.getNetwork();
            setProviderNetwork(network);
            const signer = provider.getSigner();
            const gotAccount = await signer.getAddress();
            setAccount(gotAccount);
            store.setStore({account: {address: gotAccount}, web3context: signer.provider.provider});
        } catch (error) {
            // eslint-disable-next-line
            console.log({web3ModalError: error});
        }
        await sleep(500);
        setProviderLoading(false);
    }, []);

    const disconnect = useCallback(async () => {
        web3Modal.clearCachedProvider();
        setAccount();
        setEthersProvider();
        setProviderNetwork();
    }, []);

    useEffect(() => {
        if (web3Modal.cachedProvider) {
            connectWeb3().catch(error => {
                // eslint-disable-next-line
                console.error({web3ModalError: error});
            });
        }
    }, [connectWeb3]);

    return (
        <Web3Context.Provider
            value={{
                ethersProvider,
                connectWeb3,
                disconnect,
                providerNetwork,
                providerLoading,
                account,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};
