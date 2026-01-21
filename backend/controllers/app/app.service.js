import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();


const API_KEY = process.env.GODADDY_API_KEY;
const API_SECRET = process.env.GODADDY_API_SECRET;

const DOMAIN =  process.env.DOMAIN_NAME;    
const IP_ADDRESS = process.env.IP_ADDRESS;     




export const createSubdomain = async (subDomain) => {

  console.log("Creating subdomain:", API_KEY, API_SECRET, subDomain, IP_ADDRESS, DOMAIN);  
  const url = `https://api.godaddy.com/v1/domains/${DOMAIN}/records/A/goku`;

  const body = [
    {
      data: IP_ADDRESS,
      ttl: 600
    }
  ];

  try {
    await axios.put(url, body, {
      headers: {
        Authorization: `sso-key ${API_KEY}:${API_SECRET}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ Subdomain created successfully");
  } catch (err) {
    console.error("❌ Error creating subdomain:", err);
    throw new Error(`Failed to create subdomain: ${err}`);
  }
}




