/**
 * ⚠️ DEPRECATED - Use validations folder instead
 *
 * This file has been moved to organized validation modules.
 * Update your imports from:
 *   const { schema } = require("../utils/validationSchemas");
 * To:
 *   const { schema } = require("../validations");
 *
 * New structure:
 *   server/validations/
 *   ├── projectValidations.js
 *   ├── taskValidations.js
 *   ├── surveyValidations.js
 *   ├── invitationValidations.js
 *   ├── messageValidations.js
 *   ├── excalidrawValidations.js
 *   └── index.js (centralized export)
 */

throw new Error(
  "DEPRECATED: Use require('../validations') instead of require('../utils/validationSchemas')"
);

