const bip39 = require('bip39');
const { Keypair } = require('@solana/web3.js');
const { Account } = require('eth-lib/lib');
const rl = require('readline-sync');
const XLSX = require('xlsx');
const ethutils = require('ethereum-mnemonic-privatekey-utils');
const { ethers } = require('ethers');

async function createWallet(type, numWords) {
  const mnemonic = bip39.generateMnemonic(256, null, bip39.wordlists[numWords]);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const solanaKeypair = Keypair.generate();
  solanaKeypair.secretKey = seed.slice(0, 32);
  const evmPrivateKey = '0x' + ethutils.getPrivateKeyFromMnemonic(mnemonic);
  const evmAccount = Account.fromPrivate(evmPrivateKey);
  const starknetWallet = new ethers.Wallet(evmPrivateKey);
  return {
    'Solana Address': solanaKeypair.publicKey.toBase58(),
    'Solana SecretKey': solanaKeypair.secretKey.toString(),
    'EVM Address': evmAccount.address.toLowerCase(),
    'EVM PrivateKey': evmPrivateKey,
    'Starknet Address': starknetWallet.address,
    'Starknet PrivateKey': starknetWallet.privateKey,
    'Mnemonic': mnemonic
  };
}

async function generateWallets(n, type) {
  const numWords = rl.question('[#] Mau generate mnemonic dengan 12 atau 24 kata?: ');
  const wallets = [];
  for (let i = 1; i <= n; i++) {
    const wallet = await createWallet(type, numWords);
    wallets.push({
      'Akun': i,
      'Solana Address': wallet['Solana Address'],
      'Solana SecretKey': wallet['Solana SecretKey'],
      'EVM Address': wallet['EVM Address'],
      'EVM PrivateKey': wallet['EVM PrivateKey'],
      'Starknet Address': wallet['Starknet Address'],
      'Starknet PrivateKey': wallet['Starknet PrivateKey'],
      'Mnemonic': wallet['Mnemonic']
    });
  }
  const filename = rl.question('[#] Masukkan nama file untuk menyimpan wallets (termasuk .xls): ');
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(wallets);
  XLSX.utils.book_append_sheet(wb, ws, 'Wallets');
  XLSX.writeFile(wb, filename + '.xls');
}

(async () => {
  console.log(` +-----------------------------------------+`);
  console.log(` |                                         |`);
  console.log(` |              Create Wallet              |`);
  console.log(` |                                         |`);
  console.log(` +-----------------------------------------+`);
  const n = rl.question('[#] Berapa Banyak Wallet Yang Mau dibuat: ');
  console.log('\n');
  await generateWallets(n);
})();