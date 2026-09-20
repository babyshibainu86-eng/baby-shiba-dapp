"use strict";

/*
    Baby Shiba Inu
    Shibarium DApp Entry

    IMPORTANT:
    This file does NOT modify the existing Baby Shiba Inu game.
    It only controls the separate DApp Entry page.
*/


const GAME_URL =
    "https://babyshibainu86-eng.github.io/baby-shiba-shibarium/";


const SHIBARIUM = {
    chainId: "0x6D",

    chainName: "Shibarium",

    nativeCurrency: {
        name: "BONE",
        symbol: "BONE",
        decimals: 18
    },

    rpcUrls: [
        "https://rpc.shibarium.shib.io"
    ],

    blockExplorerUrls: [
        "https://shibariumscan.io"
    ]
};


document.addEventListener("DOMContentLoaded", () => {

    const playBtn =
        document.getElementById("playBtn");

    const walletBtn =
        document.getElementById("walletBtn");


    if (playBtn) {

        playBtn.addEventListener("click", () => {

            window.location.href = GAME_URL;

        });

    }


    if (walletBtn) {

        walletBtn.addEventListener(
            "click",
            connectWallet
        );

    }

});


async function connectWallet() {

    if (!window.ethereum) {

        showToast(
            "Please open Baby Shiba Inu with a Web3 wallet."
        );

        return;

    }


    try {

        const accounts =
            await window.ethereum.request({
                method: "eth_requestAccounts"
            });


        if (!accounts || !accounts.length) {

            showToast(
                "No wallet account was selected."
            );

            return;

        }


        const address =
            accounts[0];


        await switchToShibarium();


        updateWalletButton(address);


        showToast(
            "Wallet connected to Shibarium."
        );


    } catch (error) {

        console.error(
            "Wallet connection error:",
            error
        );

        showToast(
            "Wallet connection was cancelled."
        );

    }

}


async function switchToShibarium() {

    try {

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",

            params: [
                {
                    chainId:
                        SHIBARIUM.chainId
                }
            ]
        });

    } catch (error) {

        /*
            4902 = network is not added
        */

        if (error.code !== 4902) {

            throw error;

        }


        await window.ethereum.request({

            method:
                "wallet_addEthereumChain",

            params: [
                SHIBARIUM
            ]

        });

    }

}


function updateWalletButton(address) {

    const walletBtn =
        document.getElementById("walletBtn");


    if (!walletBtn) {
        return;
    }


    const shortAddress =
        address.slice(0, 6) +
        "..." +
        address.slice(-4);


    walletBtn.textContent =
        "✓ " + shortAddress;

}


function showToast(message) {

    const toast =
        document.getElementById("toast");


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

  }
