# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

-

## [1.5.1] - 2026-01-21

### Fixed

- Disabled category delete button doesn't gray out the whole button

## [1.5.0] - 2026-01-21

### Added

- Button to delete media in media preview
- Improved popup (warning, role selection) closing options
- Category import and export functionality

### Changed

- Category delete button now seamlessly connects to category name input

## [1.4.1] - 2026-01-20

### Fixed

- Unfinished boards can be exported but not imported

## [1.4.0] - 2026-01-20

### Added

- Option to add audio files to questions and answers

## [1.3.0] - 2026-01-20

### Added

- Option to add image files to questions and answers
- Option to export and import boards with images as zip

## [1.2.0] - 2026-01-18

### Added

- Visuals indicating invalid fields on board submission

### Fixed

- Negative row values are accepted when creating a board

## [1.1.0] - 2026-01-17

### Added

- Language switcher
- German language support
- Japanese language support (machine translated)

### Changed

- Improved navigation bar styling

### Fixed

- Visual bug where questions could be selected using tab despite another question being active

## [1.0.1] - 2026-01-15

### Added

- Changelog

### Changed

- Internal UI refactor: migrated renderer-adapter-based UI to Svelte
- Introduced Prettier for consistent code formatting
- Version number is now derived from package.json

## [1.0.0] - 2026-01-14

### Added

- Initial release

[unreleased]: https://github.com/Braincoke24/QuizBoard/compare/v1.5.1...HEAD
[1.5.1]: https://github.com/Braincoke24/QuizBoard/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/Braincoke24/QuizBoard/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/Braincoke24/QuizBoard/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/Braincoke24/QuizBoard/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Braincoke24/QuizBoard/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Braincoke24/QuizBoard/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Braincoke24/QuizBoard/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/Braincoke24/QuizBoard/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Braincoke24/QuizBoard/releases/tag/v1.0.0
