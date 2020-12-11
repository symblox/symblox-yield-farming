import React, { useCallback, useContext, useEffect, useState, useReducer } from 'react';
import {Contract} from '@ethersproject/contracts';
import { Web3Context } from './Web3Context';
import config, {pools} from "../config";

export const PoolContext = React.createContext({});

const initialBalanceState = {
    syx: 0,
    oldSyx: 0
}

function balanceReducer(state, action) {
  switch (action.type) {
    case 'syx':
      return Object.assign({}, state, {
        syx: action.data
      });
    case 'oldSyx':
      return Object.assign({}, state, {
        oldSyx: action.data
      });
    default:
      return state;
  }
}

export function PoolContextProvider ({ children }) {
    const { ethersProvider, account, providerNetwork } = useContext(
        Web3Context,
    );

    const [balanceState, balanceDispatch] = useReducer(balanceReducer, initialBalanceState);
    const [oldSyxSupply, setOldSyxSupply] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastChainId, setLastChainId] = useState(0);
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
  
    const getOldSyxData = useCallback(
        async () => {
            if(account){
                try {
                    const oldSyxContract = new Contract(config.oldSyx, config.erc20ABI, ethersProvider);
                    const oldSyxBalance = await oldSyxContract.balanceOf(account);
                    const oldSyxSupply = await oldSyxContract.totalSupply();

                    setOldSyxSupply(oldSyxSupply);
                    balanceDispatch({type: "oldSyx", data: oldSyxBalance});
                } catch (error) {
                    setIsError(true);
                    setErrorMsg(JSON.stringify(error));
                }
            }
        },
        [account, balanceDispatch, setOldSyxSupply, ethersProvider, config],
    );

    const getSyxData = useCallback(
        async () => {
            if(account){
                try {
                    const syxContract = new Contract(config.syx, config.erc20ABI, ethersProvider);
                    const syxBalance = await syxContract.balanceOf(account);
                    
                    balanceDispatch({type: "syx", data: syxBalance});
                } catch (error) {
                    setIsError(true);
                    setErrorMsg(JSON.stringify(error));
                }  
            }
        },
        [account, balanceDispatch, ethersProvider, config],
    );

    const exchangeSyx = useCallback(
        async (amount) => {
            if(account){
                setLoading(true);
                try {
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

                    const tx2 = await syxContract.exchangeSyx(amount);
                    await tx2.wait();
                    getSyxData();
                    getOldSyxData();
                } catch (error) {
                    setIsError(true);
                    setErrorMsg(JSON.stringify(error));
                } finally{
                    setLoading(false);
                }   
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
            getSyxData();
        }
    }, [
        account,
        providerNetwork,
        lastChainId,
    ]);

    return (
        <PoolContext.Provider
            value={{
                balanceState,
                oldSyxSupply,
                exchangeSyx,
                loading,
                isError, 
                setIsError, 
                errorMsg,
                setErrorMsg
            }}
        >
            {children}
        </PoolContext.Provider>
    );
};