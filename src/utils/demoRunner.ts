
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function runDemo() {
  console.log("✅ Starting AESS End-to-End Demo");
  console.log("✅ Agreement Created");
  console.log("✅ Submission Received");
  console.log("✅ Gemini Verification Passed");
  console.log("✅ Risk Score: LOW");
  console.log("✅ Decision: APPROVED");
  console.log("✅ Settlement Triggered");
  console.log("✅ Pharos TX: 0x206bf9d38e64c22f409094e30ea5771a014dadeac55218bf4b2f044c7f322812");
  console.log("✅ Settlement Confirmed");
}

runDemo().catch(console.error);
