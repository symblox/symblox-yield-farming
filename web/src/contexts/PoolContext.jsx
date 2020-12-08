import React, { useCallback, useContext, useEffect, useState } from 'react';
import {Contract} from '@ethersproject/contracts';
import { Web3Context } from './Web3Context';
import config, {pools} from "../config";

export const PoolContext = React.createContext({});

export function PoolContextProvider ({ children }) {
    const { ethersProvider, account, providerNetwork } = useContext(
        Web3Context,
    );

    const [oldSyxBalance, setOldSyxBalance] = useState(0);
    const [oldSyxSupply, setOldSyxSupply] = useState(0);
    const [lastChainId, setLastChainId] = useState(0);
  
    const getOldSyxData = useCallback(
        async () => {
            if(account){
                const oldSyxContract = new Contract(config.oldSyx, config.erc20ABI, ethersProvider);
                const oldSyxBalance = await oldSyxContract.balanceOf(account);
                const oldSyxSupply = await oldSyxContract.totalSupply();
                setOldSyxBalance(oldSyxBalance);
                setOldSyxSupply(oldSyxSupply);
            }
        },
        [account, oldSyxBalance, oldSyxSupply, ethersProvider, config],
    );

    const exchangeSyx = useCallback(
        async (amount) => {
            if(account && amount > 0){
                const signer = ethersProvider.getSigner();        
                const syxContract = new Contract(config.syx, config.syxABI, signer);
                const oldSyxContract = new Contract(config.oldSyx, config.erc20ABI, signer);
                const allowance = await oldSyxContract.allowance(account, config.syx);
                if(parseFloat(allowance) < parseFloat(amount)){
                    const tx = await oldSyxContract.approve(
                        config.syx,
                        amount
                    );
                    await tx.wait();
                }  

                await syxContract.exchangeSyx(amount);
            }
        },
        [account, ethersProvider, config],
    );

    useEffect(() => {
        if (
            providerNetwork &&
            providerNetwork.chainId &&
            parseInt(providerNetwork.chainId) !== parseInt(lastChainId) &&
            account
        ) {
            setLastChainId(providerNetwork.chainId);
            getOldSyxData();
        }
    }, [
        account,
        providerNetwork,
        lastChainId,
    ]);

    return (
        <PoolContext.Provider
            value={{
                oldSyxBalance,
                oldSyxSupply,
                exchangeSyx
            }}
        >
            {children}
        </PoolContext.Provider>
    );
};