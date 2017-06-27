# Dekinai [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/eab00b1242e84e65b130e58b082ae1c6)](https://www.codacy.com/app/johann.rekowski/Dekinai?utm_source=github.com&utm_medium=referral&utm_content=HitomiTenshi/Dekinai&utm_campaign=Badge_Coverage)
Dekinai is a highly configurable self-hosted file storage server.

Dekinai will only work with **Node JS 8.1.0** or higher, due to `util.promisify` usage.

## QuickStart
```
git clone https://github.com/HitomiTenshi/Dekinai.git
cd Dekinai
npm install
npm start
```

You can change the server configuration in the `config.json` file, which is located in the root folder after running `npm install`.

## Production Setup (WIP)
Documentation in progress

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
