/**
 * Test script for external report creation endpoint
 *
 * Usage: node test-external-report.js
 *
 * Make sure to set the EXTERNAL_API_KEY environment variable
 * and the endpoint now expects image_base64 instead of image_path.
 */

const fs = require("fs");
const path = require("path");

async function testExternalReportCreation() {
  const API_KEY = process.env.EXTERNAL_API_KEY;
  const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!API_KEY) {
    console.error("Please set EXTERNAL_API_KEY environment variable");
    process.exit(1);
  }

  // Create a simple test image (1x1 pixel PNG in base64 for testing)
  const testImageBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

  // Create test payload
  const testPayload = {
    image_id: `test-${Date.now()}`,
    image_base64: testImageBase64, // Use the test base64 image
    latitude: 19.4326,
    longitude: -99.1332,
    detected_damages: JSON.stringify([
      {
        class: "Potholes",
        confidence: 0.85,
        bbox: [100, 150, 200, 250],
      },
    ]),
    timestamp: new Date().toISOString(),
    confidence_scores: JSON.stringify([0.85]),
    address: "Test Address, Mexico City",
  };

  try {
    console.log("Testing external report creation...");
    console.log("Payload:", JSON.stringify(testPayload, null, 2));

    const response = await fetch(`${BASE_URL}/api/reports/external`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(testPayload),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Success!");
      console.log("Response:", JSON.stringify(result, null, 2));
    } else {
      console.log("❌ Error:", response.status, response.statusText);
      console.log("Response:", JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

// Run the test
testExternalReportCreation();
