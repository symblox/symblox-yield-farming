import React, {useCallback, useEffect, useState} from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {ethers} from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";

import {nodeConfigs, networkOptions} from "../constants/constants";

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

export const Web3Provider = ({children}) => {
    const [providerNetwork, setProviderNetwork] = useState();
    const [chosenNetwork, setChosenNetwork] = useState(networkOptions[0]);
    const [ethersProvider, setEthersProvider] = useState();
    const [account, setAccount] = useState();

    const connectWeb3 = useCallback(async () => {
        try {
            const modalProvider = await web3Modal.connect();
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
        } catch (error) {
            // eslint-disable-next-line
            console.log({web3ModalError: error});
        }
    }, []);

    // useEffect(() => {
    //     if (
    //         providerNetwork &&
    //         chosenNetwork &&
    //         providerNetwork.chainId === chosenNetwork.value
    //     ) {
    //         setNetworkMismatch(false);
    //     } else {
    //         setNetworkMismatch(true);
    //     }
    // }, [chosenNetwork, providerNetwork]);

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
                account
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};
