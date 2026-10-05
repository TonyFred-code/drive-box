# Changelog

All notable changes to the Drive Box Application will be documented in
this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Before Release V1

### Added

- Added user email/username authentication
- Added directory functionality: create, delete, rename
- Added file functionality: upload, delete, rename

## [1.0.0] - 2026-09-28

### Added

- Added file upload limits per user
- Added user storage quota and usage tracking

## [1.1.0] - 2026-09-30

### Added

- Implemented closure of modals (dialogs) based on open order when clicking
  the escape key (closing only the top most at a time)

### Changed

- File upload dialog now clears selected files on closing it (with escape or button).

## [1.2.0] - 2026-09-30

### Changed

- Improved user interface of register and login pages
- Corrected size of sandbox declared in landing page

## [1.3.0] - 2026-10-05

### Changed

- Updated file upload response structure to allow viewing the upload result (success/failed) in one
  tabbed-view dialog

## Added

- Ensured user can add more files to selected files.

## [1.4.0] - 2026010-05

### Added

- Included client-side validation for file upload
