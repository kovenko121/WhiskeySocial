const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// fmt's base.h unconditionally defines FMT_CONSTEVAL=consteval when compiled with C++20,
// overriding any -D flag. Compiling with C++17 prevents __cpp_lib_is_constant_evaluated
// from being defined, which forces FMT_USE_CONSTEVAL=0 and disables consteval.
const FMT_FIX = [
  '',
  '    # Fix fmt build errors with Xcode 16+ (consteval + C++20 incompatibility)',
  '    installer.pods_project.targets.each do |target|',
  "      if target.name == 'fmt'",
  '        target.build_configurations.each do |config|',
  "          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'",
  '        end',
  '      end',
  '    end',
].join('\n');

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withFmtFix = (config) =>
  withDangerousMod(config, [
    'ios',
    (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      if (!podfile.includes("'CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'")) {
        podfile = podfile.replace(
          /(\s+react_native_post_install\([\s\S]*?\n\s+\))/,
          `$1${FMT_FIX}`
        );
        fs.writeFileSync(podfilePath, podfile);
      }

      return modConfig;
    },
  ]);

module.exports = withFmtFix;
