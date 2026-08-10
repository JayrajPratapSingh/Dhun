// Single source of truth for the displayed app version. Reading package.json
// keeps the UI from drifting out of sync with the build, which is what left the
// Profile footer showing 1.0.0 after the app had moved on.
// Keep this in step with versionName in android/app/build.gradle.
import {version} from '../../package.json';

export const APP_VERSION = version;
