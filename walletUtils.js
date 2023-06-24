const ethers = require('ethers');

// Test mnemonic - Kindly do not transfer real assets to this account
const mnemonic = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';

const createPrivateKeyList = (num = 5, mn = mnemonic, index = 0, path = "m/44'/60'/0'/0/") => {
  let accounts = [];
  let i;
  for (i = 0; i < num; i++) {
    // @ts-ignore
    accounts.push(ethers.Wallet.fromMnemonic(mn, path + i).privateKey);
  }
  return accounts;
};

const makeSignerList = (num = 1, mn = mnemonic, index = 0, path = "m/44'/60'/0'/0/") => {
  let accounts = [];
  let i;
  for (i = 0; i < num; i++) {
    // @ts-ignore
    accounts.push(ethers.Wallet.fromMnemonic(mn, path + i));
  }
  return accounts;
};

const localWallet = (b, num = 1, mn = mnemonic, index = 0, path = "m/44'/60'/0'/0/") => {
  const hdW = createPrivateKeyList(num, mn, index, path);
  let lW = [];
  let i;
  for (i = 0; i < hdW.length; i++) {
    // @ts-ignore
    lW.push({ privateKey: hdW[i], balance: b });
  }
  return lW;
};

const ganacheWallet = (b, num = 1, mn = mnemonic, index = 0, path = "m/44'/60'/0'/0/") => {
  const hdW = createPrivateKeyList(num, mn, index, path);
  let lW = [];
  let i;
  for (i = 0; i < hdW.length; i++) {
    // @ts-ignore
    lW.push({ secretKey: hdW[i], balance: b });
  }
  return lW;
};

module.exports = {
    createPrivateKeyList,
    makeSignerList,
    localWallet,
    ganacheWallet
}