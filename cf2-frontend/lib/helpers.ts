import { ethers } from "ethers"
import { ICF2_CONFIG } from "./config";

type getContract = (
    eip1193Provider: ethers.Eip1193Provider,
    cf2_config: ICF2_CONFIG,
    abi: ethers.InterfaceAbi
) => Promise<ethers.Contract>

export const getContract: getContract = async (eip1193Provider, cf2_Config, abi) => {
    // create instance of BrowserProvider first
    const browserProvider = new ethers.BrowserProvider(eip1193Provider);
    // create a signer
    const signer = await browserProvider.getSigner();
    // get contract runner
    const cf2Contract = new ethers.Contract(cf2_Config.CF2_ADDRESS as string, abi, signer)
    return cf2Contract;
}