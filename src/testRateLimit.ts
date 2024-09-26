import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";
const TOTAL_REQUESTS = 150;
const INTERVAL_MS = 100;

async function sendRequest(requestNumber: number) {
  try {
    const response = await fetch(BASE_URL);
    console.log(`Request ${requestNumber}: Status ${response.status}`);
    if (!response.ok) {
      console.log(`Response: ${await response.text()}`);
    }
  } catch (error) {
    console.error(`Request ${requestNumber} failed:`, error);
  }
}

async function runTest() {
  console.log(
    `Starting rate limit test: ${TOTAL_REQUESTS} requests, ${INTERVAL_MS}ms apart`
  );

  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    await sendRequest(i);
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }

  console.log("Test completed");
}

runTest();
