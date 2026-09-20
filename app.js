"use strict";

/*
 * Baby Shiba Inu — Shibarium DApp
 * Wallet Connection
 *
 * This file belongs ONLY to:
 * baby-shiba-dapp
 *
 * It does NOT modify the Telegram game.
 */

const GAME_URL =
    "https://babyshibainu86-eng.github.io/baby-shiba-shibarium/";

/* =========================================
   SHIBARIUM MAINNET
   ========================================= */

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


/* =========================================
   START
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const playBtn = document.getElementById("playBtn");
    const walletBtn = document.getElementById("walletBtn");

    /* PLAY GAME */

    if (playBtn) {

        playBtn.addEventListener("click", () => {

            window.location.href = GAME_URL;

        });

    }


    /* CONNECT WALLET */

    if (walletBtn) {

        walletBtn.addEventListener("click", () => {

            connectWallet();

        });

    }


    /* Check wallet when page opens */

    checkExistingWallet();

});


/* =========================================
   CHECK EXISTING WALLET
   ========================================= */

async function checkExistingWallet() {

    if (!window.ethereum) {
        return;
    }

    try {

        const accounts = await window.ethereum.request({
            method: "eth_accounts"
        });

        if (!accounts || accounts.length === 0) {
            return;
        }

        const chainId = await window.ethereum.request({
            method: "eth_chainId"
        });

        if (chainId === SHIBARIUM.chainId) {

            updateWalletButton(accounts[0]);
            showConnectedStatus();

        } else {

            updateWalletButton(accounts[0]);

            showToast(
                "Wallet connected. Please switch to Shibarium."
            );

        }

    } catch (error) {

        console.error(
            "Existing wallet check error:",
            error
        );

    }

}


/* =========================================
   CONNECT WALLET
   ========================================= */

async function connectWallet() {

    if (!window.ethereum) {

        showToast(
            "Please open Baby Shiba Inu with MetaMask or a compatible Web3 wallet."
        );

        return;
    }


    try {

        /* Request wallet account */

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });


        if (!accounts || accounts.length === 0) {

            showToast(
                "No wallet account was selected."
            );

            return;
        }


        const address = accounts[0];


        /* Get current network */

        const currentChainId =
            await window.ethereum.request({
                method: "eth_chainId"
            });


        /* Already on Shibarium */

        if (
            currentChainId.toLowerCase() ===
            SHIBARIUM.chainId.toLowerCase()
        ) {

            updateWalletButton(address);

            showConnectedStatus();

            showToast(
                "Wallet connected to Shibarium."
            );

            return;
        }


        /* Switch to Shibarium */

        await switchToShibarium();


        /* Check network again */

        const newChainId =
            await window.ethereum.request({
                method: "eth_chainId"
            });


        if (
            newChainId.toLowerCase() !==
            SHIBARIUM.chainId.toLowerCase()
        ) {

            showToast(
                "Please switch to Shibarium to continue."
            );

            return;
        }


        /* Successfully connected */

        updateWalletButton(address);

        showConnectedStatus();

        showToast(
            "Wallet connected to Shibarium."
        );


    } catch (error) {

        console.error(
            "Wallet connection error:",
            error
        );


        if (error.code === 4001) {

            showToast(
                "Wallet connection was cancelled."
            );

        } else {

            showToast(
                "Unable to connect wallet."
            );

        }

    }

}


/* =========================================
   SWITCH TO SHIBARIUM
   ========================================= */

async function switchToShibarium() {

    try {

        await window.ethereum.request({

            method: "wallet_switchEthereumChain",

            params: [
                {
                    chainId: SHIBARIUM.chainId
                }
            ]

        });

    } catch (error) {

        /*
         * Error 4902 means the wallet
         * does not have Shibarium added yet.
         */

        if (error.code !== 4902) {

            throw error;

        }


        /* Add Shibarium */

        await window.ethereum.request({

            method: "wallet_addEthereumChain",

            params: [
                SHIBARIUM
            ]

        });

    }

}


/* =========================================
   UPDATE WALLET BUTTON
   ========================================= */

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


    walletBtn.classList.add(
        "connected"
    );

}


/* =========================================
   CONNECTED STATUS
   ========================================= */

function showConnectedStatus() {

    const statusCard =
        document.querySelector(".status-card");


    if (!statusCard) {
        return;
    }


    statusCard.classList.add(
        "wallet-connected"
    );

}


/* =========================================
   WALLET ACCOUNT CHANGED
   ========================================= */

if (window.ethereum) {

    window.ethereum.on(
        "accountsChanged",
        (accounts) => {

            if (
                !accounts ||
                accounts.length === 0
            ) {

                resetWalletButton();

                showToast(
                    "Wallet disconnected."
                );

                return;
            }


            updateWalletButton(
                accounts[0]
            );


            showToast(
                "Wallet account changed."
            );

        }
    );


    /* =====================================
       NETWORK CHANGED
       ===================================== */

    window.ethereum.on(
        "chainChanged",
        (chainId) => {

            if (
                chainId.toLowerCase() ===
                SHIBARIUM.chainId.toLowerCase()
            ) {

                showConnectedStatus();

                showToast(
                    "Connected to Shibarium."
                );

            } else {

                showToast(
                    "Please switch back to Shibarium."
                );

            }

        }
    );

}


/* =========================================
   RESET WALLET BUTTON
   ========================================= */

function resetWalletButton() {

    const walletBtn =
        document.getElementById("walletBtn");


    if (!walletBtn) {
        return;
    }


    walletBtn.textContent =
        "🔗 CONNECT WALLET";


    walletBtn.classList.remove(
        "connected"
    );


    const statusCard =
        document.querySelector(".status-card");


    if (statusCard) {

        statusCard.classList.remove(
            "wallet-connected"
        );

    }

}


/* =========================================
   TOAST MESSAGE
   ========================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);

}
