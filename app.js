"use strict";

/*
 * Baby Shiba Inu — Shibarium DApp
 *
 * This file belongs ONLY to:
 * baby-shiba-dapp
 *
 * Telegram game is NOT modified.
 */


/* =========================================
   GAME URL
========================================= */

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
   APP START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupPlayButton();

        setupWalletButton();

        detectWallet();

    }
);


/* =========================================
   PLAY GAME
========================================= */

function setupPlayButton() {

    const button =
        document.getElementById(
            "playBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            window.location.href =
                GAME_URL;

        }
    );

}


/* =========================================
   CONNECT BUTTON
========================================= */

function setupWalletButton() {

    const button =
        document.getElementById(
            "walletBtn"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        connectWallet
    );

}


/* =========================================
   DETECT WALLET
========================================= */

function detectWallet() {

    if (
        typeof window === "undefined"
    ) {

        return;

    }


    if (
        window.ethereum
    ) {

        listenToWalletEvents();

        checkExistingConnection();

    }

}


/* =========================================
   EXISTING CONNECTION
========================================= */

async function checkExistingConnection() {

    try {

        const accounts =
            await window.ethereum.request({

                method:
                    "eth_accounts"

            });


        if (
            !accounts ||
            accounts.length === 0
        ) {

            return;

        }


        const chainId =
            await window.ethereum.request({

                method:
                    "eth_chainId"

            });


        updateWalletUI(
            accounts[0],
            chainId
        );

    } catch (error) {

        console.error(
            "Wallet detection error:",
            error
        );

    }

}


/* =========================================
   CONNECT WALLET
========================================= */

async function connectWallet() {

    const button =
        document.getElementById(
            "walletBtn"
        );


    /*
     * No injected wallet provider.
     *
     * On mobile Chrome this can happen even
     * when MetaMask or Trust Wallet is installed.
     */

    if (
        !window.ethereum
    ) {

        showWalletOptions();

        return;

    }


    try {

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Connecting...";

        }


        const accounts =
            await window.ethereum.request({

                method:
                    "eth_requestAccounts"

            });


        if (
            !accounts ||
            accounts.length === 0
        ) {

            resetWalletButton();

            showToast(
                "No wallet account was selected."
            );

            return;

        }


        const address =
            accounts[0];


        let chainId =
            await window.ethereum.request({

                method:
                    "eth_chainId"

            });


        /*
         * Switch to Shibarium.
         */

        if (
            chainId.toLowerCase() !==
            SHIBARIUM.chainId.toLowerCase()
        ) {

            await switchToShibarium();


            chainId =
                await window.ethereum.request({

                    method:
                        "eth_chainId"

                });

        }


        /*
         * Verify network.
         */

        if (
            chainId.toLowerCase() !==
            SHIBARIUM.chainId.toLowerCase()
        ) {

            resetWalletButton();

            showToast(
                "Please switch to Shibarium."
            );

            return;

        }


        updateWalletUI(
            address,
            chainId
        );


        showToast(
            "Wallet connected to Shibarium."
        );


    } catch (error) {

        console.error(
            "Wallet connection error:",
            error
        );


        resetWalletButton();


        if (
            error &&
            error.code === 4001
        ) {

            showToast(
                "Wallet connection was cancelled."
            );

        } else {

            showToast(
                "Wallet connection could not be completed."
            );

        }

    } finally {

        if (button) {

            button.disabled =
                false;

        }

    }

}


/* =========================================
   SWITCH TO SHIBARIUM
========================================= */

async function switchToShibarium() {

    try {

        await window.ethereum.request({

            method:
                "wallet_switchEthereumChain",

            params: [

                {
                    chainId:
                        SHIBARIUM.chainId
                }

            ]

        );

    } catch (error) {

        /*
         * 4902 =
         * Shibarium is not added yet.
         */

        if (
            error &&
            error.code !== 4902
        ) {

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


/* =========================================
   UPDATE UI
========================================= */

function updateWalletUI(
    address,
    chainId
) {

    const button =
        document.getElementById(
            "walletBtn"
        );


    const status =
        document.getElementById(
            "walletStatus"
        );


    if (!address) {

        return;

    }


    const shortAddress =
        address.slice(0, 6) +
        "..." +
        address.slice(-4);


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "✓ " + shortAddress;

        button.classList.add(
            "connected"
        );

    }


    if (status) {

        if (
            chainId &&
            chainId.toLowerCase() ===
            SHIBARIUM.chainId.toLowerCase()
        ) {

            status.textContent =
                "✓ Connected to Shibarium • " +
                shortAddress;

            status.classList.add(
                "connected"
            );

        } else {

            status.textContent =
                "Wallet connected • Please switch to Shibarium";

            status.classList.remove(
                "connected"
            );

        }

    }

}


/* =========================================
   RESET
========================================= */

function resetWalletButton() {

    const button =
        document.getElementById(
            "walletBtn"
        );


    const status =
        document.getElementById(
            "walletStatus"
        );


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "🔗 CONNECT WALLET";

        button.classList.remove(
            "connected"
        );

    }


    if (status) {

        status.textContent =
            "Wallet not connected";

        status.classList.remove(
            "connected"
        );

    }

}


/* =========================================
   WALLET EVENTS
========================================= */

function listenToWalletEvents() {

    if (
        !window.ethereum ||
        !window.ethereum.on
    ) {

        return;

    }


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


            getCurrentChain(
                accounts[0]
            );

        }
    );


    window.ethereum.on(
        "chainChanged",
        (chainId) => {

            getCurrentAccount(
                chainId
            );

        }
    );

}


/* =========================================
   CURRENT ACCOUNT
========================================= */

async function getCurrentAccount(
    chainId
) {

    try {

        const accounts =
            await window.ethereum.request({

                method:
                    "eth_accounts"

            });


        if (
            !accounts ||
            accounts.length === 0
        ) {

            resetWalletButton();

            return;

        }


        updateWalletUI(
            accounts[0],
            chainId
        );


        if (
            chainId.toLowerCase() !==
            SHIBARIUM.chainId.toLowerCase()
        ) {

            showToast(
                "Please switch to Shibarium."
            );

        }

    } catch (error) {

        console.error(
            "Account update error:",
            error
        );

    }

}


/* =========================================
   CURRENT CHAIN
========================================= */

async function getCurrentChain(
    address
) {

    try {

        const chainId =
            await window.ethereum.request({

                method:
                    "eth_chainId"

            });


        updateWalletUI(
            address,
            chainId
        );

    } catch (error) {

        console.error(
            "Chain detection error:",
            error
        );

    }

}


/* =========================================
   MOBILE WALLET MESSAGE
========================================= */

function showWalletOptions() {

    const message =
        "No wallet provider was detected in this browser. " +
        "Open Baby Shiba Inu from your wallet's DApp browser, " +
        "or use the WalletConnect option when enabled.";


    showToast(
        message
    );

}


/* =========================================
   TOAST
========================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


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
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            4000
        );

  }
