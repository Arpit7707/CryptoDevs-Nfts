import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useRef, useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { providers, Contract, utils } from "ethers";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants/index";

export default function Home() {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);

  //keeping track of whether presale ended or not
  const [presaleEnded, setPresaleEnded] = useState(false);

  // keeping tract of whether preSale started or not
  const [presaleStarted, setPresaleStarted] = useState(true);

  //keeping track of whether wallet is connected or not
  const [walletConnected, setwalletConnected] = useState(false);

  //keeping track of howmany tokens are minted
  const [numTokenMinted, setNumTokenMinted] = useState("");

  const web3ModalRef = useRef(); //reference using useRef hook

  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();

      // Get instace of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      //this will return you bignumber because it is declared as uinr256 in smart contract
      const numTokenIds = await nftContract.tokenIds();
      setNumTokenMinted(numTokenIds.toString()); //we convert bignumber into string and store it
    } catch (err) {
      console.error(err);
    }
  };

  //minting nft to whitelisted account in presale period
  const presaleMint = async () => {
    setLoading(true);

    try {
      const signer = await getProviderOrSigner(true);

      // Get instace of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      //in smart contract, this function dosen't need any argument but as we are sending ethers with this line,
      // we need to add value as object in parameter
      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.005"),
      });
      await txn.wait();
      alert("You Successfully Minted a CryptoDev! Congratulations!");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const publicMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      // Get instace of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      //in smart contract, this function dosen't need any argument but as we are sending ethers with this line,
      // we need to add value as object in parameter
      const txn = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();
      alert("You Successfully M inted a CryptoDev! Congratulations!");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      // Get instace of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const owner = await nftContract.owner();
      const userAddress = await signer.getAddress();

      if (owner.toLowerCase() == userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startPresale = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.startPresale();
      await txn.wait();

      setPresaleStarted(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();

      // Get instace of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      //this will return a bigNumber
      //this will return a timestamp in seconds
      const presaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000; //dividing it by 1000 coz Date.now() returns value in miliseconds

      //if this returns true, presale is ended
      const hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      ); //bignumber function to check whether number is lesser
      setPresaleEnded(hasPresaleEnded);
    } catch (err) {
      console.error(err);
    }
  };

  //check if presale started
  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();

      // Get instace of NFT contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);

      return isPresaleStarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner(); //will return provider because by default needSigner is false
      setwalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    //first we need to get access to the provider and signer using metamask

    const provider = await web3ModalRef.current.connect();
    //above line will popup metamask and after entering password wallet will be connected

    const web3Provider = new providers.Web3Provider(provider);
    //now we can use some nice function which "ethers" have and defaul provider don't

    //if the user is not connected to goerli then tell them to connect to goerli
    const { chainId } = await web3Provider.getNetwork(); //getting network information from web3Provider using ethers
    if (chainId != 5) {
      window.alert("Please Switch to Goerli network");
      throw new Error("Incorrect network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const onPageLoad = async () => {
    //calling connectWallet() and checkIfPresaleStarted() here rathertahn coz they both are async functions and have to add
    //await and in useEffect hook we can't declare function as async

    //calling connectWallet() after initializing web3Modal
    await connectWallet();
    //after wallet connection, you need to check if presale is started or not

    await getOwner(); //isOwner field will be set or reset accordingly and we can use that in our code for another operations

    const presaleStarted = await checkIfPresaleStarted(); //when first time page loads, it should return false

    if (presaleStarted) {
      await checkIfPresaleEnded(); //checking if presale already ended when user enters
    }
    await getNumMintedTokens();

    //track in real time the number of minted nfts
    setInterval(async () => {
      await getNumMintedTokens();
    }, 5 * 1000);

    //track in real time status of presale(started/ended/ongoing)
    setInterval(async () => {
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 5 * 1000);
  };

  //<-------------------Statring of code------------->
  //hook to run this function when "page loads first time" or any value change happen in dependencies array
  useEffect(() => {
    if (!walletConnected) {
      //initializig web3Modal reference storing it in reference
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      onPageLoad();
    }
  }, []);

  const renderBody = () => {
    //if wallet is not conncted
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Your Wallet
        </button>
      );
    }

    if (loading) {
      return <span className={styles.description}>Loading...</span>;
    }

    //if entrant is owner of contract and presale is not started yet...
    if (isOwner && !presaleStarted) {
      //render a button to start a presale
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale
        </button>
      );
    }

    //if entrant is not owner and presale is not started yet
    // we will not add isOwner in if statement coz we have separate case for that
    if (!presaleStarted) {
      //say presale isn't started yet, come back later
      return (
        <div>
          <span className={styles.description}>
            Presale has not started yet, You can comeback later
          </span>
        </div>
      );
    }

    //presale is on going
    if (presaleStarted && !presaleEnded) {
      //allow users to mint in presale and they need to be whitelist for it
      return (
        <div className={styles.division}>
          <span className={styles.description}>
            Presale has started. If you are whitelisted, you can mint CryptoDev
          </span>

          <button className={styles.button} onClick={presaleMint}>
            Presale Mint
          </button>
        </div>
      );
    }

    if (presaleEnded) {
      //allow users to take part in public sale
      return (
        <div className={styles.description}>
          <span className={styles.description}>
            Presale has Ended. You can mint Care-Protocol in Public sell if any
            remain.
          </span>
          <button className={styles.button} onClick={publicMint}>
            Public Mint
          </button>
        </div>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Care-Protocol NFT</title>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for getting access to Care-Proocol.
          </div>
          <div className={styles.description}>
            {numTokenMinted}/20 have been minted
          </div>
          <div>{renderBody()}</div>
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Arpit</footer>
    </div>
  );
}
