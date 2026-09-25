/**
 * Early logger for diagnosing Hermes "property is not configurable" errors
 *
 * This wrapper intercepts Object.defineProperty calls to log failures
 * before Hermes throws the error. This helps identify which property
 * definition is causing duplicate enum export issues (e.g., ProofType).
 *
 * The logger wraps the native Object.defineProperty method and logs:
 * - Property name that failed to be defined
 * - Object constructor name where the failure occurred
 * - Property descriptor that was attempted
 *
 * Only loaded in non-production environments via metro.config.js polyfill.
 * Has minimal performance impact as it only logs on actual failures.
 */
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function defineProperty(obj, prop, desc) {
  try {
    return originalDefineProperty(obj, prop, desc);
  } catch (e) {
    const name = obj && obj.constructor && obj.constructor.name;
    console.error('[DP fail]', String(prop), 'on', name, desc);
    throw e;
  }
};
