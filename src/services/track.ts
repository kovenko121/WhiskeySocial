import { Analytics } from 'aws-amplify';

const track = (name: string, attributes = {}) =>
  Analytics.record({
    name,
    attributes,
  });

export { track };
