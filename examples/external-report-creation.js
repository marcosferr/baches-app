/**
 * Example payload for creating reports from externa/**
 * Data Mapping:
 *
 * External System -> Baches App
 * - image_base64 -> picture (stored directly as base64)
 * - latitude/longitude -> Stored directly as coordinates
 * - detected_damages -> Used to generate description and determine severity
 * - timestamp -> Used for creation time (optional)
 * - confidence_scores -> Stored in metadata (optional)
 * - address -> Stored directly (optional)
 *
 * Severity Determination:
 * - HIGH: Average confidence > 0.8 OR damage count > 3
 * - MEDIUM: Average confidence > 0.6 OR damage count > 1
 * - LOW: Everything else
 */em
 *
 * POST /api/reports/external
 *
 * Headers required:
 * - Content-Type: application/json
 * - x-api-key: YOUR_API_KEY (set EXTERNAL_API_KEY in environment variables)
 *
 * This endpoint accepts detection data from your road damage detection system
 * and automatically creates reports in the baches-app system.
 */

const examplePayload = {
  "image_id": "550e8400-e29b-41d4-a716-446655440000",
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "latitude": 19.4326,
  "longitude": -99.1332,
  "detected_damages": JSON.stringify([
    {
      "class": "Potholes",
      "confidence": 0.85,
      "bbox": [100, 150, 200, 250]
    },
    {
      "class": "Longitudinal Crack",
      "confidence": 0.72,
      "bbox": [50, 300, 400, 320]
    }
  ]),
  "timestamp": "2024-09-07T10:30:00Z",
  "confidence_scores": JSON.stringify([0.85, 0.72]),
  "address": "Av. Insurgentes Sur 123, Ciudad de México"
};

/**
 * Expected Response:
 * {
 *   "success": true,
 *   "report": {
 *     "id": "clx123abc456def",
 *     "status": "SUBMITTED",
 *     "severity": "HIGH",
 *     "latitude": 19.4326,
 *     "longitude": -99.1332,
 *     "createdAt": "2024-09-07T10:30:00Z"
 *   },
 *   "detection_metadata": {
 *     "image_id": "550e8400-e29b-41d4-a716-446655440000",
 *     "damage_count": 2,
 *     "damage_types": ["Potholes", "Longitudinal Crack"],
 *     "avg_confidence": 0.785,
 *     "timestamp": "2024-09-07T10:30:00Z"
 *   }
 * }
 */

/**
 * Data Mapping:
 *
 * External System -> Baches App
 * - image_path -> Converted to base64 and stored as picture
 * - latitude/longitude -> Stored directly as coordinates
 * - detected_damages -> Used to generate description and determine severity
 * - timestamp -> Used for creation time (optional)
 * - confidence_scores -> Stored in metadata (optional)
 * - address -> Stored directly (optional)
 *
 * Severity Determination:
 * - HIGH: Average confidence > 0.8 OR damage count > 3
 * - MEDIUM: Average confidence > 0.6 OR damage count > 1
 * - LOW: Everything else
 *
 * The system automatically:
 * 1. Converts the image file to base64
 * 2. Determines severity based on detection confidence
 * 3. Generates a descriptive text from detection results
 * 4. Creates the report with an external system user
 * 5. Notifies administrators
 * 6. Creates timeline entries
 */
