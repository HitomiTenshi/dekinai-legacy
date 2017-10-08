# Dekinai [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/eab00b1242e84e65b130e58b082ae1c6)](https://www.codacy.com/app/johann.rekowski/Dekinai?utm_source=github.com&utm_medium=referral&utm_content=HitomiTenshi/Dekinai&utm_campaign=Badge_Coverage) [![Build Status](https://travis-ci.org/HitomiTenshi/Dekinai.svg?branch=master)](https://travis-ci.org/HitomiTenshi/Dekinai) [![Build status](https://ci.appveyor.com/api/projects/status/grse53o3jc48jrhx/branch/master?svg=true)](https://ci.appveyor.com/project/HitomiTenshi/dekinai/branch/master)
Dekinai is a highly configurable self-hosted file storage server.

## Production Setup

Download the latest release from [here](https://github.com/HitomiTenshi/Dekinai/releases/latest) and execute `dekinai.exe` (`dekinai` on Linux). You can change the server configuration in the `config.json` file.

## Alternative Setup

If you are using a Mac or an x86 platform which currently are not covered by the release binaries, you can setup the app by using Node.js.

**Attention:** Dekinai will only work with **Node.js 8.1.0** or higher, due to `util.promisify` usage.

Install Node.js from [here](https://nodejs.org). Choose a version that is higher than **8.1.0**. Node.js already comes with `npm`.

Install [PM2](https://github.com/Unitech/pm2) to manage Node.js apps
```
$ npm install pm2 -g
```

Clone the repository
```
$ git clone https://github.com/HitomiTenshi/Dekinai.git
$ cd Dekinai
```

Install dependencies and run the release script
```
$ npm install
$ npm run release
```

Start the bundled and minified app via PM2
```
$ pm2 start dekinai.min.js
```

Save and add the PM2 process list to your server boot up
```
$ pm2 save
$ pm2 startup
```

PM2 should now tell you to execute a line with sudo, do that to start dekinai with your server.

If you want to be on the safe side, execute the `pm2` commands as a different user with less privileges, then run the sudo line with an admin user. PM2 will then startup dekinai with that user.

Make sure that the user with less privileges can still read / write to the `uploadDir` and `dekinaiDir` folders that are defined in your `config.json` if you do that.

## Project Goals
- Be as minimalistic as possible while maintaining code readability
- Offer a wide range of configuration options
- Allow users to set their own configuration during uploads
- 100% code coverage

## Features
Dekinai is split into two main configuration aspects: `Host` and `User`.

The `Host` for example can set default / min / max settings, while the `User` can send their own values during a file upload within min / max constraints, overriding the default settings set by the `Host`.

The `Host` can also choose to force a default setting, denying any custom settings sent by the `User`.

### Summary
- General
  - Dekinai is just a server and does not come with any UI or Website
  - You can plug Dekinai into any existing website
  - Designed for use with productivity tools like [Sharex](https://getsharex.com/)
- Temporary storage
  - `Host` / `User` can choose whether to store files temporary or permanent
  - `Host` can define min / max / default values for the storage duration
  - `User` can request their own storage duration within min / max constraints
  - `Host` can force permanent or temporary storage
  - `Host` can force the storage duration
- Uploaded filename
  - `Host` can define min / max / default values for the randomly generated filename lenght
  - `User` can choose how long a randomly generated filename should be within min / max constraints
  - `Host` / `User` can choose whether to append their original filename to the randomly generated filename
  - `Host` can choose a separator between the randomly generated filename and the appended filename
- Strict mode (`Host` only)
  - Allows the server to be either lenient or strict when parsing user defined settings during a file upload
  - Using strict is recommended, as it will abort the file upload and show an error message when custom settings from the `User` are invalid
  - Disabling strict will cause default values to be silently used in case of invalid `User` settings
- Support for blacklisting certain file types (`Host` only)
