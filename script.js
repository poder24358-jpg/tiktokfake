document.addEventListener('DOMContentLoaded', () => {
    const openExchangeBtn = document.getElementById('openExchangeBtn');
    const successScreen = document.getElementById('successScreen');
    const goBackBtn = document.getElementById('goBackBtn');
    const exchangeScreen = document.getElementById('exchangeScreen');
    const exchangeForm = document.getElementById('exchangeForm');
    const closeExchangeBtn = document.getElementById('closeExchangeBtn');
    const usernameInput = document.getElementById('usernameInput');
    const amountInput = document.getElementById('amountInput');
    const exchangeError = document.getElementById('exchangeError');
    const exchangeBalanceAmount = document.getElementById('exchangeBalanceAmount');
    const exchangeCoinBalance = document.getElementById('exchangeCoinBalance');
    const sendButton = document.getElementById('sendButton');
    const sendLabel = sendButton.querySelector('.send-label');
    const loadingSpinner = sendButton.querySelector('.loading-spinner');
    const coinOptions = document.querySelectorAll('.coin-option');
    const customAmountModal = document.getElementById('customAmountModal');
    const closeCustomModalBtn = document.getElementById('closeCustomModalBtn');
    const customCoinsInput = document.getElementById('customCoinsInput');
    const allCoinsBtn = document.getElementById('allCoinsBtn');
    const customExchangeBtn = document.getElementById('customExchangeBtn');
    const customDollarAmount = document.getElementById('customDollarAmount');
    const customCoinValue = document.getElementById('customCoinValue');
    const transactionsList = document.getElementById('transactionsList');
    const availableRewardsAmount = document.getElementById('availableRewardsAmount');
    const availableRewardsSummary = document.getElementById('availableRewardsSummary');
    const coinEquivalent = document.getElementById('coinEquivalent');

    const initialRewards = 10952887618.40;
    const coinsPerDollar = 82.4;
    const storageKey = 'liveRewardsTransactions';
    let transactions = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const formatMoney = (amount) => `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    const formatDate = (date) => date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const renderBalance = () => {
        const spent = transactions.reduce((total, transaction) => total + transaction.amount, 0);
        const availableRewards = Math.max(0, initialRewards - spent);
        const formattedRewards = formatMoney(availableRewards);

        availableRewardsAmount.textContent = formattedRewards;
        availableRewardsSummary.textContent = formattedRewards;
        const availableCoins = (availableRewards * coinsPerDollar).toLocaleString('en-US', { maximumFractionDigits: 0 });
        const balanceText = `= ${formattedRewards} (<img class="coin-icon" src="images/moneda2-v2.png" alt=""> ${availableCoins})`;
        coinEquivalent.innerHTML = balanceText;
        exchangeBalanceAmount.textContent = formattedRewards;
        exchangeCoinBalance.innerHTML = balanceText;
    };

    const renderTransactions = () => {
        transactionsList.innerHTML = transactions.map((transaction) => `
            <div class="transaction-item">
                <div class="trans-left">
                    <span class="trans-title">Sent ${transaction.coins.toLocaleString('en-US')} Coins to</span>
                    <span class="trans-user">${transaction.recipient}</span>
                    <span class="trans-date">${transaction.date}</span>
                </div>
                <div class="trans-right negative">-${formatMoney(transaction.amount)}</div>
            </div>
        `).join('');
    };

    const resetSuccessDetails = () => {
        document.getElementById('receiptRecipient').textContent = '@amrit_s._';
        document.getElementById('receiptCoins').textContent = '10,000,000 Coins';
        document.getElementById('receiptAmount').textContent = '$121,000.00';
        document.getElementById('receiptTime').textContent = '06/09/2026, 20:05:44';
        document.getElementById('successSummary').innerHTML = 'You exchanged for <img class="coin-icon" src="images/moneda2-v2.png" alt=""> 10,000,000 Coins';
    };

    renderBalance();
    renderTransactions();

    openExchangeBtn.addEventListener('click', () => {
        successScreen.classList.add('hidden');
        exchangeError.textContent = '';
        exchangeForm.reset();
        coinOptions.forEach((option) => option.classList.remove('selected'));
        sendButton.disabled = false;
        closeExchangeBtn.disabled = false;
        sendButton.classList.remove('is-loading');
        sendLabel.textContent = 'Exchange';
        exchangeScreen.classList.remove('hidden');
        usernameInput.focus();
    });

    closeExchangeBtn.addEventListener('click', () => {
        if (sendButton.disabled) {
            return;
        }
        exchangeScreen.classList.add('hidden');
    });

    coinOptions.forEach((option) => {
        option.addEventListener('click', () => {
            amountInput.value = option.dataset.coins;
            coinOptions.forEach((item) => item.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    const updateCustomConversion = () => {
        const coins = Number(customCoinsInput.value) || 0;
        const dollars = coins / coinsPerDollar;
        const formattedAmount = formatMoney(dollars);
        customDollarAmount.textContent = formattedAmount;
        customCoinValue.textContent = formattedAmount;
    };

    amountInput.addEventListener('click', () => {
        customAmountModal.classList.remove('hidden');
        customCoinsInput.value = amountInput.value || '1';
        updateCustomConversion();
        customCoinsInput.focus();
    });

    customCoinsInput.addEventListener('input', updateCustomConversion);

    allCoinsBtn.addEventListener('click', () => {
        const spent = transactions.reduce((total, transaction) => total + transaction.amount, 0);
        customCoinsInput.value = Math.floor((initialRewards - spent) * coinsPerDollar);
        updateCustomConversion();
    });

    closeCustomModalBtn.addEventListener('click', () => {
        customAmountModal.classList.add('hidden');
    });

    customExchangeBtn.addEventListener('click', () => {
        amountInput.value = customCoinsInput.value;
        customAmountModal.classList.add('hidden');
        exchangeForm.requestSubmit();
    });

    exchangeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const recipient = usernameInput.value.trim();
        const coins = Number(amountInput.value);
        const spent = transactions.reduce((total, transaction) => total + transaction.amount, 0);
        const availableRewards = initialRewards - spent;

        if (!recipient) {
            exchangeError.textContent = 'Enter a TikTok username.';
            return;
        }

        if (!Number.isFinite(coins) || coins <= 0) {
            exchangeError.textContent = 'Enter a valid amount.';
            return;
        }

        if (coins > availableRewards * coinsPerDollar) {
            exchangeError.textContent = 'The amount is greater than your available rewards.';
            return;
        }

        const transaction = {
            amount: coins / coinsPerDollar,
            coins: Math.round(coins),
            recipient: recipient.startsWith('@') ? recipient : `@${recipient}`,
            date: formatDate(new Date())
        };

        sendButton.disabled = true;
        closeExchangeBtn.disabled = true;
        sendButton.classList.add('is-loading');
        sendLabel.textContent = 'Sending...';
        loadingSpinner.setAttribute('aria-label', 'Loading');

        setTimeout(() => {
            transactions.unshift(transaction);
            localStorage.setItem(storageKey, JSON.stringify(transactions));
            renderBalance();
            renderTransactions();

            document.getElementById('receiptRecipient').textContent = transaction.recipient;
            document.getElementById('receiptCoins').textContent = `${transaction.coins.toLocaleString('en-US')} Coins`;
            document.getElementById('receiptAmount').textContent = formatMoney(transaction.amount);
            document.getElementById('receiptTime').textContent = transaction.date;
            document.getElementById('successSummary').innerHTML = `You exchanged for <img class="coin-icon" src="images/moneda2-v2.png" alt=""> ${transaction.coins.toLocaleString('en-US')} Coins`;
            exchangeScreen.classList.add('hidden');
            successScreen.classList.remove('hidden');
            sendButton.disabled = false;
            closeExchangeBtn.disabled = false;
            sendButton.classList.remove('is-loading');
            sendLabel.textContent = 'Exchange';
        }, 3000);
    });

    goBackBtn.addEventListener('click', () => {
        successScreen.classList.add('hidden');
        resetSuccessDetails();
    });
});